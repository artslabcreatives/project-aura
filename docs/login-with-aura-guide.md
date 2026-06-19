# Login with Aura Integration Guide

This guide explains how to integrate **"Login with Aura"** single sign-on (SSO) into third-party client applications. 

Aura provides two integration mechanisms:
1. **OAuth2 / OpenID Connect (OIDC)**: The industry-standard protocol, ideal for modern frontend-backend architectures, Node.js, NestJS, React, Python, Java, etc.
2. **Custom URL Signature SSO**: A lightweight HMAC-SHA256 signature mechanism, ideal for fast, direct redirects and PHP/Laravel applications.

Additionally, Aura supports a **User Synchronization Webhook** to push real-time profile updates (creation, updates, roles, department) to downstream applications.

---

## 1. OAuth2 / OpenID Connect (OIDC) Integration

Aura acts as an OIDC Identity Provider (IdP) using standard OpenID Connect specifications.

### OIDC Discovery & Endpoints

Aura exposes an OIDC discovery document at `/.well-known/openid-configuration`.

- **Issuer URL**: `https://<your-aura-domain>`
- **Authorization Endpoint**: `https://<your-aura-domain>/sso/authorize`
- **Token Endpoint**: `https://<your-aura-domain>/api/oauth/token`
- **UserInfo Endpoint**: `https://<your-aura-domain>/api/oauth/userinfo`
- **JWKS Endpoint**: `https://<your-aura-domain>/.well-known/jwks.json`
- **Supported Scopes**: `openid`, `profile`, `email`
- **Supported Response Types**: `code` (Authorization Code Flow)
- **Supported Code Challenge Methods**: `S256` (PKCE)
- **Supported Token Signing Algorithms**: `RS256`

---

### Step-by-Step Flow

#### Step 1: Client Application Registration
Register your client application in the Aura Admin Panel under **SSO Applications**:
1. Go to **SSO Applications** in the Aura Sidebar.
2. Click **Create Application**.
3. Provide a recognizable name and the exact redirect URIs (e.g. `https://myapp.com/auth/callback`).
4. Save the application and securely copy the generated **Client ID** and **Client Secret**.

#### Step 2: Redirect User to Aura Authorization Page
Redirect the user from your frontend to the Aura Authorization Endpoint.

```http
GET https://<your-aura-domain>/sso/authorize?
    response_type=code
    &client_id=<YOUR_CLIENT_ID>
    &redirect_uri=<YOUR_REDIRECT_URI>
    &scope=openid profile email
    &state=<RANDOM_CSRF_STATE>
    &code_challenge=<PKCE_CODE_CHALLENGE>
    &code_challenge_method=S256
```

- **PKCE (Highly Recommended)**: Generate a random string `code_verifier`, hash it using SHA-256, and base64url-encode it to create the `code_challenge`.

#### Step 3: Authorization Code Exchange
Upon successful authentication, Aura redirects the user to your `<YOUR_REDIRECT_URI>` with `code` and `state` parameters:

```http
GET https://myapp.com/auth/callback?code=def502...&state=xyz123
```

Verify that the `state` matches your original CSRF token. Then, POST the authorization code to the Aura Token Endpoint using **Form Urlencoded** content type:

```http
POST https://<your-aura-domain>/api/oauth/token
Content-Type: application/x-www-form-urlencoded
Accept: application/json

grant_type=authorization_code
&code=def502...
&client_id=<YOUR_CLIENT_ID>
&client_secret=<YOUR_CLIENT_SECRET>
&redirect_uri=<YOUR_REDIRECT_URI>
&code_verifier=<PKCE_CODE_VERIFIER>
```

Aura will respond with JSON containing the tokens:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "a1b2c3d4...",
  "scope": "openid profile email",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

#### Step 4: Fetch User Info or Verify ID Token Locally
To retrieve user details, you can either:
1. Make a GET request to the UserInfo endpoint:
   ```http
   GET https://<your-aura-domain>/api/oauth/userinfo
   Authorization: Bearer <access_token>
   Accept: application/json
   ```
   *Response:*
   ```json
   {
     "sub": "12345",
     "name": "John Doe",
     "email": "john.doe@company.com",
     "picture": "https://<your-aura-domain>/storage/avatars/johndoe.png",
     "preferred_username": "john.doe@company.com"
   }
   ```
2. Verify the `id_token` or `access_token` JWT locally using Aura's JWKS endpoint (`/.well-known/jwks.json`) and standard cryptographic libraries. Aura sign claims using `RS256` keys.

---

### Node.js (NestJS / TypeScript) Code Example

Below is a complete implementation example for Node.js using NestJS:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuraAuthService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Exchanges authorization code for tokens and fetches user info from Aura
   */
  async authenticateWithAura(code: string, codeVerifier?: string, redirectUri?: string) {
    const tokenUrl = this.config.getOrThrow<string>('AURA_SSO_TOKEN_URL');
    const clientId = this.config.getOrThrow<string>('AURA_SSO_CLIENT_ID');
    const clientSecret = this.config.get<string>('AURA_SSO_CLIENT_SECRET', '');
    const userinfoUrl = this.config.getOrThrow<string>('AURA_SSO_USERINFO_URL');
    const actualRedirectUri = redirectUri || this.config.getOrThrow<string>('AURA_SSO_REDIRECT_URI');

    // 1. Exchange authorization code for access token
    const bodyParams: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: actualRedirectUri,
    };
    
    if (clientSecret) {
      bodyParams.client_secret = clientSecret;
    }
    if (codeVerifier) {
      bodyParams.code_verifier = codeVerifier;
    }

    let tokenResponse: Response;
    try {
      tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams(bodyParams).toString(),
      });
    } catch (e: any) {
      throw new UnauthorizedException(`Failed to connect to Aura token endpoint: ${e.message}`);
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new UnauthorizedException(`Aura token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // 2. Fetch User Profile from Aura userinfo endpoint
    let userinfoResponse: Response;
    try {
      userinfoResponse = await fetch(userinfoUrl, {
        headers: { 
          Authorization: `Bearer ${accessToken}`, 
          Accept: 'application/json' 
        },
      });
    } catch (e: any) {
      throw new UnauthorizedException(`Failed to connect to Aura userinfo endpoint: ${e.message}`);
    }

    if (!userinfoResponse.ok) {
      const errorText = await userinfoResponse.text();
      throw new UnauthorizedException(`Failed to retrieve user info from Aura: ${errorText}`);
    }

    const profile = await userinfoResponse.json();
    
    return {
      tokens,
      user: {
        auraUserId: profile.sub,
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
      }
    };
  }
}
```

---

## 2. Custom URL Signature SSO (HMAC-SHA256)

For applications that need direct, simple redirection without performing back-and-forth OAuth exchanges, Aura supports signature-based auto-login.

### Mechanism
Aura initiates the SSO flow by redirecting the user to your client application's login endpoint with pre-signed query parameters.

### Query Parameters
- `aura_user_id`: The user's ID inside Aura.
- `email`: The user's email address.
- `ts`: Current Unix timestamp.
- `next`: The relative route to redirect the user after login (e.g. `/dashboard`).
- `sig`: HMAC-SHA256 signature of the payload.

### Signature Formula
The signature payload is built by joining parameters in this exact sequence, separated by pipe characters (`|`):
```text
payload = aura_user_id + "|" + email + "|" + timestamp + "|" + next
```
The signature is calculated using HMAC-SHA256 with a **Shared Secret Key**:
```text
sig = hmac_sha256(payload, secret_key)
```

---

### Laravel Integration Example

#### Step 1: Define Route
In `routes/web.php`:
```php
use App\Http\Controllers\AuraSsoController;

Route::get('/auth/sso/login', [AuraSsoController::class, 'login'])->name('sso.login');
```

#### Step 2: Implement Controller
Create `app/Http/Controllers/AuraSsoController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class AuraSsoController extends Controller
{
    private const MAX_AGE_SECONDS = 300; // 5-minute request validity

    // Safe redirect prefixes (prevents open-redirect vulnerabilities)
    private const ALLOWED_NEXT_PREFIXES = [
        '/dashboard',
        '/reports',
        '/projects',
        '/employee',
        '/admin',
        '/finance',
    ];

    public function login(Request $request): RedirectResponse
    {
        $auraUserId = (string) $request->query('aura_user_id', '');
        $email = (string) $request->query('email', '');
        $timestamp = (string) $request->query('ts', '');
        $next = (string) $request->query('next', '/dashboard');
        $signature = (string) $request->query('sig', '');

        // 1. Check required inputs (must have at least user ID or email)
        if ($auraUserId === '' && $email === '') {
            abort(403, 'Invalid SSO request: missing user identifier.');
        }

        if ($timestamp === '' || $signature === '') {
            abort(403, 'Invalid SSO request: missing required parameters.');
        }

        // 2. Validate request age
        if (!ctype_digit($timestamp) || abs(now()->timestamp - (int) $timestamp) > self::MAX_AGE_SECONDS) {
            abort(403, 'Expired or invalid SSO timestamp.');
        }

        // 3. Prevent Open Redirects
        if (!$this->isValidNext($next)) {
            abort(403, 'Invalid redirect path.');
        }

        // 4. Retrieve secret key from configuration
        $secret = (string) config('services.aura.sso_secret', '');
        if ($secret === '') {
            abort(403, 'SSO is not configured.');
        }

        // 5. Build and verify signature payload
        $payload = "{$auraUserId}|{$email}|{$timestamp}|{$next}";
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        
        if (!hash_equals($expectedSignature, $signature)) {
            abort(403, 'Invalid SSO signature.');
        }

        // 6. Find and log in the user (provision if necessary)
        $user = $this->findOrCreateUser($auraUserId, $email);
        if (!$user) {
            abort(403, 'User not found or authorization failed.');
        }

        Auth::login($user, true);

        return redirect()->to($next);
    }

    private function isValidNext(string $next): bool
    {
        if ($next === '' || !str_starts_with($next, '/') || str_starts_with($next, '//')) {
            return false;
        }

        foreach (self::ALLOWED_NEXT_PREFIXES as $prefix) {
            if ($next === $prefix || str_starts_with($next, $prefix . '/')) {
                return true;
            }
        }

        return false;
    }

    private function findOrCreateUser(string $auraUserId, string $email): ?User
    {
        // Find by Aura User ID
        if ($auraUserId !== '' && Schema::hasColumn('users', 'aura_user_id')) {
            $user = User::where('aura_user_id', $auraUserId)->first();
            if ($user) {
                return $user;
            }
        }

        // Fallback to email
        if ($email !== '') {
            $user = User::where('email', $email)->first();
            
            // Link account if user exists
            if ($user && $auraUserId !== '' && Schema::hasColumn('users', 'aura_user_id')) {
                $user->update(['aura_user_id' => $auraUserId]);
            }
            return $user;
        }

        return null;
    }
}
```

---

## 3. Real-time User Synchronization Webhook

To keep client databases synchronized with changes in Aura (e.g. name changes, department changes, role promotions, or user suspension), Aura sends webhook sync payloads.

### Webhook Specification
- **Method**: `POST`
- **Authorization Header**: `x-sync-secret` (Custom shared secret)
- **Content-Type**: `application/json`

### Payload Schema
```json
{
  "id": "12345",
  "email": "john.doe@company.com",
  "name": "John Doe",
  "department": "Finance",
  "role": "admin",
  "status": "active"
}
```

### Handler Processing Logic (Pseudocode)
1. Verify the incoming request header: `x-sync-secret` matches the shared configuration token.
2. Query user by `id` (Aura ID) or `email`.
3. If user exists:
   - Update `name`, `email`, `department`, `role`, and `status`.
4. If user does not exist:
   - Create user database record using the provided details.
5. Return a `200 OK` JSON response:
   ```json
   {
     "success": true,
     "message": "User john.doe@company.com synchronized successfully"
   }
   ```
