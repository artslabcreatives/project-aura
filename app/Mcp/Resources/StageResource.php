<?php

namespace App\Mcp\Resources;

use App\Models\Stage;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class StageResource extends Resource
{
    protected string $description = 'Access stage data including project, responsible users, and tasks';

    protected string $mimeType = 'application/json';

    public function handle(Request $request): Response
    {
        $query = Stage::with(['project', 'mainResponsible', 'backupResponsible1', 'backupResponsible2', 'tasks']);

        $id = $request->get('id');
        if ($id) {
            $data = $query->find($id)?->toArray() ?? [];
            return Response::blob(json_encode($data));
        }

        $projectId = $request->get('project_id');
        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        $type = $request->get('type');
        if ($type) {
            $query->where('type', $type);
        }

        $data = $query->orderBy('order')->get()->toArray();
        return Response::blob(json_encode($data));
    }
}
