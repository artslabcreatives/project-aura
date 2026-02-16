#!/bin/bash

# Slack to Mattermost Migration Runner
# This script runs the migration in the background and logs all output

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Define log file with timestamp
LOG_DIR="$SCRIPT_DIR/storage/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/slack_migration_${TIMESTAMP}.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "=========================================="
echo "Slack to Mattermost Migration"
echo "=========================================="
echo "Starting migration in background..."
echo "Log file: $LOG_FILE"
echo ""
echo "To monitor progress, run:"
echo "  tail -f $LOG_FILE"
echo ""
echo "To check Laravel logs:"
echo "  tail -f $LOG_DIR/laravel.log"
echo ""
echo "=========================================="

# Run the migration in background with nohup
nohup php artisan app:smm > "$LOG_FILE" 2>&1 &

# Get the process ID
PID=$!

# Save PID to file for later reference
echo $PID > "$SCRIPT_DIR/storage/logs/slack_migration.pid"

echo "Migration started with PID: $PID"
echo "PID saved to: $SCRIPT_DIR/storage/logs/slack_migration.pid"
echo ""
echo "To stop the migration, run:"
echo "  kill $PID"
echo ""
echo "The process will continue running even if you close your terminal or VSCode."
echo "=========================================="
