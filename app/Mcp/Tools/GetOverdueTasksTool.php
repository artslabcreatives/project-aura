<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetOverdueTasksTool extends Tool
{
    protected string $name = 'get_overdue_tasks';

    protected string $description = 'Get all tasks that are overdue';

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
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->where('user_status', '!=', 'complete')
            ->orderBy('due_date')
            ->get();

        $data = $tasks->toArray();

        return Response::text(json_encode($data));
    }
}
