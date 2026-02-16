# Slack Migration - Quick Reference

## Complete Workflow

### 1. Start Migration (Background)
```bash
./run-slack-migration.sh
```
✅ You can now close VSCode/terminal - migration continues on server

### 2. Monitor Progress (Optional)
```bash
# Quick status check
./monitor-migration.sh

# Follow live updates
tail -f storage/logs/slack_migration_*.log

# Watch Laravel logs
tail -f storage/logs/laravel.log | grep -i "migration\|credentials"
```

### 3. After Migration Completes

#### Extract User Credentials
```bash
./extract-credentials.sh
```

This creates: `storage/logs/mattermost_credentials.txt`

#### View Credentials
```bash
cat storage/logs/mattermost_credentials.txt
```

Expected format:
```
Username | Email | Password
john     | john@artslabcreatives.com | Migrate!a1b2c3d4e5f6@2026
jane     | jane@artslabcreatives.com | Migrate!f6e5d4c3b2a1@2026
```

#### Distribute to Users
Copy credentials and send securely to each user:
```
Your chat login is:
john@artslabcreatives.com
password: Migrate!a1b2c3d4e5f6@2026
```

#### Clean Up (Important!)
```bash
# After distributing credentials, delete the file
rm storage/logs/mattermost_credentials.txt

# Optional: Clean up old migration logs
rm storage/logs/slack_migration_*.log
```

## Troubleshooting

### Migration still running?
```bash
./monitor-migration.sh
```

### Find credentials in logs manually
```bash
grep "CREDENTIALS" storage/logs/laravel.log
grep "CREDENTIALS" storage/logs/slack_migration_*.log
```

### Check for errors
```bash
grep -i "error\|failed" storage/logs/slack_migration_*.log
```

### Stop migration
```bash
kill $(cat storage/logs/slack_migration.pid)
```

## Expected Timeline

- **50 users**: ~8 seconds
- **100 users**: ~15 seconds  
- **1000 messages**: ~3.3 minutes
- **Total (100 users + 1000 messages)**: ~5-10 minutes

## Security Notes

⚠️ **Important Security Practices**:
1. Credentials are logged to help with initial setup
2. Always delete `mattermost_credentials.txt` after distributing passwords
3. Advise users to change their password after first login
4. Consider setting up Mattermost password reset policies
5. Restrict access to log files on the server

## Files & Locations

| File | Purpose |
|------|---------|
| `run-slack-migration.sh` | Start migration in background |
| `monitor-migration.sh` | Check migration status |
| `extract-credentials.sh` | Extract user credentials |
| `storage/logs/slack_migration_*.log` | Migration output logs |
| `storage/logs/laravel.log` | Application logs |
| `storage/logs/mattermost_credentials.txt` | Extracted credentials (delete after use!) |
| `storage/logs/slack_migration.pid` | Process ID (temp file) |

## Full Documentation

See [SLACK_MIGRATION_BACKGROUND.md](SLACK_MIGRATION_BACKGROUND.md) for complete documentation.
