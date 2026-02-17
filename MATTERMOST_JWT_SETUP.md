# Mattermost JWT Auto-Login Setup Guide

## Quick Configuration Checklist

To enable Mattermost auto-login with JWT, ensure these environment variables are configured:

### Required .env Variables

```env
# Mattermost server URL (without trailing slash)
MATTERMOST_URL=https://collab.artslabcreatives.com

# Admin personal access token
MATTERMOST_TOKEN=your-admin-token-here

# Team ID
MATTERMOST_TEAM_ID=your-team-id-here

# Plugin ID (must match your Mattermost plugin)
MATTERMOST_PLUGIN_ID=com.artslabcreatives.auraai

# Shared secret for JWT signing (MUST match plugin configuration)
MATTERMOST_JWT_SECRET=your-shared-secret-key-here
```

## Setup Steps

### 1. Configure Environment Variables

Add the above variables to your `.env` file. You can copy from `.env.example`:

```bash
cp .env.example .env
# Then edit .env with your actual values
```

### 2. Generate JWT Secret

Generate a strong random secret (minimum 32 characters):

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using PHP
php -r "echo bin2hex(random_bytes(32));"

# Option 3: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'));"
```

**Important:** This secret MUST be the same in both:
- Laravel `.env` file (`MATTERMOST_JWT_SECRET`)
- Mattermost plugin configuration

### 3. Configure Mattermost Plugin

In your Mattermost plugin settings, set the same JWT secret:

```json
{
  "jwt_secret": "same-secret-as-laravel-env"
}
```

### 4. Ensure Users Have Mattermost Accounts

Users must have Mattermost accounts with matching email addresses. The system will:

1. ✅ **Automatically fetch** Mattermost user IDs by email
2. ✅ **Cache** user IDs in the database for performance
3. ❌ **Fail gracefully** if user doesn't exist in Mattermost

#### Sync Users to Mattermost

If users don't have Mattermost accounts, create them:

```bash
# Sync all users
php artisan mattermost:sync-users

# Or manually create in Mattermost admin panel
```

## Troubleshooting

### Error: "Mattermost JWT secret not configured"

**Solution:** Add `MATTERMOST_JWT_SECRET` to your `.env` file

```bash
echo "MATTERMOST_JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

### Error: "Mattermost plugin ID not configured"

**Solution:** Add `MATTERMOST_PLUGIN_ID` to your `.env` file

```env
MATTERMOST_PLUGIN_ID=com.artslabcreatives.auraai
```

### Error: "Unable to generate login URL. You may not have a Mattermost account"

**Cause:** The user doesn't have a Mattermost account, or their email doesn't match

**Solution:**
1. Verify user email exists in Mattermost
2. Sync users: `php artisan mattermost:sync-users`
3. Or manually create user in Mattermost with matching email

### Error: "Failed to load chat. Please try again."

**Debugging steps:**

1. Check Laravel logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. Verify Mattermost connection:
   ```bash
   curl -H "Authorization: Bearer ${MATTERMOST_TOKEN}" \
        "${MATTERMOST_URL}/api/v4/users/me"
   ```

3. Test user lookup:
   ```bash
   php artisan tinker
   >>> $user = App\Models\User::first();
   >>> app(App\Services\MattermostService::class)->getUserByEmail($user->email);
   ```

### JWT Token Validation Failures

**Common issues:**

1. **Mismatched secrets** - Ensure same secret in Laravel and Mattermost plugin
2. **Clock skew** - Sync server times (JWT expires in 60 seconds)
3. **Wrong plugin ID** - Verify plugin ID matches exactly

## Testing

### Test JWT Generation

```bash
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'test@example.com')->first();
$service = app(App\Services\MattermostService::class);
$jwt = $service->generatePluginJWT($user);
echo $jwt;
```

### Test Auto-Login URL

```bash
curl -X GET "http://localhost:8000/api/mattermost/plugin/auto-login-url" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Accept: application/json"
```

Expected response:
```json
{
  "url": "https://collab.artslabcreatives.com/plugins/com.artslabcreatives.auraai/auto-login?token=eyJ0eXA...",
  "expires_at": "2024-01-15T10:30:00.000000Z"
}
```

## Security Notes

- ✅ JWT tokens expire after 60 seconds
- ✅ Tokens are single-use (plugin should invalidate after use)
- ✅ Transport over HTTPS only in production
- ✅ Secret must be kept confidential and rotated periodically
- ❌ Never commit `MATTERMOST_JWT_SECRET` to version control
- ❌ Never expose JWT tokens in frontend console logs

## Integration Flow

```
User → Opens Chat → Frontend calls API
                          ↓
                 Laravel authenticates user (Sanctum)
                          ↓
                 Fetch/cache Mattermost user ID
                          ↓
                 Generate JWT (60s expiration)
                          ↓
                 Return plugin auto-login URL
                          ↓
                 Frontend loads iframe → Mattermost plugin
                          ↓
                 Plugin validates JWT → Auto-login
```

## Support

For additional help:
- Check [MATTERMOST_IFRAME_LOGIN.md](MATTERMOST_IFRAME_LOGIN.md) for detailed implementation
- Review [MATTERMOST_INTEGRATION.md](MATTERMOST_INTEGRATION.md) for general Mattermost setup
- Check Laravel logs: `storage/logs/laravel.log`
- Enable debug mode: `APP_DEBUG=true` in `.env` (development only)
