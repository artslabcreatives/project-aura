<?php

namespace App\Mcp\Servers;

use Laravel\Mcp\Server;

class AuraAIServer extends Server
{
    /**
     * The MCP server's name.
     */
    protected string $name = 'AuraAI Server';

    /**
     * The MCP server's version.
     */
    protected string $version = '0.0.1';

    /**
     * The MCP server's instructions for the LLM.
     */
    protected string $instructions = <<<'MARKDOWN'
        AuraAI Server provides AI-powered project and task management capabilities.
        Use the available tools to create projects, stages, tasks, and manage task assignments and statuses.
        Query resources to get information about projects, tasks, departments, stages, and users.
    MARKDOWN;

    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        \App\Mcp\Tools\AssignTaskTool::class,
        \App\Mcp\Tools\CreateProjectTool::class,
        \App\Mcp\Tools\CreateStageTool::class,
        \App\Mcp\Tools\CreateTaskTool::class,
        \App\Mcp\Tools\UpdateTaskStatusTool::class,
        // New project tools
        \App\Mcp\Tools\UpdateProjectTool::class,
        \App\Mcp\Tools\GetPendingProjectsTool::class,
        // New stage tools
        \App\Mcp\Tools\UpdateStageTool::class,
        \App\Mcp\Tools\GetStagesByProjectTool::class,
        // New task tools
        \App\Mcp\Tools\ReassignTaskTool::class,
        \App\Mcp\Tools\GetOverdueTasksTool::class,
        \App\Mcp\Tools\GetUnassignedTasksTool::class,
        \App\Mcp\Tools\GetBlockedTasksTool::class,
        \App\Mcp\Tools\GetPendingReviewTasksTool::class,
        // New user tools
        \App\Mcp\Tools\UpdateUserStatusTool::class,
        \App\Mcp\Tools\GetUsersOnLeaveTool::class,
        \App\Mcp\Tools\GetOverworkedUsersTool::class,
        \App\Mcp\Tools\GetIdleUsersTool::class,
        // New automation tools
        \App\Mcp\Tools\SendReminderTool::class,
        \App\Mcp\Tools\GenerateDailyReportTool::class,
        \App\Mcp\Tools\AutoReallocateTasksTool::class,
    ];

    /**
     * The resources registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Resource>>
     */
    protected array $resources = [
        \App\Mcp\Resources\DepartmentResource::class,
        \App\Mcp\Resources\ProjectResource::class,
        \App\Mcp\Resources\StageResource::class,
        \App\Mcp\Resources\TaskResource::class,
        \App\Mcp\Resources\UserResource::class,
    ];

    /**
     * The prompts registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Prompt>>
     */
    protected array $prompts = [
        \App\Mcp\Prompts\ProjectOverviewPrompt::class,
        \App\Mcp\Prompts\SystemPrompt::class,
        \App\Mcp\Prompts\TaskManagementPrompt::class,
    ];
}
