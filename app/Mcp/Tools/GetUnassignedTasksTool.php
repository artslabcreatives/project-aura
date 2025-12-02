<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetUnassignedTasksTool extends Tool
{
    protected string $name = 'get_unassigned_tasks';

    protected string $description = 'Get all tasks that have no assignee';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [];
    }

    public function handle(Request $request): Response
    {
        $tasks = Task::with(['project', 'projectStage'])
            ->whereNull('assignee_id')
            ->where('user_status', '!=', 'complete')
            ->orderBy('priority', 'desc')
            ->orderBy('due_date')
            ->get();

        $data = $tasks->toArray();

        return Response::text(json_encode($data));
    }
}
