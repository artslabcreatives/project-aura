<?php

namespace App\Observers;

use App\Models\Project;
use App\Services\MattermostService;

class ProjectObserver
{
    protected MattermostService $mattermostService;

    public function __construct(MattermostService $mattermostService)
    {
        $this->mattermostService = $mattermostService;
    }

    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        // Create Mattermost channel for the project
        $this->mattermostService->createChannelForProject($project);
        // Create default stages
        $project->stages()->create([
            'title' => 'Suggested Task',
            'color' => 'bg-purple-500',
            'order' => 0,
            'type' => 'project',
        ]);

        $project->stages()->create([
            'title' => 'Pending',
            'color' => 'bg-gray-500',
            'order' => 1,
            'type' => 'project',
        ]);

        $project->stages()->create([
            'title' => 'Completed',
            'color' => 'bg-slate-800',
            'order' => 998,
            'type' => 'project',
        ]);

        $project->stages()->create([
            'title' => 'Archive',
            'color' => 'bg-slate-800',
            'order' => 999,
            'type' => 'project',
        ]);

        $project->suggestedTasks()->create([
            'title' => 'Review initial requirements',
            'description' => 'Client sent a voice note about the color scheme preference.',
            'source' => 'whatsapp',
            'suggested_at' => now()->subHours(2),
        ]);

        $project->suggestedTasks()->create([
            'title' => 'Update logo assets',
            'description' => 'Received new vector files via email.',
            'source' => 'email',
            'suggested_at' => now()->subDay(),
        ]);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        //
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        // Archive Mattermost channel when project is deleted
        $this->mattermostService->archiveChannelForProject($project);
    }

    /**
     * Handle the Project "restored" event.
     */
    public function restored(Project $project): void
    {
        //
    }

    /**
     * Handle the Project "force deleted" event.
     */
    public function forceDeleted(Project $project): void
    {
        //
    }
}
