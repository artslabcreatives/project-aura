# Slack to Mattermost Migration - Background Execution Guide

## Overview

The migration command now includes comprehensive logging and can be run in the background, allowing you to safely close VSCode or your terminal without interrupting the process.

## Features

✅ **Comprehensive Logging**: All progress is logged to both Laravel logs and dedicated migration logs  
✅ **Background Execution**: Runs independently of your terminal session  
✅ **Progress Monitoring**: Track migration progress in real-time  
✅ **Rate Limiting**: Built-in delays to respect Mattermost API limits:
- User operations: 150ms delay (~6-7 users/second)
- Token creation: 100ms delay (~10 tokens/second)
- Channel members: 100ms delay (~10 users/second)
- Message posting: 200ms delay (~5 messages/second)

## Quick Start

### 1. Start the Migration (Background)

```bash
./run-slack-migration.sh
```

This will:
- Start the migration in the background
- Create a timestamped log file in `storage/logs/slack_migration_YYYYMMDD_HHMMSS.log`
- Save the process ID (PID) for monitoring
- Allow you to close your terminal/VSCode safely

### 2. Monitor Progress

```bash
./monitor-migration.sh
```

This shows:
- Whether the migration is currently running
- Recent log entries from both migration and Laravel logs
- List of all available migration logs

### 3. Follow Live Progress

```bash
tail -f storage/logs/slack_migration_*.log
```

This will show live updates as the migration progresses.

## Alternative: Using Screen (Recommended for long migrations)

### Start Migration in Screen Session

```bash
# Start a screen session
screen -S slack-migration

# Run the migration
php artisan app:smm

# Detach from screen: Press Ctrl+A, then D
```

### Reattach to Screen Session

```bash
screen -r slack-migration
```

### List All Screen Sessions

```bash
screen -ls
```

## Alternative: Direct Background Command

If you prefer not to use the scripts:

```bash
# Run in background with nohup
nohup php artisan app:smm > storage/logs/migration_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Monitor Laravel logs
tail -f storage/logs/laravel.log | grep -i "migration\|slack\|mattermost"
```

## What Gets Logged

The migration logs:
- ✓ Each user created/mapped
- ✓ **User credentials (email & password)** for newly created users
- ✓ Each token generated
- ✓ Channel deletion and creation
- ✓ Each user added to channel
- ✓ Progress updates (every 10 messages)
- ✓ All errors and warnings
- ✓ Start and completion timestamps

## Extracting User Credentials

After the migration completes, extract all created user credentials:

```bash
./extract-credentials.sh
```

This will create `storage/logs/mattermost_credentials.txt` with all user logins in the format:

```
Username | Email | Password
john     | john@artslabcreatives.com | Migrate!a1b2c3d4e5f6@2026
jane     | jane@artslabcreatives.com | Migrate!f6e5d4c3b2a1@2026
```

**⚠️ SECURITY**: Remember to secure or delete this file after distributing passwords to users!

## Log Locations

1. **Migration-specific logs**: `storage/logs/slack_migration_YYYYMMDD_HHMMSS.log`
2. **Laravel application logs**: `storage/logs/laravel.log`

## Stopping the Migration

### If using the script:

```bash
# Find the PID
cat storage/logs/slack_migration.pid

# Stop the process
kill $(cat storage/logs/slack_migration.pid)
```

### If using screen:

```bash
# Attach to the screen session
screen -r slack-migration

# Press Ctrl+C to stop

# Detach: Ctrl+A, then D
```

## Troubleshooting

### Check if migration is running

```bash
./monitor-migration.sh
```

Or:

```bash
ps aux | grep "artisan app:smm"
```

### View recent errors

```bash
tail -50 storage/logs/laravel.log | grep ERROR
```

### Check API rate limit errors

```bash
grep -i "rate limit\|429\|too many requests" storage/logs/slack_migration_*.log
```

## Expected Duration

With rate limiting in place:
- 50 users: ~7.5 seconds
- 100 users: ~15 seconds  
- 1000 messages: ~3.3 minutes
- 5000 messages: ~16 minutes

Total for typical workspace (100 users + 1000 messages): **~5-10 minutes**

## Post-Migration

After completion:
1. Check the final log message: "MIGRATION COMPLETED SUCCESSFULLY"
2. **Extract user credentials**: Run `./extract-credentials.sh`
3. Review any errors or skipped items
4. Verify data in Mattermost
5. Distribute credentials to users securely
6. Clean up credentials file: `rm storage/logs/mattermost_credentials.txt`
7. Clean up old log files if needed

### Example Credential Format

Each created user will have credentials logged like:
```
Your chat login is:
john@artslabcreatives.com
password: Migrate!a1b2c3d4e5f6@2026
```

## Files Created

- `run-slack-migration.sh` - Background migration runner
- `monitor-migration.sh` - Progress monitor
- `extract-credentials.sh` - **Extract user credentials from logs**
- `storage/logs/slack_migration_*.log` - Migration logs
- `storage/logs/slack_migration.pid` - Process ID file (temporary)
- `storage/logs/mattermost_credentials.txt` - **Extracted credentials (created after running extract script)**
