<?php

namespace App\Mcp\Resources;

use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class UserResource extends Resource
{
    protected string $description = 'Access user data including name, email, role, department, and assigned tasks';

    protected string $mimeType = 'application/json';

    public function handle(Request $request): Response
    {
        $query = User::with(['department', 'assignedTasks']);

        $id = $request->get('id');
        if ($id) {
            $data = $query->find($id)?->toArray() ?? [];
            return Response::blob(json_encode($data));
        }

        $departmentId = $request->get('department_id');
        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $role = $request->get('role');
        if ($role) {
            $query->where('role', $role);
        }

        $data = $query->get()->toArray();
        return Response::blob(json_encode($data));
    }
}
