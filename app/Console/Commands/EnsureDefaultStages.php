<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Command;

class EnsureDefaultStages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'projects:ensure-default-stages';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ensure all projects have the default stages (Suggested Task, Pending, Archive)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projects = Project::all();
        $bar = $this->output->createProgressBar(count($projects));

        $bar->start();

        foreach ($projects as $project) {
            // Suggested Task
            $suggestedTaskStage = $project->stages()->where('title', 'Suggested Task')->first();
            if (!$suggestedTaskStage) {
                $project->stages()->create([
                    'title' => 'Suggested Task',
                    'color' => 'bg-purple-500',
                    'order' => 0,
                    'type' => 'project',
                ]);
            } else {
                // Ensure order is 0
                if ($suggestedTaskStage->order !== 0) {
                    $suggestedTaskStage->update(['order' => 0]);
                }
            }

            // Pending
            $pendingStage = $project->stages()->where('title', 'Pending')->first();
            if (!$pendingStage) {
                $project->stages()->create([
                    'title' => 'Pending',
                    'color' => 'bg-gray-500',
                    'order' => 1,
                    'type' => 'project',
                ]);
            } else {
                // Ensure order is 1
                if ($pendingStage->order !== 1) {
                    $pendingStage->update(['order' => 1]);
                }
            }

            // Archive
            if (!$project->stages()->where('title', 'Archive')->exists()) {
                $project->stages()->create([
                    'title' => 'Archive',
                    'color' => 'bg-slate-800',
                    'order' => 999,
                    'type' => 'project',
                ]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Default stages ensured for all projects.');
    }
}
