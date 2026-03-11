<?php

namespace App\Mcp\Tools;

use App\Models\Project;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateProjectTool extends Tool
{
    protected string $name = 'create_project';

    protected string $description = 'Create a new project';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'name' => $schema->string()
                ->description('The name of the project')
                ->required(),
            'description' => $schema->string()
                ->description('The description of the project'),
            'department_id' => $schema->integer()
                ->description('The ID of the department this project belongs to'),
            'deadline' => $schema->string()
                ->description('The deadline for the project (YYYY-MM-DD)'),
            'created_by' => $schema->integer()
                ->description('The ID of the user who created the project'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'department_id' => 'nullable|integer|exists:departments,id',
            'deadline' => 'nullable|date',
            'created_by' => 'nullable|integer|exists:users,id',
        ]);

        $project = Project::create($validated);
        $data = $project->load(['department', 'stages', 'creator'])->toArray();

        return Response::text(json_encode($data));
    }
}
