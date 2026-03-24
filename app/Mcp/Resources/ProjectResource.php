<?php

namespace App\Mcp\Resources;

use App\Models\Project;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class ProjectResource extends Resource
{
    protected string $description = 'Access project data including name, description, department, stages, and tasks';

    protected string $mimeType = 'application/json';

    public function handle(Request $request): Response
    {
        $query = Project::with(['department', 'stages', 'tasks']);

        $id = $request->get('id');
        if ($id) {
            $data = $query->find($id)?->toArray() ?? [];
            return Response::blob(json_encode($data));
        }

        $departmentId = $request->get('department_id');
        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        $data = $query->get()->toArray();
        return Response::blob(json_encode($data));
    }
}
