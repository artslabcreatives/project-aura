<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Services\MattermostService;
use Illuminate\Console\Command;

class SyncProjectsWithMattermost extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mattermost:sync-projects 
                            {--all : Sync all projects}
                            {--missing : Only sync projects without Mattermost channel}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync projects with Mattermost channels';

    protected MattermostService $mattermostService;

    /**
     * Execute the console command.
     */
    public function handle(MattermostService $mattermostService): int
    {
        $this->mattermostService = $mattermostService;

        $this->info('Starting Mattermost project sync...');

        $query = Project::query()->where('is_archived', false);

        if ($this->option('missing')) {
            $query->whereNull('mattermost_channel_id');
            $this->info('Syncing only projects without Mattermost channel...');
        } else {
            $this->info('Syncing all active projects...');
        }

        $projects = $query->get();
        $this->info("Found {$projects->count()} projects to sync.");

        if ($projects->isEmpty()) {
            $this->info('No projects to sync.');
            return Command::SUCCESS;
        }

        $progressBar = $this->output->createProgressBar($projects->count());
        $progressBar->start();

        $synced = 0;
        $failed = 0;

        foreach ($projects as $project) {
            try {
                $result = $this->mattermostService->createChannelForProject($project);
                
                if ($result) {
                    $synced++;
                } else {
                    $failed++;
                    $this->newLine();
                    $this->warn("Failed to create channel for project: {$project->name}");
                }
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Error creating channel for project {$project->name}: {$e->getMessage()}");
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
