# Mattermost Integration

This application includes a comprehensive Mattermost integration that automatically creates channels for projects, syncs users, and provides magic link authentication.

## Features

- ✅ **Automatic Channel Creation**: Creates a private Mattermost channel for each new project
- ✅ **Participant Management**: Automatically adds project participants (task assignees and project creator) to the channel
- ✅ **Channel Archival**: Archives Mattermost channels when projects are deleted
- ✅ **User Synchronization**: Automatically syncs users with Mattermost when they are created or updated
- ✅ **Magic Link Authentication**: Provides seamless single sign-on to Mattermost through magic links
- ✅ **Console Commands**: Bulk sync existing users and projects

## Setup

### 1. Mattermost Configuration

First, you need to configure your Mattermost instance:

#### Create a Personal Access Token

1. Log in to your Mattermost instance as an admin
2. Go to **Account Settings** → **Security** → **Personal Access Tokens**
3. Click **Create New Token**
4. Give it a description like "Laravel Integration"
5. Copy the generated token (you won't be able to see it again)

#### Get Your Team ID

1. Navigate to your team in Mattermost
2. Go to **System Console** → **User Management** → **Teams**
3. Find your team and copy the Team ID

Alternatively, use the Mattermost API:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-mattermost-instance.com/api/v4/teams
```

### 2. Environment Variables

Add the following variables to your `.env` file:

```env
MATTERMOST_URL=https://your-mattermost-instance.com
MATTERMOST_TOKEN=your-personal-access-token-here
MATTERMOST_TEAM_ID=your-team-id-here
```

### 3. Run Database Migrations

```bash
php artisan migrate
```

This will add the following fields:
- `mattermost_channel_id` to the `projects` table
- `mattermost_user_id` to the `users` table

### 4. Sync Existing Data

If you have existing users and projects, sync them with Mattermost:

```bash
# Sync all users
php artisan mattermost:sync-users --all

# Sync only users without Mattermost ID
php artisan mattermost:sync-users --missing

# Sync all active projects
php artisan mattermost:sync-projects --all

# Sync only projects without Mattermost channel
php artisan mattermost:sync-projects --missing
```

## Usage

### Automatic Integration

The integration works automatically:

1. **When a project is created**: A private Mattermost channel is created with the project name
2. **When tasks are assigned**: Users are automatically added to the project's channel
3. **When a project is deleted**: The Mattermost channel is archived
4. **When a user is created/updated**: The user is synced with Mattermost

### Magic Link Authentication

Users can sign in to Mattermost using magic links:

#### API Endpoints

**Get Magic Link URL**
```bash
GET /api/mattermost/magic-link
Authorization: Bearer {token}
```

Response:
```json
{
  "url": "https://your-mattermost-instance.com/login?token=...",
  "expires_at": "2026-01-26T12:05:00Z"
}
```

**Redirect to Mattermost**
```bash
GET /api/mattermost/redirect
Authorization: Bearer {token}
```

This will redirect the user directly to Mattermost with authentication.

### Manual Channel Management

You can also use the MattermostService directly in your code:

```php
use App\Services\MattermostService;

// Inject the service
public function __construct(MattermostService $mattermostService)
{
    $this->mattermostService = $mattermostService;
}

// Create a channel for a project
$channelData = $this->mattermostService->createChannelForProject($project);

// Archive a channel
$this->mattermostService->archiveChannelForProject($project);

// Sync a user
$mattermostUser = $this->mattermostService->syncUser($user);

// Add a user to a channel
$this->mattermostService->addUserToChannel($user, $channelId);

// Generate magic link URL
$magicLinkUrl = $this->mattermostService->generateMagicLinkUrl($user);
```

## Channel Naming Convention

Channels are automatically named based on the project name:
- Project name is converted to lowercase
- Special characters are replaced with dashes
- Project ID is appended for uniqueness
- Maximum length: 64 characters

Example: `"New Website Design"` → `"new-website-design-123"`

## Participant Management

Users are automatically added to project channels when:
1. They are assigned to a task in the project
2. They create the project

The integration ensures all relevant team members have access to the project's communication channel.

## Troubleshooting

### Users not being synced

Check the following:
- Mattermost URL is correct and accessible
- Personal Access Token has the necessary permissions
- Team ID is correct
- Check Laravel logs for detailed error messages

### Channels not being created

Ensure:
- The Mattermost token has permission to create channels
- The team ID exists and is accessible
- Project names don't contain invalid characters
- Check the `projects.mattermost_channel_id` field to see if it was saved

### Magic links not working

Verify:
- The user has a `mattermost_user_id` in the database
- The Mattermost instance allows token-based authentication
- The token hasn't expired (tokens expire after a certain period)

### View Logs

Check Laravel logs for detailed error information:
```bash
tail -f storage/logs/laravel.log
```

## Security Considerations

- **Personal Access Tokens**: Store tokens securely in environment variables, never in code
- **Private Channels**: By default, project channels are created as private (only invited members can access)
- **Token Expiry**: Magic link tokens may expire after a period set by Mattermost
- **User Permissions**: Ensure your Mattermost token has appropriate but not excessive permissions

## API Reference

The integration uses Mattermost API v4. Key endpoints used:

- `POST /api/v4/channels` - Create channels
- `DELETE /api/v4/channels/{id}` - Archive channels
- `POST /api/v4/channels/{id}/members` - Add users to channels
- `POST /api/v4/users` - Create users
- `PUT /api/v4/users/{id}` - Update users
- `GET /api/v4/users/email/{email}` - Get user by email
- `POST /api/v4/users/{id}/tokens` - Generate authentication tokens

## Future Enhancements

Potential improvements to consider:

- [ ] Webhook integration for Mattermost → Laravel communication
- [ ] Message posting from Laravel to Mattermost channels
- [ ] Channel archival notifications
- [ ] User role synchronization
- [ ] Custom channel permissions based on project roles
- [ ] Slash commands for Mattermost to trigger Laravel actions

## Support

For issues or questions about this integration:
1. Check the Laravel logs
2. Review the Mattermost API documentation
3. Ensure all environment variables are correctly configured
4. Test the Mattermost API endpoint manually with curl
