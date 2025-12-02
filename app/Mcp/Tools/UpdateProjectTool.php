<?php

namespace App\Mcp\Tools;

use App\Models\Project;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateProjectTool extends Tool
{
    protected string $name = 'update_project';

    protected string $description = 'Update an existing project';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'project_id' => $schema->integer()
                ->description('The ID of the project to update')
                ->required(),
            'name' => $schema->string()
                ->description('The name of the project'),
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
            'project_id' => 'required|integer|exists:projects,id',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'department_id' => 'nullable|integer|exists:departments,id',
            'deadline' => 'nullable|date',
            'created_by' => 'nullable|integer|exists:users,id',
        ]);

        $project = Project::find($validated['project_id']);
        $updateData = array_filter($validated, fn ($key) => $key !== 'project_id', ARRAY_FILTER_USE_KEY);

        $project->update($updateData);

        $data = $project->fresh()->load(['department', 'stages', 'creator'])->toArray();

        return Response::text(json_encode($data));
    }
}
