# Mattermost Plugin JWT Auto-Login Implementation

## Overview

This implementation adds JWT-based auto-login functionality for the Mattermost plugin integration. When a user is authenticated in Laravel, they can be automatically logged into the Mattermost plugin using a secure JWT token.

## Implementation Details

### 1. JWT Library

Installed `firebase/php-jwt` (version 7.0.2) for generating and signing JWT tokens.

### 2. Configuration

Added new configuration options to `config/services.php`:

```php
'mattermost' => [
    'url' => env('MATTERMOST_URL'),
    'token' => env('MATTERMOST_TOKEN'),
    'team_id' => env('MATTERMOST_TEAM_ID'),
    'api_key' => env('MATTERMOST_API_KEY'),
    'plugin_id' => env('MATTERMOST_PLUGIN_ID', 'com.artslabcreatives.auraai'),
    'jwt_secret' => env('MATTERMOST_JWT_SECRET'),
],
```

### 3. Environment Variables

Added to `.env`:

```env
MATTERMOST_PLUGIN_ID=com.artslabcreatives.auraai
MATTERMOST_JWT_SECRET=your-shared-secret-key-here
```

**Important:** Replace `your-shared-secret-key-here` with the actual shared secret key that matches your Mattermost plugin configuration.

### 4. Service Methods

Added two new methods to `MattermostService`:

#### `generatePluginJWT(User $user): ?string`

Generates a JWT token with the following payload:
- `sub`: Mattermost user ID
- `email`: User's email address
- `iss`: Laravel app URL
- `exp`: Current timestamp + 60 seconds

The token is signed using HS256 algorithm with the shared secret.

#### `generatePluginAutoLoginUrl(User $user): ?string`

Generates the complete auto-login URL in the format:
```
https://collab.artslabcreatives.com/plugins/com.artslabcreatives.auraai/auto-login?token=JWT
```

### 5. Controller Endpoints

Added two new endpoints to `MattermostAuthController`:

#### `GET /api/mattermost/plugin/auto-login-url`

**Protected with `auth:sanctum` middleware**

Returns JSON with the auto-login URL:
```json
{
  "url": "https://collab.artslabcreatives.com/plugins/com.artslabcreatives.auraai/auto-login?token=eyJ0eXAiOiJKV1...",
  "expires_at": "2026-02-17T12:01:00+00:00"
}
```

#### `GET /api/mattermost/plugin/auto-login`

**Protected with `auth:sanctum` middleware**

Redirects the user directly to the Mattermost plugin auto-login URL. Useful for iframe embeds.

## Usage

### For API Clients

1. Authenticate user with Laravel (obtain Sanctum token)
2. Call the endpoint to get the auto-login URL:

```javascript
const response = await fetch('/api/mattermost/plugin/auto-login-url', {
  headers: {
    'Authorization': 'Bearer YOUR_SANCTUM_TOKEN',
    'Accept': 'application/json'
  }
});

const data = await response.json();
console.log(data.url); // Use this URL to redirect
```

### For Iframe Integration

Simply set the iframe source to the auto-login endpoint:

```html
<iframe src="/api/mattermost/plugin/auto-login"></iframe>
```

The user will be automatically redirected to Mattermost with a valid JWT token.

### For React Frontend

```typescript
import { api } from '@/lib/api';

// Get the auto-login URL
const { data } = await api.get('/api/mattermost/plugin/auto-login-url');
window.location.href = data.url;

// Or use in iframe
<iframe src={`${API_BASE_URL}/api/mattermost/plugin/auto-login`} />
```

## Security Notes

1. **Token Expiration**: JWT tokens expire after 60 seconds for security
2. **Shared Secret**: The `MATTERMOST_JWT_SECRET` must match between Laravel and the Mattermost plugin
3. **HTTPS Required**: All production deployments should use HTTPS
4. **User Validation**: The plugin should validate:
   - Token signature using the shared secret
   - Token expiration (`exp` claim)
   - User existence in Mattermost (`sub` claim)

## JWT Payload Structure

```json
{
  "sub": "mattermost_user_id_here",
  "email": "user@example.com",
  "iss": "https://staging.aura.artslabcreatives.com",
  "exp": 1708173660
}
```

## Troubleshooting

### "Failed to generate plugin auto-login URL"

**Possible causes:**
1. `MATTERMOST_JWT_SECRET` not set in `.env`
2. `MATTERMOST_PLUGIN_ID` not set in `.env`
3. User doesn't have a Mattermost account
4. User's `mattermost_user_id` is not set

**Solution:**
- Ensure all environment variables are set
- Run `php artisan config:clear` after updating `.env`
- Sync the user with Mattermost: `php artisan mattermost:sync-users`

### Token signature verification failed

**Cause:** Shared secret mismatch between Laravel and Mattermost plugin

**Solution:**
- Ensure `MATTERMOST_JWT_SECRET` in Laravel matches the secret configured in the Mattermost plugin

### Token expired

**Cause:** JWT tokens are valid for only 60 seconds

**Solution:**
- Generate a new token by calling the endpoint again
- Ensure system clocks are synchronized between Laravel server and Mattermost server

## Testing

You can test the JWT generation using Laravel Tinker:

```bash
php artisan tinker
```

```php
$user = User::first();
$service = app(\App\Services\MattermostService::class);
$jwt = $service->generatePluginJWT($user);
echo $jwt;

// Decode to verify payload
$decoded = \Firebase\JWT\JWT::decode($jwt, new \Firebase\JWT\Key(config('services.mattermost.jwt_secret'), 'HS256'));
print_r((array)$decoded);
```

## Integration with Frontend

The frontend can embed Mattermost in an iframe that automatically logs in the user:

```typescript
// Example: Mattermost integration component
export function MattermostEmbed() {
  const [autoLoginUrl, setAutoLoginUrl] = useState<string>('');
  
  useEffect(() => {
    async function getUrl() {
      const { data } = await api.get('/api/mattermost/plugin/auto-login-url');
      setAutoLoginUrl(data.url);
    }
    getUrl();
  }, []);
  
  return (
    <iframe 
      src={autoLoginUrl}
      width="100%" 
      height="600px"
      frameBorder="0"
    />
  );
}
```

## Next Steps

1. **Set the shared secret**: Update `MATTERMOST_JWT_SECRET` in `.env` with the actual secret from your Mattermost plugin
2. **Clear config cache**: Run `php artisan config:clear`
3. **Ensure users are synced**: Run `php artisan mattermost:sync-users` to ensure all users have Mattermost accounts
4. **Test the endpoint**: Use the API documentation at `/api/documentation` or test manually with curl/Postman
5. **Update frontend**: Integrate the auto-login functionality in your React components

## Related Documentation

- [MATTERMOST_INTEGRATION.md](MATTERMOST_INTEGRATION.md) - General Mattermost integration guide
- [MATTERMOST_QUICK_START.md](MATTERMOST_QUICK_START.md) - Quick start guide
- [MATTERMOST_PERSONAL_TOKENS.md](MATTERMOST_PERSONAL_TOKENS.md) - Token management
