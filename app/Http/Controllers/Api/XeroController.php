<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\XeroService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class XeroController extends Controller
{
    private const OAUTH_STATE_TTL_MINUTES = 10;

    public function __construct(private XeroService $xeroService) {}

    /**
     * Return whether Xero is connected and basic metadata.
     */
    public function status(): JsonResponse
    {
        return response()->json($this->xeroService->getConnectionStatus());
    }

    /**
     * Generate and return the Xero OAuth2 authorisation URL.
     * The frontend redirects the user here to begin the OAuth flow.
     */
    public function getAuthUrl(Request $request): JsonResponse
    {
        $userId = $request->user()?->getAuthIdentifier();
        $nonce = Str::random(40);
        $state = $this->encodeState($userId, $nonce);

        Cache::put(
            $this->stateCacheKey($userId),
            $nonce,
            now()->addMinutes(self::OAUTH_STATE_TTL_MINUTES)
        );

        return response()->json([
            'url' => $this->xeroService->getAuthUrl($state),
        ]);
    }

    /**
     * Handle the Xero OAuth2 callback (public route — no auth middleware).
     * Exchanges the code for tokens and redirects back to the frontend.
     */
    public function callback(Request $request)
    {
        $code  = $request->query('code');
        $state = $request->query('state');

        // Validate state to prevent CSRF
        [$userId, $nonce] = $this->decodeState($state);
        $expected = $userId !== null ? Cache::pull($this->stateCacheKey($userId)) : null;

        if (!is_string($nonce) || !is_string($expected) || !hash_equals($expected, $nonce)) {
            return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=error&reason=state_mismatch');
        }

        if (!$code) {
            return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=error&reason=no_code');
        }

        try {
            $this->xeroService->handleCallback($code);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Xero callback error: ' . $e->getMessage());
            return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=error&reason=token_exchange');
        }

        return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=connected');
    }

    private function stateCacheKey(int|string|null $userId): string
    {
        return 'xero_oauth_state:' . $userId;
    }

    private function encodeState(int|string|null $userId, string $nonce): string
    {
        $payload = json_encode([
            'user_id' => $userId,
            'nonce' => $nonce,
        ], JSON_THROW_ON_ERROR);

        return rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');
    }

    /**
     * @return array{0: int|string|null, 1: string|null}
     */
    private function decodeState(?string $state): array
    {
        if (!is_string($state) || $state === '') {
            return [null, null];
        }

        $decoded = base64_decode(strtr($state, '-_', '+/'), true);

        if ($decoded === false) {
            return [null, null];
        }

        try {
            $payload = json_decode($decoded, true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return [null, null];
        }

        $userId = $payload['user_id'] ?? null;
        $nonce = $payload['nonce'] ?? null;

        if ((!is_int($userId) && !is_string($userId)) || !is_string($nonce) || $nonce === '') {
            return [null, null];
        }

        return [$userId, $nonce];
    }

    /**
     * Trigger a manual sync of Xero Contacts → local Clients.
     * Auto-merges contacts whose name matches an existing client (case-insensitive).
     * Creates new clients for contacts that have no local match.
     */
    public function syncClients(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero clients.'], 403);
        }

        try {
            $summary = $this->xeroService->syncClients($request->user()->id);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero clients synced successfully.',
            ...$summary,
        ]);
    }

    /**
     * Trigger a manual sync of Xero Quotes → local Estimates.
     * Returns a summary of the sync operation.
     */
    public function sync(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero estimates.'], 403);
        }

        try {
            $summary = $this->xeroService->syncEstimates($request->user()->id);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero estimates synced successfully.',
            ...$summary,
        ]);
    }

    /**
     * Trigger a manual sync of Xero Invoices → local Projects.
     * Returns a summary of the sync operation.
     */
    public function syncInvoices(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero invoices.'], 403);
        }

        try {
            $summary = $this->xeroService->syncInvoices();
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero invoices synced successfully.',
            ...$summary,
        ]);
    }
}
