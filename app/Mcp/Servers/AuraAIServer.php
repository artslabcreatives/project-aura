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
