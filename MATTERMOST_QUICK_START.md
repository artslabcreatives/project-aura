# Mattermost Integration - Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Configure Environment

Add these to your `.env` file:

```env
MATTERMOST_URL=https://your-mattermost-instance.com
MATTERMOST_TOKEN=your-personal-access-token
MATTERMOST_TEAM_ID=your-team-id
```

### 2. Run Migrations

```bash
php artisan migrate
```

### 3. Sync Existing Data (Optional)

```bash
# Sync all users with Mattermost
php artisan mattermost:sync-users --all

# Create channels for all existing projects
php artisan mattermost:sync-projects --all
```

## ✅ What's Included

### Files Created

- **Service**: `app/Services/MattermostService.php` - Main integration logic
- **Observers**: 
  - `app/Observers/ProjectObserver.php` - Updated to create/archive channels
  - `app/Observers/UserObserver.php` - Syncs users automatically
- **Controller**: `app/Http/Controllers/MattermostAuthController.php` - Magic link auth
- **Commands**:
  - `app/Console/Commands/SyncUsersWithMattermost.php`
  - `app/Console/Commands/SyncProjectsWithMattermost.php`
- **Migrations**:
  - `database/migrations/2026_01_26_000001_add_mattermost_channel_id_to_projects_table.php`
  - `database/migrations/2026_01_26_000002_add_mattermost_user_id_to_users_table.php`
- **Config**: Updated `config/services.php` and `.env.example`
- **Routes**: Updated `routes/api.php`

### Features

✅ **Auto-create channels** when projects are created  
✅ **Auto-add participants** (task assignees + project creator)  
✅ **Auto-archive channels** when projects are deleted  
✅ **Auto-sync users** when created/updated  
✅ **Magic link signin** for seamless authentication  
✅ **Bulk sync commands** for existing data  

## 📡 API Endpoints

### Get Magic Link URL
```http
GET /api/mattermost/magic-link
Authorization: Bearer {your-token}
```

### Redirect to Mattermost
```http
GET /api/mattermost/redirect
Authorization: Bearer {your-token}
```

## 🔧 How It Works

### When a Project is Created
1. ProjectObserver triggers
2. MattermostService creates a private channel
3. Channel ID is saved to `projects.mattermost_channel_id`
4. Project participants (task assignees + creator) are added to the channel

### When a Project is Deleted
1. ProjectObserver triggers
2. MattermostService archives the channel
3. Channel remains in Mattermost but is archived

### When a User is Created/Updated
1. UserObserver triggers
2. MattermostService syncs the user
3. User ID is saved to `users.mattermost_user_id`
4. User is added to the team

### Magic Link Authentication
1. User requests magic link
2. System generates Mattermost token
3. User is redirected to Mattermost with token
4. Automatic login happens

## 🎯 Next Steps

1. **Set up environment variables** in your `.env` file
2. **Run migrations** to add database fields
3. **Test with a new project** - it should auto-create a channel
4. **Try magic link auth** via the API endpoints
5. **Sync existing data** if needed

## 📚 Full Documentation

See [MATTERMOST_INTEGRATION.md](MATTERMOST_INTEGRATION.md) for complete documentation including:
- Detailed setup instructions
- Troubleshooting guide
- API reference
- Security considerations
- Code examples

## 💡 Tips

- Channel names are auto-generated from project names (slugified + project ID)
- All channels are created as **private** by default
- Users need to be synced before they can be added to channels
- Magic link tokens may expire based on Mattermost settings
- Check `storage/logs/laravel.log` for detailed error messages

## ⚠️ Important Notes

1. **Personal Access Token**: Your Mattermost token needs permissions to:
   - Create channels
   - Manage users
   - Add members to channels
   - Generate authentication tokens

2. **Team ID**: Make sure to use the correct Team ID where you want channels created

3. **Database Fields**: The migrations add:
   - `mattermost_channel_id` to projects (nullable)
   - `mattermost_user_id` to users (nullable)

4. **Observers**: Make sure observers are registered in `AppServiceProvider`

---

Ready to go! 🎉
