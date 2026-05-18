<?php

namespace App\Mcp\Tools;

use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class SendReminderTool extends Tool
{
    protected string $name = 'send_reminder';

    protected string $description = 'Send reminders to users via Slack/WhatsApp/Email';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'user_id' => $schema->integer()
                ->description('The ID of the user to send reminder to')
                ->required(),
            'message' => $schema->string()
                ->description('The reminder message')
                ->required(),
            'channel' => $schema->string()
                ->enum(['slack', 'email', 'whatsapp'])
                ->description('The channel to send reminder through'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'message' => 'required|string',
            'channel' => 'nullable|in:slack,email,whatsapp',
        ]);

        $user = User::find($validated['user_id']);
        $channel = $validated['channel'] ?? 'email';

        // This is a placeholder implementation
        // In a real system, you would integrate with actual notification services
        $result = [
            'status' => 'success',
            'user' => $user->name,
            'message' => $validated['message'],
            'channel' => $channel,
            'sent_at' => now()->toDateTimeString(),
        ];

        return Response::text(json_encode($result));
    }
}
