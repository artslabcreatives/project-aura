# Embedded Views & Mattermost Integration

This guide explains how to embed Aura views in iframes (for Mattermost and other integrations) without the sidebar and header.

## Overview

Aura now supports two ways to access views:

1. **Regular views** with sidebar, header, and full navigation
2. **Embedded views** without sidebar/header for iframe integration

## How It Works

### Frontend (React)
- The `App.tsx` checks for the `embed=true` query parameter
- If present, uses `SimpleLayout` (minimal header with logout/theme toggle only)
- If absent, uses `DashboardLayout` (full sidebar and header)
- The same page components work with both layouts

### Backend (Laravel)
- Regular routes: Require session authentication (web middleware)
- Mattermost routes (`/mattermost/*`): Require API key authentication via `ValidateMattermostApiKey` middleware

## Setup

### 1. Configure Mattermost API Key

Set a strong secret API key in your `.env`:

```env
MATTERMOST_API_KEY=your-very-secure-random-string-here
```

This key is used to authenticate requests from Mattermost to your embedded views.

### 2. Create Mattermost Webhook/Custom App

In your Mattermost workspace:

1. Go to **System Console** → **Integrations** → **Custom Apps**
2. Create a new custom app that will link to your Aura tasks
3. Configure the app to load Aura URLs via iframe with the API key in query parameters

### 3. URL Format for Embedded Views

Access any Aura view with the `/mattermost/` prefix and required query parameters:

```
/mattermost/tasks?mattermost_token=YOUR_API_KEY&mattermost_user_id=USER_ID
/mattermost/project/123?mattermost_token=YOUR_API_KEY&mattermost_user_id=USER_ID
```

**Query Parameters:**
- `mattermost_token` (required): Your configured API key
- `mattermost_user_id` (optional): User ID to authenticate as. If provided, the user will be logged in automatically

**Examples:**

```javascript
// Full task view in iframe
const iframe = document.createElement('iframe');
iframe.src = 'https://your-aura-domain.com/mattermost/tasks?mattermost_token=ABC123&mattermost_user_id=42';
document.body.appendChild(iframe);

// Project kanban in iframe
const projectUrl = `https://your-aura-domain.com/mattermost/project/1?mattermost_token=ABC123&mattermost_user_id=42`;
```

## How the Middleware Works

The `ValidateMattermostApiKey` middleware:

1. Checks for API key in:
   - `X-Mattermost-Token` header
   - `mattermost_token` query parameter
2. Validates it against `MATTERMOST_API_KEY` from config
3. If valid:
   - Authenticates the user (if `mattermost_user_id` is provided)
   - Adds `embed=true` to the request
   - Allows request to proceed
4. If invalid:
   - Returns 401 Unauthorized response

## Route Configuration

The web routes are now organized as:

```php
// Mattermost embedded views (API key auth)
Route::middleware('mattermost.api-key')->prefix('mattermost')->group(function () {
    // /mattermost/* routes here
});

// Regular app views (session auth)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|mattermost).*$');
```

## Security Considerations

1. **API Key**: Use a long, random string (32+ characters recommended)
2. **HTTPS**: Always use HTTPS in production
3. **User ID Parameter**: Only pass if you trust the origin (validate on frontend)
4. **Rate Limiting**: Consider adding rate limiting middleware to `/mattermost/` routes
5. **CORS**: If accessing from cross-origin, ensure CORS is properly configured

## Example: Complete Mattermost Setup

### Step 1: Set API Key
```env
MATTERMOST_API_KEY=aB3xY9kL2mQ7zP0wN5vM8hU6dF4rT1sJ
```

### Step 2: JavaScript in Mattermost Custom App
```javascript
// This would run in your Mattermost custom app
const userId = currentUser.id; // Mattermost user ID
const apiKey = 'aB3xY9kL2mQ7zP0wN5vM8hU6dF4rT1sJ';
const auraBaseUrl = 'https://aura.example.com';

// Load user's tasks in iframe
const tasksUrl = `${auraBaseUrl}/mattermost/tasks?mattermost_token=${apiKey}&mattermost_user_id=${userId}`;

// Load specific project in iframe
const projectUrl = `${auraBaseUrl}/mattermost/project/1?mattermost_token=${apiKey}&mattermost_user_id=${userId}`;
```

### Step 3: User Experience
- User opens the custom app in Mattermost
- The iframe loads the Aura view without sidebar/header
- User can interact with the task list, open details, complete tasks
- Logout button in the minimal header works normally

## Troubleshooting

### "Unauthorized. Invalid Mattermost API key"
- Verify `MATTERMOST_API_KEY` in `.env` is set
- Check that the query parameter or header matches exactly
- Check for trailing spaces or special characters in the key

### User not authenticated
- Ensure `mattermost_user_id` query parameter is set
- Verify the user ID exists in your Aura database
- Check browser console for auth errors

### Sidebar/Header still showing
- Verify `embed=true` query parameter is being passed
- Check that middleware is adding it properly
- Clear browser cache
- Check React Router query parameter parsing

## API Endpoints

Mattermost routes can also access all protected API endpoints using the same authentication:

```bash
# Get user info via Mattermost route
curl -X GET "https://aura.example.com/api/user" \
  -H "X-Mattermost-Token: YOUR_API_KEY"

# Or with query parameter
curl -X GET "https://aura.example.com/api/user?mattermost_token=YOUR_API_KEY"
```

## Components Used

- **SimpleLayout**: New minimal layout component at `resources/js/project-aura-new/src/components/SimpleLayout.tsx`
- **ValidateMattermostApiKey**: Middleware at `app/Http/Middleware/ValidateMattermostApiKey.php`
- **App.tsx**: Updated to check for `embed` query parameter
