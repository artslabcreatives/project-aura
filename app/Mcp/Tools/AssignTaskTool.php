<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class AssignTaskTool extends Tool
{
    protected string $name = 'assign_task';

    protected string $description = 'Assign a task to a user';

    /**
     * Get the tool's input schema.
     *
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'task_id' => $schema->integer()
                ->description('The ID of the task to assign')
                ->required(),
            'assignee_id' => $schema->integer()
                ->description('The ID of the user to assign the task to')
                ->required(),
        ];
    }

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'task_id' => 'required|integer|exists:tasks,id',
            'assignee_id' => 'required|integer|exists:users,id',
        ]);

        $task = Task::find($validated['task_id']);
        $task->update(['assignee_id' => $validated['assignee_id']]);

        $data = $task->fresh()->load(['project', 'assignee', 'projectStage'])->toArray();

        return Response::text(json_encode($data));
    }
}
