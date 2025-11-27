<?php

namespace App\Mcp\Resources;

use App\Models\Department;
use ElliottLawson\LaravelMcp\Resources\BaseResource;

class DepartmentResource extends BaseResource
{
    public function __construct()
    {
        parent::__construct('departments', [
            'description' => 'Access department data including users and projects',
        ]);
    }

    /**
     * Get department data.
     *
     * @param array $params Parameters for filtering departments
     * @return array The department data
     */
    public function getData(array $params = []): array
    {
        $query = Department::with(['users', 'projects']);

        if (isset($params['id'])) {
            return $query->find($params['id'])?->toArray() ?? [];
        }

        return $query->get()->toArray();
    }
}
