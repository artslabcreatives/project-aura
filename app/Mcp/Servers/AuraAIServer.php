<?php

namespace App\Mcp\Servers;

use Illuminate\Support\Facades\Log;
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
        AuraAI Server provides AI-powered project, task, and finance management capabilities.
        Use the available tools to create projects, stages, tasks, and manage task assignments and statuses.
        Query resources to get information about projects, tasks, departments, stages, and users.

        ## PO (Purchase Order) Processing Workflow

        When you receive a PO document or PO details, follow these exact steps in order:

        **STEP 1 – EXTRACT** from the PO:
        - PO number (the unique identifier, e.g. "4563172446")
        - Client/company name (the company that ISSUED the PO — this is who we invoice)
        - Total net amount (excluding tax)
        - Line item descriptions (used as fallback search keywords)

        **STEP 2 – SEARCH** for the matching estimate using `search_estimates`:
        - First attempt: `search_by = "client_name"`, `search_query = "<client company name>"`, `has_project = false`, `has_amount = false`
        - If zero results: try `search_by = "all"`, `search_query = "<keyword from a line item>"`, `has_project = false`, `has_amount = false`
        - If still zero results: try `search_by = "all"` with no `search_query` to see all estimates, then pick the closest match by amount

        **STEP 3 – MATCH** the correct estimate:
        - Compare each result's `amount` field to the PO total net amount
        - Prefer the estimate whose amount is closest to the PO total
        - If multiple estimates match, prefer the one whose title or project name contains keywords from the PO line items

        **STEP 4 – ATTACH** the PO using `attach_estimate_po`:
        - Use the `id` from the matched estimate result as `estimate_id`
        - Use the PO number string as `po_number`
        - Do NOT set `provisional = true` unless the user explicitly says it is provisional
        - Do NOT include `po_document` unless you have a valid file path or URL

        **STEP 5 – REPORT** the outcome:
        - State the PO number, matched estimate title, matched project name, and amount
        - If you could not find a match, list the closest candidates and ask the user to confirm

        ## Important Rules
        - ALWAYS call `search_estimates` before `attach_estimate_po` — never guess an estimate ID
        - When calling `search_estimates`, pass only plain string values — never prefix values with "=" or other special characters
        - The `search_by` parameter must be exactly one of: `all`, `project_name`, `client_name`, `estimate_number`, `title`
        - The `status` parameter must be exactly one of: `draft`, `sent`, `accepted`, `rejected`, `all`
        - All tool parameters must be valid JSON — do not include trailing commas or comments
    MARKDOWN;

    public function handle(string $rawMessage): void
    {
        $decoded = json_decode($rawMessage, true);
        Log::channel('daily')->info('[MCP] Incoming raw message', [
            'raw'        => $rawMessage,
            'method'     => $decoded['method'] ?? null,
            'params'     => $decoded['params'] ?? null,
            'json_valid' => json_last_error() === JSON_ERROR_NONE,
            'json_error' => json_last_error() !== JSON_ERROR_NONE ? json_last_error_msg() : null,
        ]);

        parent::handle($rawMessage);
    }

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
        // Finance/Estimate tools
        \App\Mcp\Tools\SearchEstimatesTool::class,
        \App\Mcp\Tools\AttachEstimatePOTool::class,
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
