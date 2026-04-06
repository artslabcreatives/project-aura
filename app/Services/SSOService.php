<?php

namespace App\Services;

use App\Models\OAuthAccessToken;
use App\Models\OAuthClient;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\JWK;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SSOService
{
    private const ACCESS_TOKEN_TTL = 3600;        // 1 hour
    private const REFRESH_TOKEN_TTL = 2592000;    // 30 days
    private const AUTH_CODE_TTL = 300;            // 5 minutes
    private const KEY_ALGO = 'RS256';

    private ?string $privateKey = null;
    private ?string $publicKey = null;
    private ?string $keyId = null;

    public function getPrivateKey(): string
    {
        if ($this->privateKey === null) {
            $path = storage_path('oauth/private.key');
            if (!file_exists($path)) {
                throw new \RuntimeException('SSO private key not found. Run: php artisan sso:generate-keys');
            }
            $this->privateKey = file_get_contents($path);
        }
        return $this->privateKey;
    }

    public function getPublicKey(): string
    {
        if ($this->publicKey === null) {
            $path = storage_path('oauth/public.key');
            if (!file_exists($path)) {
                throw new \RuntimeException('SSO public key not found. Run: php artisan sso:generate-keys');
            }
            $this->publicKey = file_get_contents($path);
        }
        return $this->publicKey;
    }

    public function getKeyId(): string
    {
        if ($this->keyId === null) {
            $this->keyId = substr(hash('sha256', $this->getPublicKey()), 0, 16);
        }
        return $this->keyId;
    }

    /**
     * Issue a signed JWT access token and store its JTI for revocation support.
     */
    public function issueAccessToken(OAuthClient $client, \App\Models\User $user, array $scopes): array
    {
        $jti = Str::uuid()->toString();
        $now = time();
        $expiresAt = $now + self::ACCESS_TOKEN_TTL;

        $payload = [
            'iss' => config('app.url'),
            'sub' => (string) $user->id,
            'aud' => $client->client_id,
            'iat' => $now,
            'exp' => $expiresAt,
            'jti' => $jti,
            'scope' => implode(' ', $scopes),
        ];

        // Add OIDC claims if openid scope requested
        if (in_array('openid', $scopes)) {
            $payload['email'] = $user->email;
        }
        if (in_array('profile', $scopes)) {
            $payload['name'] = $user->name;
            $payload['picture'] = $user->avatar;
        }

        $accessToken = JWT::encode($payload, $this->getPrivateKey(), self::KEY_ALGO, $this->getKeyId());

        // Generate refresh token
        $refreshToken = Str::random(64);
        $refreshExpiresAt = now()->addSeconds(self::REFRESH_TOKEN_TTL);

        OAuthAccessToken::create([
            'jti' => $jti,
            'user_id' => $user->id,
            'client_id' => $client->id,
            'scopes' => $scopes,
            'refresh_token' => hash('sha256', $refreshToken),
            'expires_at' => now()->addSeconds(self::ACCESS_TOKEN_TTL),
            'refresh_token_expires_at' => $refreshExpiresAt,
        ]);

        // Build ID token if openid scope
        $idToken = null;
        if (in_array('openid', $scopes)) {
            $idToken = $this->issueIdToken($client, $user, $scopes, $jti);
        }

        return [
            'access_token' => $accessToken,
            'token_type' => 'Bearer',
            'expires_in' => self::ACCESS_TOKEN_TTL,
            'refresh_token' => $refreshToken,
            'scope' => implode(' ', $scopes),
            'id_token' => $idToken,
        ];
    }

    /**
     * Issue an OIDC ID token.
     */
    private function issueIdToken(OAuthClient $client, \App\Models\User $user, array $scopes, string $atHash): string
    {
        $now = time();
        $payload = [
            'iss' => config('app.url'),
            'sub' => (string) $user->id,
            'aud' => $client->client_id,
            'iat' => $now,
            'exp' => $now + self::ACCESS_TOKEN_TTL,
            'email' => $user->email,
            'email_verified' => !is_null($user->email_verified_at),
        ];

        if (in_array('profile', $scopes)) {
            $payload['name'] = $user->name;
            $payload['picture'] = $user->avatar;
            $payload['preferred_username'] = $user->email;
        }

        return JWT::encode($payload, $this->getPrivateKey(), self::KEY_ALGO, $this->getKeyId());
    }

    /**
     * Decode and validate an SSO access token. Returns null if invalid/revoked.
     */
    public function decodeAccessToken(string $token): ?array
    {
        try {
            $decoded = (array) JWT::decode($token, new Key($this->getPublicKey(), self::KEY_ALGO));

            // Check revocation
            if (isset($decoded['jti'])) {
                $record = OAuthAccessToken::where('jti', $decoded['jti'])->first();
                if (!$record || $record->revoked) {
                    return null;
                }
            }

            return $decoded;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Revoke all tokens associated with a JTI.
     */
    public function revokeByJti(string $jti): void
    {
        OAuthAccessToken::where('jti', $jti)->update(['revoked' => true]);
    }

    /**
     * Revoke a refresh token (by hashed value).
     */
    public function revokeRefreshToken(string $refreshToken): ?OAuthAccessToken
    {
        $hashed = hash('sha256', $refreshToken);
        $record = OAuthAccessToken::where('refresh_token', $hashed)->first();
        if ($record) {
            $record->update(['revoked' => true]);
        }
        return $record;
    }

    /**
     * Exchange a refresh token for a new access token.
     */
    public function refreshAccessToken(string $refreshToken, OAuthClient $client): ?array
    {
        $hashed = hash('sha256', $refreshToken);
        $record = OAuthAccessToken::where('refresh_token', $hashed)
            ->where('client_id', $client->id)
            ->where('revoked', false)
            ->first();

        if (!$record || $record->refresh_token_expires_at->isPast()) {
            return null;
        }

        // Rotate: revoke old, issue new
        $record->update(['revoked' => true]);

        return $this->issueAccessToken($client, $record->user, $record->scopes);
    }

    /**
     * Verify PKCE code challenge.
     */
    public function verifyCodeChallenge(string $verifier, string $challenge, string $method): bool
    {
        if ($method === 'S256') {
            $computed = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
            return hash_equals($challenge, $computed);
        }
        // plain
        return hash_equals($challenge, $verifier);
    }

    /**
     * Generate auth code TTL.
     */
    public function getAuthCodeTtl(): int
    {
        return self::AUTH_CODE_TTL;
    }

    /**
     * Return the public key in JWKS format.
     */
    public function getJwks(): array
    {
        $publicKey = openssl_pkey_get_public($this->getPublicKey());
        $details = openssl_pkey_get_details($publicKey);
        $rsa = $details['rsa'];

        return [
            'keys' => [
                [
                    'kty' => 'RSA',
                    'use' => 'sig',
                    'alg' => self::KEY_ALGO,
                    'kid' => $this->getKeyId(),
                    'n' => rtrim(strtr(base64_encode($rsa['n']), '+/', '-_'), '='),
                    'e' => rtrim(strtr(base64_encode($rsa['e']), '+/', '-_'), '='),
                ],
            ],
        ];
    }

    /**
     * Return the OIDC discovery document.
     */
    public function getDiscoveryDocument(): array
    {
        $base = config('app.url');
        return [
            'issuer' => $base,
            'authorization_endpoint' => $base . '/sso/authorize',
            'token_endpoint' => $base . '/api/oauth/token',
            'userinfo_endpoint' => $base . '/api/oauth/userinfo',
            'jwks_uri' => $base . '/.well-known/jwks.json',
            'revocation_endpoint' => $base . '/api/oauth/revoke',
            'response_types_supported' => ['code'],
            'subject_types_supported' => ['public'],
            'id_token_signing_alg_values_supported' => [self::KEY_ALGO],
            'scopes_supported' => ['openid', 'profile', 'email'],
            'token_endpoint_auth_methods_supported' => ['client_secret_post', 'client_secret_basic', 'none'],
            'claims_supported' => ['sub', 'iss', 'aud', 'exp', 'iat', 'name', 'email', 'picture', 'preferred_username'],
            'code_challenge_methods_supported' => ['S256', 'plain'],
            'grant_types_supported' => ['authorization_code', 'refresh_token'],
        ];
    }
}
