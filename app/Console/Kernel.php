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
        //backup database every daily at 2 AM
        $schedule->command('backup:run')
            ->dailyAt('02:00')
            ->runInBackground();
        
        // Move tasks to their start stage when start time arrives
        $schedule->command('tasks:move-to-start-stage')
            ->everyMinute()
            ->runInBackground();

        // Process and spawn scheduled recurring tasks that are due
        $schedule->command('tasks:process-recurring')
            ->everyMinute()
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
