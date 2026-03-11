<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetOverworkedUsersTool extends Tool
{
    protected string $name = 'get_overworked_users';

    protected string $description = 'Get all users who are overworked based on assigned workload > capacity';

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
                // Calculate assigned hours from incomplete tasks
                $assignedHours = $user->assignedTasks()
                    ->where('user_status', '!=', 'complete')
                    ->sum('estimated_hours');

                return $assignedHours > $user->capacity_hours_per_day;
            })
            ->map(function ($user) {
                $assignedHours = $user->assignedTasks()
                    ->where('user_status', '!=', 'complete')
                    ->sum('estimated_hours');

                $userData = $user->toArray();
                $userData['assigned_hours'] = $assignedHours;
                $userData['overload_hours'] = $assignedHours - $user->capacity_hours_per_day;

                return $userData;
            });

        $data = $users->values()->toArray();

        return Response::text(json_encode($data));
    }
}
