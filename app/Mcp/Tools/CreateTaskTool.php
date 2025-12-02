<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateTaskTool extends Tool
{
    protected string $name = 'create_task';

    protected string $description = 'Create a new task in a project';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'title' => $schema->string()
                ->description('The title of the task')
                ->required(),
            'description' => $schema->string()
                ->description('The description of the task'),
            'project_id' => $schema->integer()
                ->description('The ID of the project this task belongs to')
                ->required(),
            'assignee_id' => $schema->integer()
                ->description('The ID of the user assigned to this task'),
            'due_date' => $schema->string()
                ->description('The due date of the task (YYYY-MM-DD)'),
            'priority' => $schema->string()
                ->enum(['low', 'medium', 'high'])
                ->description('The priority level of the task'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|integer|exists:projects,id',
            'assignee_id' => 'nullable|integer|exists:users,id',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        $task = Task::create($validated);
        $data = $task->load(['project', 'assignee'])->toArray();
        return Response::text(json_encode($data));
    }
}
