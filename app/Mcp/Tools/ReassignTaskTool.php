<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class ReassignTaskTool extends Tool
{
    protected string $name = 'reassign_task';

    protected string $description = 'Reassign a task to a different user';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'task_id' => $schema->integer()
                ->description('The ID of the task to reassign')
                ->required(),
            'new_assignee_id' => $schema->integer()
                ->description('The ID of the new assignee')
                ->required(),
            'reason' => $schema->string()
                ->description('Reason for reassignment'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'task_id' => 'required|integer|exists:tasks,id',
            'new_assignee_id' => 'required|integer|exists:users,id',
            'reason' => 'nullable|string',
        ]);

        $task = Task::find($validated['task_id']);

        // Store original assignee if not already stored
        if (! $task->original_assignee_id) {
            $task->original_assignee_id = $task->assignee_id;
        }

        $task->assignee_id = $validated['new_assignee_id'];
        $task->save();

        $data = $task->fresh()->load(['project', 'assignee', 'projectStage', 'originalAssignee'])->toArray();

        return Response::text(json_encode($data));
    }
}
