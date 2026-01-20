<?php

namespace App\Mcp\Resources;

use App\Models\Department;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class DepartmentResource extends Resource
{
    protected string $description = 'Access department data including users and projects';

    protected string $mimeType = 'application/json';

    public function handle(Request $request): Response
    {
        $query = Department::with(['users', 'projects']);

        $id = $request->get('id');
        if ($id) {
            $data = $query->find($id)?->toArray() ?? [];
            return Response::blob(json_encode($data));
        }

        $data = $query->get()->toArray();
        return Response::blob(json_encode($data));
    }
}
