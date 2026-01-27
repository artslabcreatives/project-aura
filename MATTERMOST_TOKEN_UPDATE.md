# Mattermost Integration - Personal Token Update

## Changes Made

The Mattermost integration has been updated to generate and use personal access tokens for each user.

### What Changed

1. **Personal Tokens Generated**: When users are synced with Mattermost, a personal access token is automatically generated for each user
2. **Token Storage**: Personal tokens are stored in the `users.mattermost_token` field
3. **User-Specific Requests**: API requests made on behalf of a user now use their personal token instead of the global admin token
4. **Magic Link Auth**: Magic links now use the user's stored personal token for authentication

### Database Changes

A new migration has been created:
- `2026_01_26_000003_add_mattermost_token_to_users_table.php`

This adds the `mattermost_token` field to the `users` table.

### Migration Required

Run the new migration:
```bash
php artisan migrate
```

### Re-sync Users

To generate tokens for existing users:
```bash
php artisan mattermost:sync-users --all
```

This will:
- Generate a personal access token for each user
- Store the token in the `users.mattermost_token` field
- Use this token for all user-specific API operations

### How It Works

#### Token Generation Flow

1. **New User Created**:
   - User is created in Mattermost
   - Personal access token is generated via Mattermost API
   - Token is stored in `users.mattermost_token`

2. **Existing User Updated**:
   - User details are updated in Mattermost
   - If no token exists, a new one is generated
   - Token is stored in database

3. **User Operations**:
   - When making API requests on behalf of a user, their personal token is used
   - Falls back to admin token if user token is not available

#### Benefits

✅ **Better Security**: Each user has their own token  
✅ **Audit Trail**: Actions in Mattermost show the actual user who performed them  
✅ **Token Isolation**: User token compromise doesn't affect the entire system  
✅ **Proper Attribution**: Messages and actions are attributed to the correct user  

#### Token Usage

The system automatically uses the appropriate token:

- **User-specific operations** (joining channels, magic links): Uses user's personal token
- **Admin operations** (creating channels, creating users): Uses admin token
- **Fallback**: If user token is unavailable, uses admin token

### API Behavior

When a user requests their magic link:
```http
GET /api/mattermost/magic-link
Authorization: Bearer {laravel-sanctum-token}
```

The response now includes the user's personal token:
```json
{
  "url": "https://mattermost.com/login?token={user-personal-token}",
  "expires_at": "2026-01-26T12:05:00Z"
}
```

### Environment Variables

No changes required to `.env` file. The `MATTERMOST_TOKEN` should be an **admin** personal access token that can:
- Create users
- Generate tokens for users
- Create channels
- Manage team membership

### Security Notes

1. **Token Storage**: Tokens are stored in the database as text (consider encryption if needed)
2. **Token Permissions**: User tokens have the same permissions as the user in Mattermost
3. **Token Lifecycle**: Tokens don't expire unless manually revoked in Mattermost
4. **Admin Token**: Keep your admin token secure as it's used for system-level operations

### Troubleshooting

**Users can't access Mattermost**:
- Ensure tokens were generated: Check `users.mattermost_token` is not null
- Re-run sync: `php artisan mattermost:sync-users --missing`

**Token generation fails**:
- Verify admin token has permission to create tokens for other users
- Check Mattermost version supports personal access tokens (v4.1+)
- Review logs: `tail -f storage/logs/laravel.log`

### Code Examples

#### Check if user has token
```php
$user = User::find(1);
if ($user->mattermost_token) {
    // User has a personal token
}
```

#### Regenerate token for a user
```php
$mattermostService = app(MattermostService::class);
$mattermostService->syncUser($user);
// This will generate a new token if one doesn't exist
```

#### Manual token generation
```php
// Not recommended, use syncUser instead
$token = $mattermostService->generateAndStoreUserToken($user, $mattermostUserId);
```

---

**Migration Date**: January 26, 2026  
**Status**: ✅ Ready for deployment
