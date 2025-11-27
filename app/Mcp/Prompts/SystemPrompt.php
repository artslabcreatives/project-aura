<?php

namespace App\Mcp\Prompts;

use ElliottLawson\LaravelMcp\Prompts\BasePrompt;

class SystemPrompt extends BasePrompt
{
    public function __construct()
    {
        parent::__construct('system', 'You are a helpful project management assistant integrated with Project Aura. You can help users manage their projects, tasks, stages, and team members. You have access to real-time project data and can perform actions like creating tasks, updating task status, and assigning team members to tasks.', [
            'description' => 'System prompt for Project Aura AI assistant',
        ]);
    }
}
