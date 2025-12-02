<?php

namespace App\Mcp\Tools;

use App\Models\Project;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetPendingProjectsTool extends Tool
{
    protected string $name = 'get_pending_projects';

    protected string $description = 'Get projects that are pending (nearing deadline, incomplete tasks, or no active assignee)';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'days_threshold' => $schema->integer()
                ->description('Number of days to consider for nearing deadline (default: 7)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $daysThreshold = $request->get('days_threshold', 7);

        $projects = Project::with(['department', 'stages', 'tasks.assignee', 'creator'])
            ->get()
            ->filter(function ($project) use ($daysThreshold) {
                // Check if nearing deadline
                if ($project->deadline && $project->deadline->isPast()) {
                    return true;
                }
                if ($project->deadline && $project->deadline->diffInDays(now()) <= $daysThreshold) {
                    return true;
                }

                // Check if has incomplete tasks
                $incompleteTasks = $project->tasks->where('user_status', '!=', 'complete')->count();
                if ($incompleteTasks > 0) {
                    return true;
                }

                // Check if has no active assignee on any task
                $unassignedTasks = $project->tasks->whereNull('assignee_id')->count();
                if ($unassignedTasks > 0) {
                    return true;
                }

                return false;
            });

        $data = $projects->values()->toArray();

        return Response::text(json_encode($data));
    }
}
