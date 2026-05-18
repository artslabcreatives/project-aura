<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class TaskManagementPrompt extends Prompt
{
    protected string $name = 'task_management';

    protected string $description = 'Prompt for task management operations';

    public function handle(Request $request): Response
    {
        $content = "When helping with task management:\n1. Always confirm the project context before creating tasks\n2. Suggest appropriate priorities based on due dates\n3. Recommend suitable team members based on their current workload\n4. Track task status changes and notify relevant stakeholders\n5. Ensure tasks have clear descriptions and acceptance criteria\n\nAvailable task statuses: pending, in-progress, complete\nAvailable priorities: low, medium, high";

        return Response::text($content)->asAssistant();
    }
}
