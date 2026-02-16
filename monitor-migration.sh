#!/bin/bash

# Slack Migration Monitor
# This script helps you monitor the migration progress

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="$SCRIPT_DIR/storage/logs"
PID_FILE="$LOG_DIR/slack_migration.pid"

echo "=========================================="
echo "Slack Migration Monitor"
echo "=========================================="
echo ""

# Check if migration is running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "✓ Migration is RUNNING (PID: $PID)"
        echo ""
        
        # Find the most recent migration log
        LATEST_LOG=$(ls -t $LOG_DIR/slack_migration_*.log 2>/dev/null | head -1)
        
        if [ -n "$LATEST_LOG" ]; then
            echo "Latest migration log: $LATEST_LOG"
            echo ""
            echo "Recent entries from migration log:"
            echo "----------------------------------------"
            tail -20 "$LATEST_LOG"
            echo "----------------------------------------"
            echo ""
            echo "To follow live progress, run:"
            echo "  tail -f $LATEST_LOG"
        fi
    else
        echo "✗ Migration is NOT running (PID file exists but process is dead)"
        rm "$PID_FILE"
    fi
else
    echo "✗ Migration is NOT running (no PID file found)"
fi

echo ""
echo "Recent Laravel log entries:"
echo "----------------------------------------"
tail -30 "$LOG_DIR/laravel.log" | grep -i "slack\|mattermost\|migration" || tail -10 "$LOG_DIR/laravel.log"
echo "----------------------------------------"
echo ""

# Show all migration logs
echo "Available migration logs:"
ls -lh $LOG_DIR/slack_migration_*.log 2>/dev/null || echo "  No migration logs found"
echo ""
echo "=========================================="
