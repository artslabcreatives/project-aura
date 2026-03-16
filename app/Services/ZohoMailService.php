<?php

namespace App\Services;

use App\Models\Email;
use App\Models\ZohoToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZohoMailService
{
    protected $authService;
    protected $mailUrl;

    public function __construct(ZohoAuthService $authService)
    {
        $this->authService = $authService;
        $this->mailUrl = config('services.zoho.mail_url', 'https://mail.zoho.com/api/v1');
    }

    protected function getHeaders($userId)
    {
        $token = $this->authService->getValidToken($userId);
        if (!$token) {
            return null;
        }

        return [
            'Authorization' => 'Zoho-oauthtoken ' . $token->access_token,
        ];
    }

    public function getAccounts($userId)
    {
        $headers = $this->getHeaders($userId);
        if (!$headers) return null;

        $response = Http::withHeaders($headers)->get($this->mailUrl . '/accounts');
        Log::debug('Zoho Mail Get Accounts Response', ['status' => $response->status(), 'body' => $response->json()]);
        
        if ($response->failed()) {
            Log::error('Zoho Mail Get Accounts Failed', ['response' => $response->json()]);
            return [];
        }

        return $response->json()['data'] ?? [];
    }

    public function getFolders($userId, $accountId)
    {
        $headers = $this->getHeaders($userId);
        if (!$headers) return [];

        $url = $this->mailUrl . "/accounts/{$accountId}/folders";
        Log::debug('Zoho Mail Get Folders URL', ['url' => $url, 'accountId' => $accountId]);
        $response = Http::withHeaders($headers)->get($url);

        if ($response->failed()) {
            Log::error('Zoho Mail Get Folders Failed', ['response' => $response->json(), 'url' => $url]);
            return [];
        }

        return $response->json()['data'] ?? [];
    }

    public function getMessages($userId, $accountId, $folderId, $params = [])
    {
        $headers = $this->getHeaders($userId);
        if (!$headers) return [];

        $params['folderId'] = $folderId;
        $params['limit'] = $params['limit'] ?? 50;
        $url = $this->mailUrl . "/accounts/{$accountId}/messages/view";
        $response = Http::withHeaders($headers)->get($url, $params);

        if ($response->failed()) {
            Log::error('Zoho Mail Get Messages Failed', ['response' => $response->json(), 'url' => $url]);
            return [];
        }

        return $response->json()['data'] ?? [];
    }

    public function getMessageBody($userId, $accountId, $folderId, $messageId)
    {
        $headers = $this->getHeaders($userId);
        if (!$headers) return null;

        $url = $this->mailUrl . "/accounts/{$accountId}/folders/{$folderId}/messages/{$messageId}/content";
        $response = Http::withHeaders($headers)->get($url);

        if ($response->failed()) {
            Log::error('Zoho Mail Get Message Content Failed', ['response' => $response->json(), 'url' => $url]);
            return null;
        }

        return $response->json()['data'] ?? null;
    }

    public function sendMessage($userId, $accountId, $data)
    {
        $headers = $this->getHeaders($userId);
        if (!$headers) return null;

        $url = $this->mailUrl . "/accounts/{$accountId}/messages";
        $response = Http::withHeaders($headers)->post($url, $data);

        if ($response->failed()) {
            Log::error('Zoho Mail Send Message Failed', ['response' => $response->json(), 'url' => $url]);
            return null;
        }

        return $response->json()['data'] ?? true;
    }
}
