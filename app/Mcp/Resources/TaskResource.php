<?php

namespace App\Mcp\Resources;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;

class TaskResource extends Resource
{
    protected string $description = 'Access task data including title, description, assignee, status, priority, and attachments';

    protected string $mimeType = 'application/json';

    public function handle(Request $request): Response
    {
        $query = Task::with(['project', 'assignee', 'projectStage', 'attachments', 'revisionHistories']);

        $id = $request->get('id');
        if ($id) {
            $data = $query->find($id)?->toArray() ?? [];
            return Response::blob(json_encode($data));
        }

        $projectId = $request->get('project_id');
        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        $assigneeId = $request->get('assignee_id');
        if ($assigneeId) {
            $query->where('assignee_id', $assigneeId);
        }

        $userStatus = $request->get('user_status');
        if ($userStatus) {
            $query->where('user_status', $userStatus);
        }

        $priority = $request->get('priority');
        if ($priority) {
            $query->where('priority', $priority);
        }

        $data = $query->get()->toArray();
        return Response::blob(json_encode($data));
    }
}
