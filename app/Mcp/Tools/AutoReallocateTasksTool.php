<?php

namespace App\Mcp\Tools;

use App\Models\Task;
use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class AutoReallocateTasksTool extends Tool
{
    protected string $name = 'auto_reallocate_tasks';

    protected string $description = 'Automatically reallocate tasks from overloaded or unavailable users to available users';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'user_id' => $schema->integer()
                ->description('The ID of the user whose tasks should be reallocated (optional, will auto-detect if not provided)'),
            'reason' => $schema->string()
                ->enum(['on_leave', 'overloaded', 'blocked'])
                ->description('The reason for reallocation'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'reason' => 'nullable|in:on_leave,overloaded,blocked',
        ]);

        $usersToReallocate = [];

        if (isset($validated['user_id'])) {
            $usersToReallocate[] = User::find($validated['user_id']);
        } else {
            // Auto-detect users who need reallocation
            $usersToReallocate = User::whereIn('status', ['on_leave', 'overworked', 'blocked'])->get();
        }

        $reallocations = [];

        foreach ($usersToReallocate as $user) {
            // Get incomplete tasks for this user
            $tasks = Task::where('assignee_id', $user->id)
                ->where('user_status', '!=', 'complete')
                ->get();

            foreach ($tasks as $task) {
                // Find available user in the same department with least workload
                $availableUser = $this->findAvailableUser($user->department_id);

                if ($availableUser) {
                    // Store original assignee if not already stored
                    if (! $task->original_assignee_id) {
                        $task->original_assignee_id = $task->assignee_id;
                    }

                    $task->assignee_id = $availableUser->id;
                    $task->save();

                    $reallocations[] = [
                        'task_id' => $task->id,
                        'task_title' => $task->title,
                        'from_user' => $user->name,
                        'to_user' => $availableUser->name,
                        'reason' => $validated['reason'] ?? $user->status,
                    ];
                }
            }
        }

        $result = [
            'status' => 'success',
            'reallocations' => $reallocations,
            'total_reallocated' => count($reallocations),
        ];

        return Response::text(json_encode($result));
    }

    /**
     * Find an available user in the same department with the least workload
     */
    private function findAvailableUser(?int $departmentId): ?User
    {
        $users = User::where('department_id', $departmentId)
            ->whereNotIn('status', ['on_leave', 'blocked'])
            ->with('assignedTasks')
            ->get();

        if ($users->isEmpty()) {
            // Fallback to users from any department
            $users = User::whereNotIn('status', ['on_leave', 'blocked'])
                ->with('assignedTasks')
                ->get();
        }

        // Sort by workload (ascending)
        $users = $users->sortBy(function ($user) {
            return $user->assignedTasks()
                ->where('user_status', '!=', 'complete')
                ->sum('estimated_hours');
        });

        return $users->first();
    }
}
