<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class BackgroundJobs extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cpu-chip';

    protected static ?string $navigationLabel = 'Background Jobs';

    protected static ?string $title = 'Background Jobs & Tasks';

    protected static string $view = 'filament.pages.background-jobs';

    protected static ?int $navigationSort = 11;

    public function runJob(string $command): void
    {
        $jobNames = [
            'tasks:process-recurring' => 'Task Recurrence Engine',
        ];

        $name = $jobNames[$command] ?? $command;

        try {
            putenv('AURA_JOB_RUNNER=manual');
            Artisan::call($command);
            putenv('AURA_JOB_RUNNER'); // Clear the runner flag
            $output = Artisan::output();

            Notification::make()
                ->title("{$name} completed successfully!")
                ->body($output ?: 'Job executed successfully with no output.')
                ->success()
                ->send();
        } catch (\Exception $e) {
            putenv('AURA_JOB_RUNNER'); // Clear the runner flag on failure
            Log::error("Failed to run background job {$command}: " . $e->getMessage());

            Notification::make()
                ->title("Failed to run {$name}")
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function getLogs()
    {
        return \App\Models\BackgroundJobLog::where('command', 'tasks:process-recurring')
            ->latest()
            ->take(15)
            ->get();
    }
}
