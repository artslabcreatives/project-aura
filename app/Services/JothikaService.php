<?php

namespace App\Services;

use App\Models\JothikaToken;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class JothikaService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.jothika.url', 'https://jothika.artslabcreatives.com');
    }

    /**
     * Get the Jothika API token for a user
     */
    public function getToken(User $user): ?JothikaToken
    {
        $token = JothikaToken::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if ($token && !$token->isValid()) {
            // Token expired or invalid
            $token->update(['is_active' => false]);
            return null;
        }

        return $token;
    }

    /**
     * Store a new Jothika API token for a user
     */
    public function storeToken(User $user, string $token, ?string $expiresAt = null): JothikaToken
    {
        // Deactivate old tokens
        JothikaToken::where('user_id', $user->id)->update(['is_active' => false]);

        return JothikaToken::create([
            'user_id' => $user->id,
            'access_token' => $token,
            'expires_at' => $expiresAt ? now()->parse($expiresAt) : null,
            'is_active' => true,
        ]);
    }

    /**
     * Create a reimbursement in Jothika
     * 
     * @param User $user The user creating the reimbursement
     * @param array $data Reimbursement data
     * @return array Response from Jothika API
     * @throws \Exception
     */
    public function createReimbursement(User $user, array $data): array
    {
        $token = $this->getToken($user);

        if (!$token) {
            throw new \Exception('No valid Jothika token found for user. Please connect your Jothika account.');
        }

        try {
            $response = Http::withToken($token->access_token)
                ->timeout(30)
                ->post("{$this->baseUrl}/api/reimbursements", $data);

            if ($response->successful()) {
                Log::info('Jothika reimbursement created', [
                    'user_id' => $user->id,
                    'reference' => $data['reference'] ?? null,
                    'amount' => $data['amount'] ?? null,
                ]);

                return $response->json();
            }

            // Handle specific error cases
            if ($response->status() === 409) {
                throw new \Exception('A reimbursement with this reference already exists in Jothika.');
            }

            if ($response->status() === 401) {
                // Token is invalid, deactivate it
                $token->update(['is_active' => false]);
                throw new \Exception('Jothika token is invalid. Please reconnect your Jothika account.');
            }

            if ($response->status() === 422) {
                $errors = $response->json('errors') ?? [];
                $errorMsg = collect($errors)->flatten()->first() ?? 'Validation error';
                throw new \Exception("Jothika validation error: {$errorMsg}");
            }

            throw new \Exception('Failed to create reimbursement in Jothika: ' . $response->body());

        } catch (RequestException $e) {
            Log::error('Jothika API request failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Failed to connect to Jothika. Please try again later.');
        }
    }

    /**
     * Build reimbursement data from project expense
     */
    public function buildReimbursementData(array $expenseData): array
    {
        return [
            'amount' => (float) $expenseData['amount'],
            'currency' => $expenseData['currency'] ?? 'USD',
            'description' => $expenseData['description'] ?? 'Project expense',
            'expense_date' => $expenseData['expense_date'] ?? now()->format('Y-m-d'),
            'client_name' => $expenseData['client_name'] ?? null,
            'is_cost_of_sales' => $expenseData['is_cost_of_sales'] ?? true,
            'reference' => $expenseData['reference'] ?? null,
        ];
    }

    /**
     * Check if a user has a valid Jothika token
     */
    public function hasValidToken(User $user): bool
    {
        $token = $this->getToken($user);
        return $token !== null;
    }

    /**
     * Revoke/deactivate a user's Jothika token
     */
    public function revokeToken(User $user): bool
    {
        return JothikaToken::where('user_id', $user->id)
            ->update(['is_active' => false]) > 0;
    }
}
