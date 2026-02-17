# 🔴 Forbidden Error - Plugin Configuration Required

## Current Status

✅ **Backend Working**: JWT generation is successful  
✅ **Token Valid**: Expires in 60 seconds as expected  
✅ **URL Correct**: Plugin endpoint is accessible  
❌ **Plugin Rejecting**: Returns 403 Forbidden

## Root Cause

The Mattermost plugin is **rejecting the JWT** because:
- The JWT secret is not configured in the plugin, OR
- The configured secret doesn't match Laravel's secret

## Fix Instructions

### Step 1: Access Mattermost Plugin Settings

1. Login to https://collab.artslabcreatives.com as **system admin**
2. Click the **menu icon** (☰) → **System Console**
3. Navigate to **Plugins** → **Plugin Management**
4. Find **"Aura AI"** (ID: com.artslabcreatives.auraai)
5. Click **Settings** button

### Step 2: Configure JWT Secret

In the plugin settings, find the **JWT Secret** field and enter **exactly**:

```
laEVti3sFsCAVdMwQLfaTiEmGwWuqI3fKnexEMERPVE=
```

**⚠️ Important:**
- Copy-paste to avoid typos
- No spaces before or after
- Must match exactly (case-sensitive)

### Step 3: Save and Restart

1. Click **Save** at the bottom
2. **Disable** the plugin
3. **Re-enable** the plugin (this reloads the configuration)

### Step 4: Test Again

Go back to the test page and click "Test Direct Access" again.

## Alternative: Check Current Plugin Configuration

If you have access to the Mattermost server files:

```bash
# SSH to Mattermost server
# Check plugin config
grep -r "jwt_secret" /opt/mattermost/plugins/com.artslabcreatives.auraai/
```

Or via Mattermost API:

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "https://collab.artslabcreatives.com/api/v4/plugins"
```

## Expected Behavior After Fix

When configured correctly:
1. Click "Test Direct Access" button
2. New window opens
3. You see Mattermost logged in automatically ✅
4. No "Forbidden" error

## Additional Debugging

### Check Plugin Logs

In Mattermost System Console:
1. **Environment** → **Logging**
2. Look for errors related to JWT validation
3. Common errors:
   - "Invalid signature" = Secret mismatch
   - "Token expired" = Clock skew (unlikely with 60s window)
   - "Missing secret" = Secret not configured

### Verify Plugin is Active

```bash
curl "https://collab.artslabcreatives.com/plugins/com.artslabcreatives.auraai/manifest.json"
```

Should return plugin manifest (not 404).

### Test JWT Signature Manually

If you want to verify the JWT is valid:

```bash
# Install jwt-cli: https://github.com/mike-engel/jwt-cli
# Or use online tool: https://jwt.io

# Decode and verify
jwt decode YOUR_TOKEN_HERE

# Verify signature
echo "laEVti3sFsCAVdMwQLfaTiEmGwWuqI3fKnexEMERPVE=" | \
  jwt verify YOUR_TOKEN_HERE
```

## Contact

If the error persists after configuration:
1. Check Mattermost server logs: `/opt/mattermost/logs/`
2. Verify plugin is version-compatible with Mattermost
3. Ensure plugin is properly installed and enabled
4. Check if plugin requires additional permissions

---

**Current JWT Secret (for reference):**
```
laEVti3sFsCAVdMwQLfaTiEmGwWuqI3fKnexEMERPVE=
```

This must be configured in the Mattermost plugin settings!
