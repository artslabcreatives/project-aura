<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetBlockedTasksTool extends Tool
{
    protected string $name = 'get_blocked_tasks';

    protected string $description = 'Get all tasks that are blocked';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [];
    }

    public function handle(Request $request): Response
    {
        $tasks = Task::with(['project', 'assignee', 'projectStage'])
            ->where('user_status', 'blocked')
            ->orderBy('priority', 'desc')
            ->orderBy('due_date')
            ->get();

        $data = $tasks->toArray();

        return Response::text(json_encode($data));
    }
}
