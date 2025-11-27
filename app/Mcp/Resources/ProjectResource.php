<?php

namespace App\Mcp\Resources;

use App\Models\Project;
use ElliottLawson\LaravelMcp\Resources\BaseResource;

class ProjectResource extends BaseResource
{
    public function __construct()
    {
        parent::__construct('projects', [
            'description' => 'Access project data including name, description, department, stages, and tasks',
        ]);
    }

    /**
     * Get project data.
     *
     * @param array $params Parameters for filtering projects
     * @return array The project data
     */
    public function getData(array $params = []): array
    {
        $query = Project::with(['department', 'stages', 'tasks']);

        if (isset($params['id'])) {
            return $query->find($params['id'])?->toArray() ?? [];
        }

        if (isset($params['department_id'])) {
            $query->where('department_id', $params['department_id']);
        }

        return $query->get()->toArray();
    }
}
