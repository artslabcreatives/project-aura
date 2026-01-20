<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetUsersOnLeaveTool extends Tool
{
    protected string $name = 'get_users_on_leave';

    protected string $description = 'Get all users who are on leave';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [];
    }

    public function handle(Request $request): Response
    {
        $users = User::with(['department', 'assignedTasks'])
            ->where('status', 'on_leave')
            ->get();

        $data = $users->toArray();

        return Response::text(json_encode($data));
    }
}
