<?php

namespace App\Services;

use App\Models\ZohoToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ZohoAuthService
{
    protected $clientId;
    protected $clientSecret;
    protected $redirectUri;
    protected $accountsUrl;

    public function __construct()
    {
        $this->clientId = config('services.zoho.client_id');
        $this->clientSecret = config('services.zoho.client_secret');
        $this->redirectUri = config('services.zoho.redirect_uri');
        $this->accountsUrl = config('services.zoho.accounts_url', 'https://accounts.zoho.com');
    }

    public function getAuthUrl($state = null)
    {
        $scopes = [
            'ZohoMail.messages.ALL',
            'ZohoMail.accounts.READ',
            'ZohoMail.folders.ALL',
        ];

        $params = [
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'scope' => implode(',', $scopes),
            'redirect_uri' => $this->redirectUri,
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => $state,
        ];

        return $this->accountsUrl . '/oauth/v2/auth?' . http_build_query($params);
    }

    public function exchangeCodeForTokens($code, $userId)
    {
        $response = Http::asForm()->post($this->accountsUrl . '/oauth/v2/token', [
            'code' => $code,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if ($response->failed()) {
            Log::error('Zoho OAuth Token Exchange Failed', ['response' => $response->json()]);
            return false;
        }

        $data = $response->json();

        return ZohoToken::updateOrCreate(
            ['user_id' => $userId],
            [
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? null,
                'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
            ]
        );
    }

    public function refreshToken(ZohoToken $token)
    {
        if (!$token->refresh_token) {
            return false;
        }

        $response = Http::asForm()->post($this->accountsUrl . '/oauth/v2/token', [
            'refresh_token' => $token->refresh_token,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            Log::error('Zoho OAuth Token Refresh Failed', ['response' => $response->json()]);
            return false;
        }

        $data = $response->json();

        $token->update([
            'access_token' => $data['access_token'],
            'expires_at' => Carbon::now()->addSeconds($data['expires_in']),
        ]);

        return $token;
    }

    public function getValidToken($userId)
    {
        $token = ZohoToken::where('user_id', $userId)->first();

        if (!$token) {
            return null;
        }

        if ($token->expires_at->isPast()) {
            return $this->refreshToken($token);
        }

        return $token;
    }
}
