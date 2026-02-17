# Mattermost Plugin Auto-Login via JWT

This document explains how to implement iframe-based authentication for the Mattermost plugin using JWT (JSON Web Tokens).

## Overview

The Aura system provides a seamless auto-login mechanism for Mattermost plugin integration using JWT tokens. When users are authenticated in Aura, they can be automatically logged into Mattermost via an iframe without manual credential entry.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│ Aura Laravel│  ────▶  │  JWT Token   │  ────▶  │   Mattermost   │
│   Backend   │         │  Generation  │         │     Plugin     │
└─────────────┘         └──────────────┘         └────────────────┘
      │                        │                         │
      │ 1. User authenticated  │                         │
      │ 2. Generate JWT        │                         │
      │ 3. Redirect iframe ────────────────────────────▶ │
      │                                                  │
      │                                  4. Validate JWT │
      │                                  5. Auto-login   │
```

## Implementation

### 1. Environment Configuration

Add these variables to your `.env` file:

```env
# Mattermost Plugin Configuration
MATTERMOST_URL=https://collab.artslabcreatives.com
MATTERMOST_PLUGIN_ID=com.artslabcreatives.auraai
MATTERMOST_JWT_SECRET=your-shared-secret-key-here
```

**Important:** The `MATTERMOST_JWT_SECRET` must be the same secret key configured in your Mattermost plugin. This is used to sign and verify JWT tokens.

### 2. JWT Token Structure

The generated JWT contains the following claims:

```json
{
  "sub": "mattermost_user_id",
  "email": "user@example.com",
  "iss": "https://your-aura-domain.com",
  "exp": 1234567890
}
```

- **sub** (subject): The Mattermost user ID
- **email**: User's email address
- **iss** (issuer): The Aura application URL
- **exp** (expiration): Token expires 60 seconds after generation

### 3. API Endpoints

#### Get Auto-Login URL (API)

```http
GET /api/mattermost/plugin/auto-login-url
Authorization: Bearer {sanctum_token}
```

**Response:**
```json
{
  "url": "https://collab.artslabcreatives.com/plugins/com.artslabcreatives.auraai/auto-login?token={JWT}",
  "expires_at": "2024-01-15T10:30:00.000000Z"
}
```

#### Direct Auto-Login Redirect

```http
GET /api/mattermost/plugin/auto-login
Authorization: Bearer {sanctum_token}
```

This endpoint generates the JWT and redirects the user directly to the Mattermost plugin auto-login URL.

### 4. Frontend Integration

#### Option A: Iframe Implementation

Create an iframe in your frontend application:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mattermost Integration</title>
</head>
<body>
    <iframe 
        id="mattermost-frame"
        src="" 
        width="100%" 
        height="800px"
        style="border: none;"
    ></iframe>

    <script>
        // Fetch the auto-login URL from Aura API
        async function loadMattermost() {
            const response = await fetch('/api/mattermost/plugin/auto-login-url', {
                headers: {
                    'Authorization': 'Bearer ' + yourAuthToken,
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.url) {
                document.getElementById('mattermost-frame').src = data.url;
            }
        }

        // Load when page is ready
        loadMattermost();
    </script>
</body>
</html>
```

#### Option B: React/TypeScript Implementation

```typescript
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function MattermostIframe() {
  const [autoLoginUrl, setAutoLoginUrl] = useState<string>('');

  useEffect(() => {
    async function fetchAutoLoginUrl() {
      try {
        const response = await api.get('/api/mattermost/plugin/auto-login-url');
        setAutoLoginUrl(response.data.url);
      } catch (error) {
        console.error('Failed to get Mattermost auto-login URL:', error);
      }
    }

    fetchAutoLoginUrl();
  }, []);

  if (!autoLoginUrl) {
    return <div>Loading Mattermost integration...</div>;
  }

  return (
    <iframe
      src={autoLoginUrl}
      width="100%"
      height="800px"
      style={{ border: 'none' }}
      title="Mattermost Chat"
    />
  );
}
```

### 5. Security Considerations

#### Token Expiration
- JWT tokens expire after **60 seconds**
- This short lifetime prevents token reuse and enhances security
- Generate a new token for each login attempt

#### Secret Key Management
- Keep `MATTERMOST_JWT_SECRET` confidential
- Use a strong, randomly generated secret (minimum 32 characters)
- Never commit the secret to version control
- Rotate secrets periodically

#### HTTPS Only
- Always use HTTPS in production
- JWT tokens should never be transmitted over unencrypted connections

#### CORS Configuration
Ensure your Mattermost instance allows iframe embedding from your Aura domain. Add to Mattermost configuration:

```json
{
  "ServiceSettings": {
    "AllowCorsFrom": "https://your-aura-domain.com"
  }
}
```

### 6. Testing

#### Manual Testing

1. Authenticate in Aura application
2. Call the auto-login URL endpoint:
   ```bash
   curl -X GET "https://your-aura-domain.com/api/mattermost/plugin/auto-login-url" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json"
   ```
3. Copy the returned URL and open it in a browser
4. You should be automatically logged into Mattermost

#### Automated Testing

```php
// tests/Feature/MattermostAutoLoginTest.php
public function test_can_generate_auto_login_url()
{
    $user = User::factory()->create();
    $user->mattermost_id = 'test-mattermost-id';
    $user->save();

    $response = $this->actingAs($user)
        ->getJson('/api/mattermost/plugin/auto-login-url');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'url',
            'expires_at',
        ]);
}
```

### 7. Troubleshooting

#### "Failed to generate plugin auto-login URL"
- Check that `MATTERMOST_JWT_SECRET` is set in `.env`
- Verify `MATTERMOST_PLUGIN_ID` matches your plugin ID
- Ensure the user has a `mattermost_id` in the database

#### "Unauthorized" errors
- Verify the user is authenticated with Sanctum
- Check that the Bearer token is valid and not expired

#### JWT validation fails on Mattermost side
- Ensure `MATTERMOST_JWT_SECRET` matches on both sides
- Verify the token hasn't expired (check system time sync)
- Check that the Mattermost user ID exists

#### Iframe not loading
- Check browser console for CORS errors
- Verify X-Frame-Options headers allow iframe embedding
- Ensure HTTPS is used in production

### 8. Backend Implementation Details

#### MattermostService::generatePluginJWT()

```php
public function generatePluginJWT(User $user): ?string
{
    $secret = config('services.mattermost.jwt_secret');
    $mattermostUserId = $this->getMattermostUserId($user);

    $payload = [
        'sub' => $mattermostUserId,
        'email' => $user->email,
        'iss' => config('app.url'),
        'exp' => time() + 60, // 60 seconds
    ];

    return \Firebase\JWT\JWT::encode($payload, $secret, 'HS256');
}
```

#### MattermostService::generatePluginAutoLoginUrl()

```php
public function generatePluginAutoLoginUrl(User $user): ?string
{
    $jwt = $this->generatePluginJWT($user);
    $pluginId = config('services.mattermost.plugin_id');

    return "{$this->baseUrl}/plugins/{$pluginId}/auto-login?token={$jwt}";
}
```

## References

- [JWT.io](https://jwt.io/) - JWT debugging tool
- [Firebase PHP-JWT](https://github.com/firebase/php-jwt) - JWT library used
- [Laravel Sanctum](https://laravel.com/docs/sanctum) - API authentication
- [Mattermost Plugin Documentation](https://developers.mattermost.com/integrate/plugins/)

## Support

For issues or questions:
1. Check application logs: `storage/logs/laravel.log`
2. Review Mattermost plugin logs
3. Verify environment configuration
4. Contact the development team
