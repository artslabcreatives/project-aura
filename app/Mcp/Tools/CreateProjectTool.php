<?php

namespace App\Mcp\Tools;

use App\Models\Project;
use ElliottLawson\LaravelMcp\Tools\BaseTool;

class CreateProjectTool extends BaseTool
{
    public function __construct()
    {
        parent::__construct('create_project', [
            'type' => 'object',
            'properties' => [
                'name' => [
                    'type' => 'string',
                    'description' => 'The name of the project',
                ],
                'description' => [
                    'type' => 'string',
                    'description' => 'The description of the project',
                ],
                'department_id' => [
                    'type' => 'integer',
                    'description' => 'The ID of the department this project belongs to',
                ],
            ],
            'required' => ['name'],
        ], [
            'description' => 'Create a new project',
        ]);
    }

    /**
     * Execute the tool to create a new project.
     *
     * @param array $params The parameters for creating the project
     * @return array The created project data
     */
    public function execute(array $params = []): array
    {
        if (!$this->validateParameters($params)) {
            return ['error' => 'Invalid parameters'];
        }

        $project = Project::create($params);
        return $project->load(['department', 'stages'])->toArray();
    }
}
