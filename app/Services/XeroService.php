<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Estimate;
use App\Models\EstimateItem;
use App\Models\XeroToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XeroService
{
    private const AUTH_BASE   = 'https://login.xero.com/identity/connect';
    private const TOKEN_URL   = 'https://identity.xero.com/connect/token';
    private const API_BASE    = 'https://api.xero.com/api.xro/2.0';
    private const CONNECT_URL = 'https://api.xero.com/connections';

    // Xero Quote status → local estimate status mapping
    private const STATUS_MAP = [
        'DRAFT'    => 'draft',
        'SENT'     => 'sent',
        'DECLINED' => 'rejected',
        'ACCEPTED' => 'approved',
        'INVOICED' => 'approved',
        'DELETED'  => 'rejected',
    ];

    private function clientId(): string
    {
        return config('services.xero.client_id', '');
    }

    private function clientSecret(): string
    {
        return config('services.xero.client_secret', '');
    }

    private function redirectUri(): string
    {
        return config('services.xero.redirect_uri', '');
    }

    private function scopes(): string
    {
        return trim((string) config('services.xero.scopes', 'accounting.invoices.read offline_access'));
    }

    /**
     * Generate the OAuth2 authorisation URL that redirects the user to Xero's login.
     */
    public function getAuthUrl(string $state): string
    {
        $params = http_build_query([
            'response_type' => 'code',
            'client_id'     => $this->clientId(),
            'redirect_uri'  => $this->redirectUri(),
            'scope'         => $this->scopes(),
            'state'         => $state,
        ]);

        return self::AUTH_BASE . '/authorize?' . $params;
    }

    /**
     * Exchange the authorisation code for access + refresh tokens,
     * fetch the connected tenant and persist everything.
     *
     * @throws \RuntimeException
     */
    public function handleCallback(string $code): XeroToken
    {
        $response = Http::asForm()->withBasicAuth($this->clientId(), $this->clientSecret())
            ->post(self::TOKEN_URL, [
                'grant_type'   => 'authorization_code',
                'code'         => $code,
                'redirect_uri' => $this->redirectUri(),
            ]);

        if ($response->failed()) {
            Log::error('Xero token exchange failed', ['body' => $response->body()]);
            throw new \RuntimeException('Xero token exchange failed: ' . $response->body());
        }

        $tokens = $response->json();

        // Fetch the tenant (organisation) this token belongs to
        $connections = Http::withToken($tokens['access_token'])
            ->get(self::CONNECT_URL)
            ->json();

        $tenant = $connections[0] ?? null;

        return XeroToken::updateOrCreate(
            ['tenant_id' => $tenant['tenantId'] ?? 'unknown'],
            [
                'tenant_name'      => $tenant['tenantName'] ?? null,
                'access_token'     => $tokens['access_token'],
                'refresh_token'    => $tokens['refresh_token'],
                'token_expires_at' => now()->addSeconds($tokens['expires_in']),
            ]
        );
    }

    /**
     * Refresh the stored access token using the refresh token.
     *
     * @throws \RuntimeException
     */
    public function refreshToken(XeroToken $token): XeroToken
    {
        $response = Http::asForm()->withBasicAuth($this->clientId(), $this->clientSecret())
            ->post(self::TOKEN_URL, [
                'grant_type'    => 'refresh_token',
                'refresh_token' => $token->refresh_token,
            ]);

        if ($response->failed()) {
            Log::error('Xero token refresh failed', ['body' => $response->body()]);
            throw new \RuntimeException('Xero token refresh failed. Please reconnect Xero.');
        }

        $tokens = $response->json();

        $token->update([
            'access_token'     => $tokens['access_token'],
            'refresh_token'    => $tokens['refresh_token'] ?? $token->refresh_token,
            'token_expires_at' => now()->addSeconds($tokens['expires_in']),
        ]);

        return $token->fresh();
    }

    /**
     * Return a valid (refreshed if necessary) access token string.
     *
     * @throws \RuntimeException if no token stored or refresh fails
     */
    public function getBearerToken(): string
    {
        $token = XeroToken::current();

        if (!$token) {
            throw new \RuntimeException('Xero is not connected. Please complete the OAuth2 flow first.');
        }

        if ($token->isExpired()) {
            $token = $this->refreshToken($token);
        }

        return $token->access_token;
    }

    /**
     * Fetch all Quotes from Xero and upsert them as local Estimates.
     *
     * Returns a summary array ['created' => int, 'updated' => int, 'skipped' => int].
     */
    public function syncEstimates(): array
    {
        $bearer = $this->getBearerToken();
        $token  = XeroToken::current();

        $response = Http::withToken($bearer)
            ->withHeaders(['Xero-tenant-id' => $token->tenant_id])
            ->get(self::API_BASE . '/Quotes', ['Status' => '']);

        if ($response->failed()) {
            Log::error('Xero Quotes fetch failed', ['body' => $response->body()]);
            throw new \RuntimeException('Failed to fetch Quotes from Xero: ' . $response->body());
        }

        $quotes  = $response->json('Quotes') ?? [];
        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($quotes as $quote) {
            try {
                $result = $this->upsertEstimate($quote);
                match ($result) {
                    'created' => $created++,
                    'updated' => $updated++,
                    default   => $skipped++,
                };
            } catch (\Throwable $e) {
                Log::warning('Failed to sync Xero Quote', [
                    'quote_id' => $quote['QuoteID'] ?? null,
                    'error'    => $e->getMessage(),
                ]);
                $skipped++;
            }
        }

        return compact('created', 'updated', 'skipped');
    }

    /**
     * Upsert a single Xero Quote into the local estimates table.
     *
     * @return string 'created' | 'updated' | 'skipped'
     */
    private function upsertEstimate(array $quote): string
    {
        $xeroId = $quote['QuoteID'] ?? null;
        if (!$xeroId) {
            return 'skipped';
        }

        $status    = self::STATUS_MAP[$quote['Status'] ?? ''] ?? 'draft';
        $clientId  = $this->resolveClientId($quote['Contact'] ?? []);
        $taxRate   = 0.0;
        $subtotal  = (float) ($quote['SubTotal'] ?? 0);
        $taxAmount = (float) ($quote['TotalTax'] ?? 0);
        $total     = (float) ($quote['Total'] ?? 0);

        if ($subtotal > 0 && $taxAmount > 0) {
            $taxRate = round($taxAmount / $subtotal * 100, 2);
        }

        $existing = Estimate::where('xero_estimate_id', $xeroId)->first();

        $data = [
            'xero_estimate_id'   => $xeroId,
            'estimate_number'    => $quote['QuoteNumber'] ?? null,
            'title'              => $this->resolveQuoteTitle($quote),
            'description'        => $this->nullableString($quote['Summary'] ?? null),
            'client_id'          => $clientId,
            'status'             => $status,
            'notes'              => $this->nullableString($quote['Terms'] ?? null),
            'issue_date'         => $this->parseXeroDate($quote['DateString'] ?? null),
            'valid_until'        => $this->parseXeroDate($quote['ExpiryDateString'] ?? null),
            'currency'           => $quote['CurrencyCode'] ?? 'USD',
            'tax_rate'           => $taxRate,
            'subtotal'           => $subtotal,
            'tax_amount'         => $taxAmount,
            'total'              => $total,
            'xero_last_synced_at' => now(),
        ];

        if ($existing) {
            $existing->update($data);
            $this->syncLineItems($existing, $quote['LineItems'] ?? []);
            return 'updated';
        }

        $estimate = Estimate::create($data);
        $this->syncLineItems($estimate, $quote['LineItems'] ?? []);
        return 'created';
    }

    private function resolveQuoteTitle(array $quote): string
    {
        $title = $this->nullableString($quote['Title'] ?? null);

        if ($title !== null) {
            return $title;
        }

        $quoteNumber = $this->nullableString($quote['QuoteNumber'] ?? null);

        if ($quoteNumber !== null) {
            return $quoteNumber;
        }

        return 'Xero Quote';
    }

    private function nullableString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }

    /**
     * Replace line items for an estimate with data from Xero.
     */
    private function syncLineItems(Estimate $estimate, array $lineItems): void
    {
        $estimate->items()->delete();

        foreach ($lineItems as $idx => $item) {
            $qty   = (float) ($item['Quantity'] ?? 1);
            $price = (float) ($item['UnitAmount'] ?? 0);

            $estimate->items()->create([
                'description' => $item['Description'] ?? '',
                'quantity'    => $qty,
                'unit_price'  => $price,
                'total'       => round($qty * $price, 2),
                'sort_order'  => $idx,
            ]);
        }
    }

    /**
     * Attempt to match a Xero Contact to a local Client by company name.
     * Returns null when no match is found.
     */
    private function resolveClientId(array $contact): ?int
    {
        $name = trim($contact['Name'] ?? '');
        if (!$name) {
            return null;
        }

        $client = Client::whereRaw('LOWER(company_name) = ?', [strtolower($name)])->first();
        return $client?->id;
    }

    /**
     * Parse Xero date strings like "2026-03-17T00:00:00" into "Y-m-d".
     */
    private function parseXeroDate(?string $dateString): ?string
    {
        if (!$dateString) {
            return null;
        }
        try {
            return \Carbon\Carbon::parse($dateString)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Check whether Xero has been connected (tokens stored).
     */
    public function isConnected(): bool
    {
        return XeroToken::current() !== null;
    }

    /**
     * Return metadata about the current Xero connection.
     */
    public function getConnectionStatus(): array
    {
        $token = XeroToken::current();
        if (!$token) {
            return ['connected' => false];
        }

        return [
            'connected'          => true,
            'tenant_name'        => $token->tenant_name,
            'tenant_id'          => $token->tenant_id,
            'token_expires_at'   => $token->token_expires_at,
            'token_is_expired'   => $token->isExpired(),
        ];
    }
}
