<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AdProfile;
use App\Models\AdConnection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AdsIntegrationController extends Controller
{
    /**
     * Redirect to the OAuth provider.
     */
    public function redirect(Request $request, $platform, $profileId)
    {
        // Verify profile ownership
        $profile = AdProfile::where('id', $profileId)->where('user_id', Auth::id())->firstOrFail();

        // Generate a random state token and append the profile ID to it
        $stateToken = Str::random(40);
        $state = base64_encode(json_encode([
            'profile_id' => $profileId,
            'token' => $stateToken,
        ]));

        // Store state in session to verify on callback
        $request->session()->put('oauth_state_' . $platform, $stateToken);

        $url = '';

        switch ($platform) {
            case 'google':
                $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
                    'client_id' => env('GOOGLE_ADS_CLIENT_ID'),
                    'redirect_uri' => env('GOOGLE_ADS_REDIRECT_URI'),
                    'response_type' => 'code',
                    'scope' => 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/analytics.readonly',
                    'access_type' => 'offline',
                    'prompt' => 'consent',
                    'state' => $state,
                ]);
                break;

            case 'tiktok':
                $url = 'https://business-api.tiktok.com/portal/auth?' . http_build_query([
                    'app_id' => env('TIKTOK_APP_ID'),
                    'state' => $state,
                    'redirect_uri' => env('TIKTOK_REDIRECT_URI'),
                ]);
                break;

            case 'linkedin':
                $url = 'https://www.linkedin.com/oauth/v2/authorization?' . http_build_query([
                    'response_type' => 'code',
                    'client_id' => env('LINKEDIN_CLIENT_ID'),
                    'redirect_uri' => env('LINKEDIN_REDIRECT_URI'),
                    'state' => $state,
                    'scope' => 'r_ads r_ads_reporting',
                ]);
                break;

            default:
                abort(404, 'Platform not supported for OAuth.');
        }

        return response()->json(['url' => $url]);
    }

    /**
     * Disconnect a platform.
     */
    public function disconnect($profileId, $platform)
    {
        $profile = AdProfile::where('id', $profileId)->where('user_id', Auth::id())->firstOrFail();

        $profile->connections()->where('platform', $platform)->delete();

        return response()->json(['message' => 'Disconnected successfully.']);
    }

    /**
     * Handle API Key connection for SEMrush.
     */
    public function connectSemrush(Request $request, $profileId)
    {
        $profile = AdProfile::where('id', $profileId)->where('user_id', Auth::id())->firstOrFail();

        $request->validate([
            'api_key' => 'required|string',
        ]);

        // Simple validation check against SEMrush (optional, could just save it)
        $response = Http::get('https://api.semrush.com/', [
            'type' => 'domain_ranks',
            'key' => $request->api_key,
            'domain' => 'example.com',
            'database' => 'us'
        ]);

        if ($response->status() === 403 || str_contains($response->body(), 'ERROR')) {
            return response()->json(['message' => 'Invalid SEMrush API Key.'], 400);
        }

        // Save connection
        AdConnection::updateOrCreate(
            [
                'ad_profile_id' => $profile->id,
                'platform' => 'semrush',
            ],
            [
                'access_token' => $request->api_key,
                // SEMrush doesn't use refresh tokens or expiration for API keys in this context
            ]
        );

        return response()->json(['message' => 'SEMrush connected successfully.']);
    }

    /**
     * Generic callback for OAuth.
     * Note: This usually needs to be handled outside the standard `auth:sanctum` middleware 
     * if the user is redirected back from the provider, because the browser handles the redirect 
     * and might not send the sanctum token. But since this is a React SPA, the provider redirects 
     * to the frontend, and the frontend sends the code to this API endpoint.
     */
    public function callback(Request $request, $platform)
    {
        $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
        ]);

        $stateData = json_decode(base64_decode($request->state), true);

        if (!$stateData || !isset($stateData['profile_id'])) {
            return response()->json(['message' => 'Invalid state parameter.'], 400);
        }

        $profileId = $stateData['profile_id'];
        $profile = AdProfile::where('id', $profileId)->where('user_id', Auth::id())->firstOrFail();

        $tokens = [];

        switch ($platform) {
            case 'google':
                $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                    'client_id' => env('GOOGLE_ADS_CLIENT_ID'),
                    'client_secret' => env('GOOGLE_ADS_CLIENT_SECRET'),
                    'code' => $request->code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => env('GOOGLE_ADS_REDIRECT_URI'),
                ]);

                if ($response->failed()) {
                    return response()->json(['message' => 'Google OAuth failed.', 'error' => $response->json()], 400);
                }

                $tokens = $response->json();
                break;

            case 'tiktok':
                $response = Http::post('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', [
                    'app_id' => env('TIKTOK_APP_ID'),
                    'secret' => env('TIKTOK_APP_SECRET'),
                    'auth_code' => $request->code,
                    'grant_type' => 'authorization_code',
                ]);

                if ($response->failed() || $response->json('code') !== 0) {
                    return response()->json(['message' => 'TikTok OAuth failed.', 'error' => $response->json()], 400);
                }

                $tokens = $response->json('data');
                break;

            case 'linkedin':
                $response = Http::asForm()->post('https://www.linkedin.com/oauth/v2/accessToken', [
                    'grant_type' => 'authorization_code',
                    'code' => $request->code,
                    'redirect_uri' => env('LINKEDIN_REDIRECT_URI'),
                    'client_id' => env('LINKEDIN_CLIENT_ID'),
                    'client_secret' => env('LINKEDIN_CLIENT_SECRET'),
                ]);

                if ($response->failed()) {
                    return response()->json(['message' => 'LinkedIn OAuth failed.', 'error' => $response->json()], 400);
                }

                $tokens = $response->json();
                break;

            default:
                abort(404, 'Platform not supported.');
        }

        AdConnection::updateOrCreate(
            [
                'ad_profile_id' => $profile->id,
                'platform' => $platform,
            ],
            [
                'access_token' => $tokens['access_token'] ?? null,
                'refresh_token' => $tokens['refresh_token'] ?? null,
                'expires_at' => isset($tokens['expires_in']) ? now()->addSeconds($tokens['expires_in']) : null,
            ]
        );

        return response()->json(['message' => ucfirst($platform) . ' connected successfully.']);
    }
}
