<?php

namespace App\Mcp\Prompts;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Prompt;

class ProjectOverviewPrompt extends Prompt
{
    protected string $name = 'project_overview';

    protected string $description = 'Prompt for generating project overview reports';

    public function handle(Request $request): Response
    {
        $content = "When providing project overviews:\n1. Summarize the project description and objectives\n2. List all stages and their current task counts\n3. Highlight any overdue or high-priority tasks\n4. Show team member assignments and workload distribution\n5. Provide insights on project progress and potential blockers\n\nFormat the response in a clear, scannable structure with sections for:\n- Project Summary\n- Stage Progress\n- Key Tasks\n- Team Status\n- Recommendations";

        return Response::text($content)->asAssistant();
    }
}
