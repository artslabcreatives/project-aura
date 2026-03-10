#!/bin/bash

# Extract Mattermost Credentials from Migration Logs
# This script extracts all created user credentials from the logs

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="$SCRIPT_DIR/storage/logs"
OUTPUT_FILE="$SCRIPT_DIR/storage/logs/mattermost_credentials.txt"

echo "=========================================="
echo "Mattermost Credentials Extractor"
echo "=========================================="
echo ""

# Find all migration logs
MIGRATION_LOGS=$(ls -t $LOG_DIR/slack_migration_*.log 2>/dev/null)

if [ -z "$MIGRATION_LOGS" ]; then
    echo "No migration logs found in $LOG_DIR"
    echo "Also checking Laravel logs..."
    echo ""
fi

# Create credentials file with header
cat > "$OUTPUT_FILE" << 'EOF'
================================================================================
MATTERMOST USER CREDENTIALS
Generated from Slack Migration
================================================================================

IMPORTANT: Keep this file secure and delete after distributing passwords!

Format: Username | Email | Password

EOF

echo "Extracting credentials from logs..."
echo ""

# Extract from migration logs
for LOG in $MIGRATION_LOGS; do
    echo "Checking: $LOG"
    grep "CREDENTIALS - Email:" "$LOG" >> "$OUTPUT_FILE.tmp" 2>/dev/null || true
done

# Also check Laravel logs for the credentials
grep "CREDENTIALS - Email:" "$LOG_DIR/laravel.log" >> "$OUTPUT_FILE.tmp" 2>/dev/null || true

# Process and format the credentials
if [ -f "$OUTPUT_FILE.tmp" ]; then
    # Parse and format the credentials
    while IFS= read -r line; do
        # Extract email and password from log line
        # Format: "CREDENTIALS - Email: xxx@domain.com | Password: Migrate!xxxxx@2026"
        email=$(echo "$line" | grep -oP 'Email: \K[^\s|]+')
        password=$(echo "$line" | grep -oP 'Password: \K.+$' | sed 's/\s*$//')
        username=$(echo "$email" | cut -d'@' -f1)
        
        if [ -n "$email" ] && [ -n "$password" ]; then
            printf "%-20s | %s | %s\n" "$username" "$email" "$password" >> "$OUTPUT_FILE"
        fi
    done < "$OUTPUT_FILE.tmp"
    
    rm "$OUTPUT_FILE.tmp"
    
    # Count credentials
    CRED_COUNT=$(grep -c "|" "$OUTPUT_FILE" || echo "0")
    
    echo ""
    echo "✓ Extracted $CRED_COUNT user credentials"
    echo ""
    echo "Credentials saved to:"
    echo "  $OUTPUT_FILE"
    echo ""
    echo "----------------------------------------"
    echo "Preview of credentials:"
    echo "----------------------------------------"
    tail -20 "$OUTPUT_FILE"
    echo "----------------------------------------"
    echo ""
    echo "To view all credentials:"
    echo "  cat $OUTPUT_FILE"
    echo ""
    echo "To copy to clipboard (if xclip installed):"
    echo "  cat $OUTPUT_FILE | xclip -selection clipboard"
    echo ""
    echo "⚠️  SECURITY: Remember to secure or delete this file after use!"
    echo "  rm $OUTPUT_FILE"
    echo ""
else
    echo "✗ No credentials found in logs"
    echo ""
    echo "This could mean:"
    echo "  1. Migration hasn't been run yet"
    echo "  2. All users already existed (no new users created)"
    echo "  3. Migration logs are in a different location"
    echo ""
fi

echo "=========================================="
