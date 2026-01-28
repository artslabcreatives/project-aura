<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateUserStatusTool extends Tool
{
    protected string $name = 'update_user_status';

    protected string $description = 'Update the status of a user';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'user_id' => $schema->integer()
                ->description('The ID of the user to update')
                ->required(),
            'status' => $schema->string()
                ->enum(['working', 'idle', 'on_leave', 'blocked', 'reviewing', 'overworked'])
                ->description('The new status for the user')
                ->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'status' => 'required|in:working,idle,on_leave,blocked,reviewing,overworked',
        ]);

        $user = User::find($validated['user_id']);
        $user->update(['status' => $validated['status']]);

        $data = $user->fresh()->load(['department', 'assignedTasks'])->toArray();

        return Response::text(json_encode($data));
    }
}
