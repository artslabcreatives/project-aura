#!/bin/bash

# Path to the project
PROJECT_PATH="/var/www/project-aura"
LOG_FILE="$PROJECT_PATH/storage/logs/reverb-monitor.log"

# Check if reverb is running
if ps aux | grep "[p]hp artisan reverb:start" > /dev/null
then
    # echo "$(date): Reverb is running." >> $LOG_FILE
    exit 0
else
    echo "$(date): Reverb is down. Restarting..." >> $LOG_FILE
    cd $PROJECT_PATH
    nohup php artisan reverb:start --host=127.0.0.1 --port=8080 >> $PROJECT_PATH/storage/logs/reverb.log 2>&1 &
    echo "$(date): Reverb restarted." >> $LOG_FILE
fi
