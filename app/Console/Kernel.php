<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Backup database and upload to Google Drive daily at 12:00 AM
        $schedule->command('backup:google-drive')
            ->dailyAt('00:00')
            ->timezone('Asia/Colombo')
            ->runInBackground();
        
        // Move tasks to their start stage when start time arrives
        $schedule->command('tasks:move-to-start-stage')
            ->everyMinute()
            ->runInBackground();

        // Process and spawn scheduled recurring tasks that are due
        $schedule->command('tasks:process-recurring')
            ->dailyAt('00:00')
            ->timezone('Asia/Colombo')
            ->runInBackground();

        // Ask assignees for daily task updates via Mattermost.
        $schedule->command('ai-chatbot:daily-mattermost-followups')
            ->dailyAt('09:00')
            ->timezone('Asia/Colombo')
            ->runInBackground();

        // Send weekly reminders for active projects working without a PO.
        $schedule->command('projects:send-weekly-po-reminders')
            ->weeklyOn(1, '09:00')
            ->timezone('Asia/Colombo')
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
