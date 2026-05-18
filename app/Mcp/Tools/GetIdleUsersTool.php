<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetIdleUsersTool extends Tool
{
    protected string $name = 'get_idle_users';

    protected string $description = 'Get all users who have no active tasks';

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
            ->get()
            ->filter(function ($user) {
                // Check if user has no incomplete tasks
                $activeTasks = $user->assignedTasks()
                    ->where('user_status', '!=', 'complete')
                    ->count();

                return $activeTasks === 0;
            });

        $data = $users->values()->toArray();

        return Response::text(json_encode($data));
    }
}
