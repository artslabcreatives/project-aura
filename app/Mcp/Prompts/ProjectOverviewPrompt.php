<?php

namespace App\Mcp\Prompts;

use ElliottLawson\LaravelMcp\Prompts\BasePrompt;

class ProjectOverviewPrompt extends BasePrompt
{
    public function __construct()
    {
        parent::__construct('project_overview', 'When providing project overviews:
1. Summarize the project description and objectives
2. List all stages and their current task counts
3. Highlight any overdue or high-priority tasks
4. Show team member assignments and workload distribution
5. Provide insights on project progress and potential blockers

Format the response in a clear, scannable structure with sections for:
- Project Summary
- Stage Progress
- Key Tasks
- Team Status
- Recommendations', [
            'description' => 'Prompt for generating project overview reports',
        ]);
    }
}
