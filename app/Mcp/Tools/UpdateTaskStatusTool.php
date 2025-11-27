<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use ElliottLawson\LaravelMcp\Tools\BaseTool;

class UpdateTaskStatusTool extends BaseTool
{
    public function __construct()
    {
        parent::__construct('update_task_status', [
            'type' => 'object',
            'properties' => [
                'task_id' => [
                    'type' => 'integer',
                    'description' => 'The ID of the task to update',
                ],
                'user_status' => [
                    'type' => 'string',
                    'enum' => ['pending', 'in-progress', 'complete'],
                    'description' => 'The new status for the task',
                ],
            ],
            'required' => ['task_id', 'user_status'],
        ], [
            'description' => 'Update the status of an existing task',
        ]);
    }

    /**
     * Execute the tool to update task status.
     *
     * @param array $params The parameters for updating the task status
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

        $task->update(['user_status' => $params['user_status']]);
        
        if ($params['user_status'] === 'complete') {
            $task->update(['completed_at' => now()]);
        }

        return $task->fresh()->load(['project', 'assignee', 'projectStage'])->toArray();
    }
}
