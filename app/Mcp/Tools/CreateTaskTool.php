<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use ElliottLawson\LaravelMcp\Tools\BaseTool;

class CreateTaskTool extends BaseTool
{
    public function __construct()
    {
        parent::__construct('create_task', [
            'type' => 'object',
            'properties' => [
                'title' => [
                    'type' => 'string',
                    'description' => 'The title of the task',
                ],
                'description' => [
                    'type' => 'string',
                    'description' => 'The description of the task',
                ],
                'project_id' => [
                    'type' => 'integer',
                    'description' => 'The ID of the project this task belongs to',
                ],
                'assignee_id' => [
                    'type' => 'integer',
                    'description' => 'The ID of the user assigned to this task',
                ],
                'due_date' => [
                    'type' => 'string',
                    'description' => 'The due date of the task (YYYY-MM-DD)',
                ],
                'priority' => [
                    'type' => 'string',
                    'enum' => ['low', 'medium', 'high'],
                    'description' => 'The priority level of the task',
                ],
            ],
            'required' => ['title', 'project_id'],
        ], [
            'description' => 'Create a new task in a project',
        ]);
    }

    /**
     * Execute the tool to create a new task.
     *
     * @param array $params The parameters for creating the task
     * @return array The created task data
     */
    public function execute(array $params = []): array
    {
        if (!$this->validateParameters($params)) {
            return ['error' => 'Invalid parameters'];
        }

        $task = Task::create($params);
        return $task->load(['project', 'assignee'])->toArray();
    }
}
