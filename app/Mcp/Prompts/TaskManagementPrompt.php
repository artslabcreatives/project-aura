<?php

namespace App\Mcp\Prompts;

use ElliottLawson\LaravelMcp\Prompts\BasePrompt;

class TaskManagementPrompt extends BasePrompt
{
    public function __construct()
    {
        parent::__construct('task_management', 'When helping with task management:
1. Always confirm the project context before creating tasks
2. Suggest appropriate priorities based on due dates
3. Recommend suitable team members based on their current workload
4. Track task status changes and notify relevant stakeholders
5. Ensure tasks have clear descriptions and acceptance criteria

Available task statuses: pending, in-progress, complete
Available priorities: low, medium, high', [
            'description' => 'Prompt for task management operations',
        ]);
    }
}
