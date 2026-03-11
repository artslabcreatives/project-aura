<?php

return [
    /*
    |--------------------------------------------------------------------------
    | MCP Server Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration options for the Laravel MCP server.
    | The Model Context Protocol (MCP) enables bidirectional communication
    | between AI models and your Laravel application.
    |
    */

    // Server information
    'server' => [
        'name' => env('MCP_SERVER_NAME', 'Laravel MCP Server'),
        'version' => env('MCP_SERVER_VERSION', '1.0.0'),
        'heartbeat_interval' => env('MCP_HEARTBEAT_INTERVAL', 30), // seconds
    ],

    // Server capabilities
    'capabilities' => [
        'resources' => true,
        'tools' => true,
        'prompts' => true,
        'logging' => [
            'level' => env('MCP_LOG_LEVEL', 'info'),
        ],
    ],

    // HTTP settings
    'http' => [
        'middleware' => ['api'],
        'prefix' => env('MCP_ROUTE_PREFIX', 'mcp'),
        'cors' => [
            'allowed_origins' => ['*'],
            'allowed_methods' => ['GET', 'POST', 'OPTIONS'],
            'allowed_headers' => ['Content-Type', 'Authorization'],
        ],
    ],

    // SSE (Server-Sent Events) settings
    'sse' => [
        'enabled' => true,
        'heartbeat_interval' => env('MCP_HEARTBEAT_INTERVAL', 30), // seconds
        'reconnect_time' => 3000, // milliseconds
        'buffer_size' => 4096, // bytes
    ],

    // Authentication settings
    'auth' => [
        'enabled' => env('MCP_AUTH_ENABLED', false),
        'driver' => env('MCP_AUTH_DRIVER', 'token'), // options: 'token', 'session', 'sanctum'
        'guard' => env('MCP_AUTH_GUARD', 'api'),
    ],

    // Resource definitions - register your resources here or use the API
    'resources' => [
        'projects' => \App\Mcp\Resources\ProjectResource::class,
        'tasks' => \App\Mcp\Resources\TaskResource::class,
        'users' => \App\Mcp\Resources\UserResource::class,
        'departments' => \App\Mcp\Resources\DepartmentResource::class,
        'stages' => \App\Mcp\Resources\StageResource::class,
    ],

    // Tool definitions - register your tools here or use the API
    'tools' => [
        'create_task' => [
            'description' => 'Create a new task in a project',
            'handler' => \App\Mcp\Tools\CreateTaskTool::class,
        ],
        'update_task_status' => [
            'description' => 'Update the status of an existing task',
            'handler' => \App\Mcp\Tools\UpdateTaskStatusTool::class,
        ],
        'create_project' => [
            'description' => 'Create a new project',
            'handler' => \App\Mcp\Tools\CreateProjectTool::class,
        ],
        'create_stage' => [
            'description' => 'Create a new stage for a project',
            'handler' => \App\Mcp\Tools\CreateStageTool::class,
        ],
        'assign_task' => [
            'description' => 'Assign a task to a user',
            'handler' => \App\Mcp\Tools\AssignTaskTool::class,
        ],
    ],

    // Prompt definitions - register your prompts here or use the API
    'prompts' => [
        'system' => \App\Mcp\Prompts\SystemPrompt::class,
        'task_management' => \App\Mcp\Prompts\TaskManagementPrompt::class,
        'project_overview' => \App\Mcp\Prompts\ProjectOverviewPrompt::class,
    ],
];
