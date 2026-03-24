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
                            {--missing : Only sync projects without Mattermost channel}
                            {--recreate : Delete existing channels and recreate them}';

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

        if ($this->option('recreate')) {
            $this->warn('Recreation mode: All existing channels will be permanently deleted and recreated...');
            
            if ($this->confirm('Are you sure you want to permanently delete and recreate all channels?')) {
                $this->info('Fetching all channels from Mattermost...');
                
                // Delete all project channels from Mattermost directly
                $deleted = $this->mattermostService->deleteAllProjectChannels();
                
                $this->info("Deleted {$deleted} channels from Mattermost.");
                
                // Clear all mattermost_channel_id from projects
                Project::query()
                    ->where('is_archived', false)
                    ->whereNotNull('mattermost_channel_id')
                    ->update(['mattermost_channel_id' => null]);
                
                $this->info('Cleared channel IDs from database.');
            } else {
                $this->info('Operation cancelled.');
                return Command::SUCCESS;
            }
        }

        // SYNC USERS FIRST
        $this->info('Syncing users to Mattermost first...');
        $users = \App\Models\User::all();
        $usersSynced = 0;
        
        foreach ($users as $user) {
            try {
                $result = $this->mattermostService->syncUser($user);
                if ($result) {
                    $usersSynced++;
                }
            } catch (\Exception $e) {
                // Continue even if user sync fails
            }
        }
        
        $this->info("Synced {$usersSynced} users to Mattermost.");
        $this->newLine();

        // Build query for sync
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
        $membersSynced = 0;
        $channelsUpdated = 0;

        foreach ($projects as $project) {
            try {
                // Load relationships needed for user sync
                $project->load(['tasks', 'stages']);
                
                // Check if channel already exists
                if ($project->mattermost_channel_id) {
                    // Channel exists, just sync members
                    $memberResult = $this->mattermostService->syncChannelMembers($project);
                    $membersSynced += $memberResult['added'];
                    $channelsUpdated++;
                } else {
                    // Create new channel
                    $result = $this->mattermostService->createChannelForProject($project);
                    
                    if ($result) {
                        $synced++;
                        
                        // Sync members for the newly created channel
                        $memberResult = $this->mattermostService->syncChannelMembers($project, $result['id']);
                        $membersSynced += $memberResult['added'];
                    } else {
                        $failed++;
                        $this->newLine();
                        $this->warn("Failed to create channel for project: {$project->name}");
                    }
                }
            } catch (\Exception $e) {
                $failed++;
                $this->newLine();
                $this->error("Error syncing project {$project->name}: {$e->getMessage()}");
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("Sync completed!");
        
        if ($synced > 0) {
            $this->info("New channels created: {$synced}");
        }
        
        if ($channelsUpdated > 0) {
            $this->info("Existing channels updated: {$channelsUpdated}");
        }
        
        $this->info("Total users added to channels: {$membersSynced}");
        
        if ($failed > 0) {
            $this->warn("Failed: {$failed}");
        }

        return Command::SUCCESS;
    }
}
