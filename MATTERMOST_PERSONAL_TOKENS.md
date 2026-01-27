# Personal Token Implementation - Quick Reference

## Overview
Users now have personal Mattermost access tokens that are automatically generated and used for user-specific API operations.

## Database Schema

### users table (new field)
```sql
mattermost_token TEXT NULL
```

## Token Flow

### 1. User Creation/Sync
```
User created/updated in Laravel
    ↓
UserObserver triggers
    ↓
MattermostService->syncUser()
    ↓
Create/update user in Mattermost
    ↓
Generate personal access token via API
    ↓
Store token in users.mattermost_token
```

### 2. API Request with User Token
```
User action (e.g., join channel, get magic link)
    ↓
MattermostService method called with User
    ↓
makeRequest() checks if user.mattermost_token exists
    ↓
Use user token OR fallback to admin token
    ↓
Execute API request
```

## Key Methods Updated

### `MattermostService->makeRequest()`
```php
// Now accepts optional User parameter
protected function makeRequest(string $method, string $endpoint, array $data = [], ?User $user = null)
{
    // Uses user's token if available, otherwise admin token
    $token = ($user && $user->mattermost_token) ? $user->mattermost_token : $this->token;
    // ...
}
```

### `MattermostService->generateAndStoreUserToken()`
```php
// New method to generate and store personal tokens
protected function generateAndStoreUserToken(User $user, string $mattermostUserId): ?string
{
    // Calls Mattermost API to create token
    // Stores in users.mattermost_token
    // Returns token string
}
```

### `MattermostService->generateMagicLinkToken()`
```php
// Now returns stored token instead of generating new one each time
public function generateMagicLinkToken(User $user): ?string
{
    // Returns user.mattermost_token if exists
    // Or generates new one if missing
}
```

## Token Usage by Method

| Method | Token Used | Reason |
|--------|------------|--------|
| `createChannelForProject()` | Admin | System-level operation |
| `archiveChannelForProject()` | Admin | System-level operation |
| `addUserToChannel()` | User | User joining their own channel |
| `syncUser()` | Admin | Creating/updating users |
| `createMattermostUser()` | Admin | Creating new users |
| `updateMattermostUser()` | Admin | Updating user info |
| `generateMagicLinkToken()` | User | User's authentication token |
| `addUserToTeam()` | Admin | System-level operation |

## Commands

### Sync all users and generate tokens
```bash
php artisan mattermost:sync-users --all
```

### Sync only users without tokens
```bash
php artisan mattermost:sync-users --missing
```

## API Endpoints

Both endpoints now use the authenticated user's personal token:

```http
GET /api/mattermost/magic-link
GET /api/mattermost/redirect
```

## Code Examples

### Check if user has token
```php
if ($user->mattermost_token) {
    // Token exists
}
```

### Access token
```php
$token = $user->mattermost_token;
```

### Service automatically uses correct token
```php
// This will use user's personal token automatically
$service->addUserToChannel($user, $channelId);
```

## Security Considerations

1. **Token Storage**: Stored as plain text in database
2. **Token Scope**: Has same permissions as the user in Mattermost
3. **Token Lifecycle**: Doesn't expire (unless revoked in Mattermost)
4. **Admin Token**: Still needed for system operations

## Troubleshooting

### No token for user
```bash
# Check database
SELECT id, email, mattermost_user_id, mattermost_token FROM users WHERE id = X;

# Regenerate
php artisan mattermost:sync-users --missing
```

### Token not working
1. Check if token is valid in Mattermost
2. Verify user has necessary permissions
3. Check logs: `tail -f storage/logs/laravel.log`

## Migration Commands

```bash
# Run migration
php artisan migrate

# Check migration status
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback --step=1
```

## Files Modified

- ✅ `app/Services/MattermostService.php` - Token generation & usage
- ✅ `app/Models/User.php` - Added fillable field
- ✅ `database/migrations/2026_01_26_000003_add_mattermost_token_to_users_table.php` - New migration
- ✅ `.env.example` - Updated comment for admin token

## Testing Checklist

- [ ] Run migration successfully
- [ ] Create new user - verify token is generated
- [ ] Update existing user - verify token is preserved/generated
- [ ] Request magic link - verify user's token is returned
- [ ] User joins channel - verify using user's token
- [ ] Sync existing users - verify all get tokens

---

**Implementation Date**: January 26, 2026  
**Version**: 1.1.0
