<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetPendingReviewTasksTool extends Tool
{
    protected string $name = 'get_pending_review_tasks';

    protected string $description = 'Get all tasks that are pending review';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'hours_threshold' => $schema->integer()
                ->description('Number of hours to consider for stuck in review (default: 24)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'hours_threshold' => 'nullable|integer|min:1',
        ]);

        $hoursThreshold = $validated['hours_threshold'] ?? 24;

        $tasks = Task::with(['project', 'assignee', 'projectStage'])
            ->whereHas('projectStage', function ($query) {
                $query->where('is_review_stage', true);
            })
            ->where('user_status', '!=', 'complete')
            ->get()
            ->filter(function ($task) use ($hoursThreshold) {
                // Check if stuck in review stage for more than threshold hours
                return $task->updated_at->diffInHours(now()) >= $hoursThreshold;
            });

        $data = $tasks->values()->toArray();

        return Response::text(json_encode($data));
    }
}
