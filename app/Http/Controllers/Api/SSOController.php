<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OAuthAuthorizationCode;
use App\Models\OAuthClient;
use App\Models\OAuthAccessToken;
use App\Services\SSOService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SSOController extends Controller
{
    public function __construct(private SSOService $sso) {}

    /**
     * GET /api/oauth/authorize
     * Validate the authorization request and return client info for the consent UI.
     * Called by the React consent page before showing the approve/deny form.
     */
    public function validateAuthorize(Request $request): JsonResponse
    {
        $params = $request->validate([
            'client_id'             => 'required|string',
            'redirect_uri'          => 'required|url',
            'response_type'         => 'required|string',
            'scope'                 => 'required|string',
            'state'                 => 'nullable|string',
            'code_challenge'        => 'nullable|string',
            'code_challenge_method' => 'nullable|string|in:S256,plain',
        ]);

        if ($params['response_type'] !== 'code') {
            return response()->json(['error' => 'unsupported_response_type'], 400);
        }

        $client = OAuthClient::where('client_id', $params['client_id'])
            ->where('is_active', true)
            ->first();

        if (!$client) {
            return response()->json(['error' => 'invalid_client'], 400);
        }

        if (!$client->isRedirectUriAllowed($params['redirect_uri'])) {
            return response()->json(['error' => 'invalid_redirect_uri'], 400);
        }

        $scopes = array_filter(explode(' ', $params['scope']));
        foreach ($scopes as $scope) {
            if (!$client->isScopeAllowed($scope)) {
                return response()->json(['error' => 'invalid_scope', 'scope' => $scope], 400);
            }
        }

        return response()->json([
            'client' => [
                'name'         => $client->name,
                'description'  => $client->description,
                'logo_url'     => $client->logo_url,
                'homepage_url' => $client->homepage_url,
            ],
            'scopes'       => $scopes,
            'redirect_uri' => $params['redirect_uri'],
        ]);
    }

    /**
     * POST /api/oauth/authorize
     * User approves or denies the authorization request.
     * Requires Sanctum auth (user must be logged into Aurai).
     */
    public function approve(Request $request): JsonResponse
    {
        $params = $request->validate([
            'client_id'             => 'required|string',
            'redirect_uri'          => 'required|url',
            'scope'                 => 'required|string',
            'state'                 => 'nullable|string',
            'code_challenge'        => 'nullable|string',
            'code_challenge_method' => 'nullable|string|in:S256,plain',
            'approved'              => 'required|boolean',
        ]);

        $redirectUri = $params['redirect_uri'];
        $state = $params['state'] ?? null;

        if (!$params['approved']) {
            $url = $this->buildRedirectUrl($redirectUri, [
                'error'             => 'access_denied',
                'error_description' => 'The user denied the authorization request.',
                'state'             => $state,
            ]);
            return response()->json(['redirect_to' => $url]);
        }

        $client = OAuthClient::where('client_id', $params['client_id'])
            ->where('is_active', true)
            ->first();

        if (!$client || !$client->isRedirectUriAllowed($redirectUri)) {
            return response()->json(['error' => 'invalid_client'], 400);
        }

        $scopes = array_values(array_filter(explode(' ', $params['scope'])));

        $code = Str::random(64);

        OAuthAuthorizationCode::create([
            'code'                  => $code,
            'user_id'               => $request->user()->id,
            'client_id'             => $client->id,
            'scopes'                => $scopes,
            'redirect_uri'          => $redirectUri,
            'code_challenge'        => $params['code_challenge'] ?? null,
            'code_challenge_method' => $params['code_challenge_method'] ?? null,
            'expires_at'            => now()->addSeconds($this->sso->getAuthCodeTtl()),
        ]);

        $url = $this->buildRedirectUrl($redirectUri, array_filter([
            'code'  => $code,
            'state' => $state,
        ]));

        return response()->json(['redirect_to' => $url]);
    }

    /**
     * POST /api/oauth/token
     * Exchange authorization code or refresh token for access token.
     * Called server-to-server (no Sanctum auth required).
     */
    public function token(Request $request): JsonResponse
    {
        $grantType = $request->input('grant_type');

        return match ($grantType) {
            'authorization_code' => $this->handleAuthCodeGrant($request),
            'refresh_token'      => $this->handleRefreshTokenGrant($request),
            default              => response()->json(['error' => 'unsupported_grant_type'], 400),
        };
    }

    private function handleAuthCodeGrant(Request $request): JsonResponse
    {
        $params = $request->validate([
            'code'          => 'required|string',
            'redirect_uri'  => 'required|string',
            'client_id'     => 'required|string',
            'client_secret' => 'nullable|string',
            'code_verifier' => 'nullable|string',
        ]);

        $client = $this->resolveClient($request, $params['client_id'], $params['client_secret'] ?? null);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $authCode = OAuthAuthorizationCode::where('code', $params['code'])
            ->where('used', false)
            ->first();

        if (!$authCode || $authCode->client_id !== $client->id) {
            return response()->json(['error' => 'invalid_grant'], 400);
        }

        if ($authCode->isExpired()) {
            $authCode->delete();
            return response()->json(['error' => 'invalid_grant', 'error_description' => 'Authorization code expired.'], 400);
        }

        if ($authCode->redirect_uri !== $params['redirect_uri']) {
            return response()->json(['error' => 'invalid_grant', 'error_description' => 'Redirect URI mismatch.'], 400);
        }

        // Verify PKCE if challenge was set
        if ($authCode->code_challenge) {
            if (empty($params['code_verifier'])) {
                return response()->json(['error' => 'invalid_grant', 'error_description' => 'code_verifier required.'], 400);
            }
            if (!$this->sso->verifyCodeChallenge(
                $params['code_verifier'],
                $authCode->code_challenge,
                $authCode->code_challenge_method ?? 'plain'
            )) {
                return response()->json(['error' => 'invalid_grant', 'error_description' => 'code_verifier mismatch.'], 400);
            }
        }

        // Mark code as used (single-use)
        $authCode->update(['used' => true]);

        $tokens = $this->sso->issueAccessToken($client, $authCode->user, $authCode->scopes);

        return response()->json($tokens);
    }

    private function handleRefreshTokenGrant(Request $request): JsonResponse
    {
        $params = $request->validate([
            'refresh_token' => 'required|string',
            'client_id'     => 'required|string',
            'client_secret' => 'nullable|string',
        ]);

        $client = $this->resolveClient($request, $params['client_id'], $params['client_secret'] ?? null);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $tokens = $this->sso->refreshAccessToken($params['refresh_token'], $client);
        if (!$tokens) {
            return response()->json(['error' => 'invalid_grant', 'error_description' => 'Refresh token invalid or expired.'], 400);
        }

        return response()->json($tokens);
    }

    /**
     * GET /api/oauth/userinfo
     * Returns the authenticated user's profile.
     * Bearer token must be an Aurai SSO-issued JWT.
     */
    public function userinfo(Request $request): JsonResponse
    {
        $token = $this->extractBearerToken($request);
        if (!$token) {
            return response()->json(['error' => 'invalid_token'], 401);
        }

        $claims = $this->sso->decodeAccessToken($token);
        if (!$claims) {
            return response()->json(['error' => 'invalid_token'], 401);
        }

        $user = \App\Models\User::find($claims['sub']);
        if (!$user || !$user->is_active) {
            return response()->json(['error' => 'invalid_token'], 401);
        }

        $scopes = explode(' ', $claims['scope'] ?? '');

        $info = ['sub' => (string) $user->id];

        if (in_array('email', $scopes) || in_array('openid', $scopes)) {
            $info['email'] = $user->email;
            $info['email_verified'] = !is_null($user->email_verified_at);
        }

        if (in_array('profile', $scopes)) {
            $info['name'] = $user->name;
            $info['picture'] = $user->avatar;
            $info['preferred_username'] = $user->email;
        }

        return response()->json($info);
    }

    /**
     * POST /api/oauth/revoke
     * Revoke an access or refresh token.
     */
    public function revoke(Request $request): JsonResponse
    {
        $token = $request->input('token');
        $tokenTypeHint = $request->input('token_type_hint', 'access_token');

        if (!$token) {
            return response()->json(['error' => 'invalid_request'], 400);
        }

        if ($tokenTypeHint === 'refresh_token') {
            $this->sso->revokeRefreshToken($token);
        } else {
            // Try to decode as JWT and revoke by JTI
            $claims = $this->sso->decodeAccessToken($token);
            if ($claims && isset($claims['jti'])) {
                $this->sso->revokeByJti($claims['jti']);
            }
        }

        // RFC 7009: always return 200
        return response()->json([], 200);
    }

    /**
     * GET /api/oauth/jwks  or  GET /.well-known/jwks.json
     */
    public function jwks(): JsonResponse
    {
        return response()->json($this->sso->getJwks())
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * GET /.well-known/openid-configuration
     */
    public function discovery(): JsonResponse
    {
        return response()->json($this->sso->getDiscoveryDocument())
            ->header('Cache-Control', 'public, max-age=3600');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function resolveClient(Request $request, string $clientId, ?string $clientSecret): OAuthClient|JsonResponse
    {
        // Check HTTP Basic auth as fallback
        if (!$clientSecret && $request->getUser()) {
            $clientId = $request->getUser();
            $clientSecret = $request->getPassword();
        }

        $client = OAuthClient::where('client_id', $clientId)
            ->where('is_active', true)
            ->first();

        if (!$client) {
            return response()->json(['error' => 'invalid_client'], 401);
        }

        if ($client->is_confidential) {
            if (!$clientSecret) {
                return response()->json(['error' => 'invalid_client', 'error_description' => 'client_secret required.'], 401);
            }
            // The stored secret is encrypted; compare via Hash::check won't work for encrypted.
            // We store the raw secret encrypted. Decrypt and compare.
            try {
                $stored = $client->getRawOriginal('client_secret');
                // The model decrypts via cast; compare the decrypted value
                if (!hash_equals($client->client_secret, $clientSecret)) {
                    return response()->json(['error' => 'invalid_client'], 401);
                }
            } catch (\Throwable $e) {
                return response()->json(['error' => 'invalid_client'], 401);
            }
        }

        return $client;
    }

    private function extractBearerToken(Request $request): ?string
    {
        $header = $request->header('Authorization', '');
        if (str_starts_with($header, 'Bearer ')) {
            return substr($header, 7);
        }
        return null;
    }

    private function buildRedirectUrl(string $base, array $params): string
    {
        $params = array_filter($params, fn($v) => $v !== null);
        return $base . (str_contains($base, '?') ? '&' : '?') . http_build_query($params);
    }
}
