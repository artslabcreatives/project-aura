<?php

namespace App\Mcp\Resources;

use App\Models\User;
use ElliottLawson\LaravelMcp\Resources\BaseResource;

class UserResource extends BaseResource
{
    public function __construct()
    {
        parent::__construct('users', [
            'description' => 'Access user data including name, email, role, department, and assigned tasks',
        ]);
    }

    /**
     * Get user data.
     *
     * @param array $params Parameters for filtering users
     * @return array The user data
     */
    public function getData(array $params = []): array
    {
        $query = User::with(['department', 'assignedTasks']);

        if (isset($params['id'])) {
            return $query->find($params['id'])?->toArray() ?? [];
        }

        if (isset($params['department_id'])) {
            $query->where('department_id', $params['department_id']);
        }

        if (isset($params['role'])) {
            $query->where('role', $params['role']);
        }

        return $query->get()->toArray();
    }
}
