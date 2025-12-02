<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateTaskStatusTool extends Tool
{
    protected string $name = 'update_task_status';

    protected string $description = 'Update the status of an existing task';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'task_id' => $schema->integer()
                ->description('The ID of the task to update')
                ->required(),
            'user_status' => $schema->string()
                ->enum(['pending', 'in-progress', 'complete'])
                ->description('The new status for the task')
                ->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'task_id' => 'required|integer|exists:tasks,id',
            'user_status' => 'required|in:pending,in-progress,complete',
        ]);

        $task = Task::find($validated['task_id']);

        $updateData = ['user_status' => $validated['user_status']];
        if ($validated['user_status'] === 'complete') {
            $updateData['completed_at'] = now();
        }

        $task->update($updateData);

        $data = $task->fresh()->load(['project', 'assignee', 'projectStage'])->toArray();
        return Response::text(json_encode($data));
    }
}
