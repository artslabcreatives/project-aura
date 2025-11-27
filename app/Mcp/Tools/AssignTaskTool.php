<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use ElliottLawson\LaravelMcp\Tools\BaseTool;

class AssignTaskTool extends BaseTool
{
    public function __construct()
    {
        parent::__construct('assign_task', [
            'type' => 'object',
            'properties' => [
                'task_id' => [
                    'type' => 'integer',
                    'description' => 'The ID of the task to assign',
                ],
                'assignee_id' => [
                    'type' => 'integer',
                    'description' => 'The ID of the user to assign the task to',
                ],
            ],
            'required' => ['task_id', 'assignee_id'],
        ], [
            'description' => 'Assign a task to a user',
        ]);
    }

    /**
     * Execute the tool to assign a task.
     *
     * @param array $params The parameters for assigning the task
     * @return array The updated task data
     */
    public function execute(array $params = []): array
    {
        if (!$this->validateParameters($params)) {
            return ['error' => 'Invalid parameters'];
        }

        $task = Task::find($params['task_id']);
        if (!$task) {
            return ['error' => 'Task not found'];
        }

        $task->update(['assignee_id' => $params['assignee_id']]);
        return $task->fresh()->load(['project', 'assignee', 'projectStage'])->toArray();
    }
}
