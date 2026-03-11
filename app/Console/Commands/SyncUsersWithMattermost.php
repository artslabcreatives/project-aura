<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\MattermostService;
use Illuminate\Console\Command;

class SyncUsersWithMattermost extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mattermost:sync-users 
                            {--all : Sync all users}
                            {--missing : Only sync users without Mattermost ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync users with Mattermost';

    protected MattermostService $mattermostService;

    /**
     * Execute the console command.
     */
    public function handle(MattermostService $mattermostService): int
    {
        $this->mattermostService = $mattermostService;

        $this->info('Starting Mattermost user sync...');

        $query = User::query();

        if ($this->option('missing')) {
            $query->whereNull('mattermost_user_id');
            $this->info('Syncing only users without Mattermost ID...');
        } else {
            $this->info('Syncing all users...');
        }

        $users = $query->get();
        $this->info("Found {$users->count()} users to sync.");

        $progressBar = $this->output->createProgressBar($users->count());
        $progressBar->start();

        $synced = 0;
        $failed = 0;

        foreach ($users as $user) {
            try {
                $result = $this->mattermostService->syncUser($user);
                
                if ($result) {
                    $synced++;
                } else {
                    $failed++;
                    $this->newLine();
                    $this->warn("Failed to sync user: {$user->email}");
                }
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Error syncing user {$user->email}: {$e->getMessage()}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("Sync completed!");
        $this->info("Successfully synced: {$synced}");
        
        if ($failed > 0) {
            $this->warn("Failed: {$failed}");
        }

        return Command::SUCCESS;
    }
}
