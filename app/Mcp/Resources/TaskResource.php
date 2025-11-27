<?php

namespace App\Mcp\Resources;

use App\Models\Task;
use ElliottLawson\LaravelMcp\Resources\BaseResource;

class TaskResource extends BaseResource
{
    public function __construct()
    {
        parent::__construct('tasks', [
            'description' => 'Access task data including title, description, assignee, status, priority, and attachments',
        ]);
    }

    /**
     * Get task data.
     *
     * @param array $params Parameters for filtering tasks
     * @return array The task data
     */
    public function getData(array $params = []): array
    {
        $query = Task::with(['project', 'assignee', 'projectStage', 'attachments', 'revisionHistories']);

        if (isset($params['id'])) {
            return $query->find($params['id'])?->toArray() ?? [];
        }

        if (isset($params['project_id'])) {
            $query->where('project_id', $params['project_id']);
        }

        if (isset($params['assignee_id'])) {
            $query->where('assignee_id', $params['assignee_id']);
        }

        if (isset($params['user_status'])) {
            $query->where('user_status', $params['user_status']);
        }

        if (isset($params['priority'])) {
            $query->where('priority', $params['priority']);
        }

        return $query->get()->toArray();
    }
}
