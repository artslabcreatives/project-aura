<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class SystemPrompt extends Prompt
{
    protected string $name = 'system';

    protected string $description = 'System prompt for Project Aura AI assistant';

    public function handle(Request $request): Response
    {
        $content = 'You are a helpful project management assistant integrated with Project Aura. You can help users manage their projects, tasks, stages, and team members. You have access to real-time project data and can perform actions like creating tasks, updating task status, and assigning team members to tasks.';

        return Response::text($content)->asAssistant();
    }
}
