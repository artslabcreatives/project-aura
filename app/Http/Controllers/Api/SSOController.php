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
use OpenApi\Attributes as OA;

class SSOController extends Controller
{
    public function __construct(private SSOService $sso) {}

    #[OA\Get(
        path: "/oauth/authorize",
        summary: "Validate OAuth authorization request",
        description: "Validates the authorization request parameters and returns client info for the consent UI. Public endpoint.",
        tags: ["SSO / OAuth"],
        parameters: [
            new OA\Parameter(name: "client_id", in: "query", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "redirect_uri", in: "query", required: true, schema: new OA\Schema(type: "string", format: "uri")),
            new OA\Parameter(name: "response_type", in: "query", required: true, schema: new OA\Schema(type: "string", enum: ["code"])),
            new OA\Parameter(name: "scope", in: "query", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "state", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "code_challenge", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "code_challenge_method", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["S256"])),
        ],
        responses: [
            new OA\Response(response: 200, description: "Client info for consent screen"),
            new OA\Response(response: 400, description: "Invalid request parameters"),
        ]
    )]
    public function validateAuthorize(Request $request): JsonResponse
    {
        $params = $request->validate([
            'client_id'             => 'required|string',
            'redirect_uri'          => 'required|url',
            'response_type'         => 'required|string',
            'scope'                 => 'required|string',
            'state'                 => 'nullable|string',
            'code_challenge'        => 'nullable|string',
            'code_challenge_method' => 'nullable|string|in:S256',
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

        $scopes = $this->parseAndValidateScopes($params['scope'], $client);
        if ($scopes instanceof JsonResponse) {
            return $scopes;
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

    #[OA\Post(
        path: "/oauth/authorize",
        summary: "Approve or deny OAuth authorization",
        description: "User approves or denies the OAuth consent screen. Requires Sanctum authentication.",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["client_id", "redirect_uri", "scope", "approved"],
                properties: [
                    new OA\Property(property: "client_id", type: "string"),
                    new OA\Property(property: "redirect_uri", type: "string", format: "uri"),
                    new OA\Property(property: "scope", type: "string"),
                    new OA\Property(property: "state", type: "string"),
                    new OA\Property(property: "code_challenge", type: "string"),
                    new OA\Property(property: "approved", type: "boolean"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Authorization code or denial redirect_uri"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function approve(Request $request): JsonResponse
    {
        $params = $request->validate([
            'client_id'             => 'required|string',
            'redirect_uri'          => 'required|url',
            'scope'                 => 'required|string',
            'state'                 => 'nullable|string',
            'code_challenge'        => 'nullable|string',
            'code_challenge_method' => 'nullable|string|in:S256',
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

        $scopes = $this->parseAndValidateScopes($params['scope'], $client);
        if ($scopes instanceof JsonResponse) {
            return $scopes;
        }

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

    #[OA\Post(
        path: "/oauth/token",
        summary: "Exchange code for access token",
        description: "Token endpoint (RFC 6749). Supports authorization_code and refresh_token grant types. Public endpoint — called server-to-server.",
        tags: ["SSO / OAuth"],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "grant_type", type: "string", enum: ["authorization_code", "refresh_token"]),
                    new OA\Property(property: "code", type: "string", description: "Authorization code (authorization_code grant)"),
                    new OA\Property(property: "redirect_uri", type: "string", format: "uri"),
                    new OA\Property(property: "client_id", type: "string"),
                    new OA\Property(property: "client_secret", type: "string"),
                    new OA\Property(property: "code_verifier", type: "string", description: "PKCE code verifier"),
                    new OA\Property(property: "refresh_token", type: "string"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Access token response"),
            new OA\Response(response: 400, description: "Invalid grant"),
        ]
    )]
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

        // Query by code first to detect replay attacks
        $authCode = OAuthAuthorizationCode::where('code', $params['code'])->first();

        if (!$authCode || $authCode->client_id !== $client->id) {
            return response()->json(['error' => 'invalid_grant'], 400);
        }

        // Detect replay: If the authorization code has already been used
        if ($authCode->used) {
            // Revoke all access/refresh tokens issued for this client/user
            OAuthAccessToken::where('user_id', $authCode->user_id)
                ->where('client_id', $authCode->client_id)
                ->update(['revoked' => true]);

            \Log::warning('SSO Auth Code Replay Detected: Revoking all active tokens for client_id ' . $client->id . ' and user_id ' . $authCode->user_id);

            return response()->json([
                'error'             => 'invalid_grant',
                'error_description' => 'Authorization code has already been used. All issued tokens have been revoked.',
            ], 400);
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
                $authCode->code_challenge_method ?? 'S256'
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

    #[OA\Get(
        path: "/oauth/userinfo",
        summary: "Get user info (OIDC)",
        description: "Returns the authenticated resource owner's profile. Bearer token must be an Aurai SSO-issued JWT.",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        responses: [
            new OA\Response(response: 200, description: "User profile claims"),
            new OA\Response(response: 401, description: "Invalid token"),
        ]
    )]
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

    #[OA\Post(
        path: "/oauth/revoke",
        summary: "Revoke OAuth token",
        description: "Revokes an access or refresh token (RFC 7009). Public endpoint.",
        tags: ["SSO / OAuth"],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "token", type: "string"),
                    new OA\Property(property: "token_type_hint", type: "string", enum: ["access_token", "refresh_token"]),
                ]
            )
        ),
        responses: [new OA\Response(response: 200, description: "Revoked (always 200 per RFC 7009)")]
    )]
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

    #[OA\Get(
        path: "/oauth/jwks",
        summary: "JWKS public keys",
        description: "Returns the JSON Web Key Set for verifying SSO-issued JWTs. Public endpoint.",
        tags: ["SSO / OAuth"],
        responses: [new OA\Response(response: 200, description: "JWKS document")]
    )]
    public function jwks(): JsonResponse
    {
        return response()->json($this->sso->getJwks())
            ->header('Cache-Control', 'public, max-age=3600');
    }

    #[OA\Get(
        path: "/openid-configuration",
        summary: "OpenID Connect discovery document",
        description: "Returns the OIDC discovery document (/.well-known/openid-configuration). Public endpoint.",
        tags: ["SSO / OAuth"],
        responses: [new OA\Response(response: 200, description: "OIDC discovery document")]
    )]
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

    /**
     * Parse, normalize, and validate request scopes.
     * Returns an array of clean, unique scopes, or a JsonResponse with an error.
     */
    private function parseAndValidateScopes(string $scopeString, OAuthClient $client): array|JsonResponse
    {
        // Enforce canonical scope character rules (only alphanumeric, underscores, hyphens, colons, and spaces)
        if (preg_match('/[^a-zA-Z0-9_\-:\s]/', $scopeString)) {
            return response()->json([
                'error'             => 'invalid_request',
                'error_description' => 'Scopes must be space-separated and contain only alphanumeric, hyphen, colon, or underscore characters.',
            ], 400);
        }

        // Normalize whitespaces
        $normalized = trim(preg_replace('/\s+/', ' ', $scopeString));
        if ($normalized === '') {
            return response()->json([
                'error'             => 'invalid_request',
                'error_description' => 'Scope parameter cannot be empty.',
            ], 400);
        }

        // Explode, filter, deduplicate
        $scopes = array_values(array_unique(array_filter(explode(' ', $normalized))));

        // Validate each scope is allowed for the client
        foreach ($scopes as $scope) {
            if (!$client->isScopeAllowed($scope)) {
                return response()->json([
                    'error' => 'invalid_scope',
                    'scope' => $scope,
                ], 400);
            }
        }

        return $scopes;
    }
}
