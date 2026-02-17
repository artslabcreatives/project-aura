# 🚨 URGENT: Mattermost Token Expired

## Issue
Your Mattermost admin token has expired. This is preventing the JWT auto-login from working.

## Quick Fix Steps

### 1. Login to Mattermost
Go to: https://collab.artslabcreatives.com

### 2. Generate New Personal Access Token

1. Click your profile picture (top right)
2. Go to **Profile** → **Security**
3. Scroll to **Personal Access Tokens**
4. Click **Create New Token**
5. Description: `Aura Admin API Token - Created ${new Date().toISOString().split('T')[0]}`
6. **Copy the token immediately** (you won't see it again!)

### 3. Update .env File

Replace this line in `/var/www/aura-staging/.env`:

```env
MATTERMOST_TOKEN=xac3oqx7zfgm3fnkzjffw1qnue
```

With:

```env
MATTERMOST_TOKEN=your-new-token-here
```

Also update:

```env
MATTERMOST_ADMIN_USER_TOKEN=your-new-token-here
```

**Use the same token for both!**

### 4. Clear Cache

```bash
cd /var/www/aura-staging
php artisan config:clear
php artisan config:cache
```

### 5. Test the Token

```bash
# Should return your user info
curl -H "Authorization: Bearer YOUR_NEW_TOKEN" \
     "https://collab.artslabcreatives.com/api/v4/users/me"
```

## Current JWT Secret

I've already updated your JWT secret to:

```
MATTERMOST_JWT_SECRET=laEVti3sFsCAVdMwQLfaTiEmGwWuqI3fKnexEMERPVE=
```

**Important:** You must also configure this same secret in your Mattermost plugin settings!

### Configure Plugin Secret

In Mattermost:
1. Go to System Console → Plugins
2. Find "Aura AI" plugin
3. Settings → JWT Secret: `laEVti3sFsCAVdMwQLfaTiEmGwWuqI3fKnexEMERPVE=`
4. Save

## After Token Refresh

Once you've updated the token and configured the plugin secret, the auto-login should work!

Test by clicking the chat button in the Aura interface.

## Reference

See [MATTERMOST_PERSONAL_TOKENS.md](MATTERMOST_PERSONAL_TOKENS.md) for more details on token management.
