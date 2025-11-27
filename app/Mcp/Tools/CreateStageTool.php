<?php

namespace App\Mcp\Tools;

use App\Models\Stage;
use ElliottLawson\LaravelMcp\Tools\BaseTool;

class CreateStageTool extends BaseTool
{
    public function __construct()
    {
        parent::__construct('create_stage', [
            'type' => 'object',
            'properties' => [
                'title' => [
                    'type' => 'string',
                    'description' => 'The title of the stage',
                ],
                'project_id' => [
                    'type' => 'integer',
                    'description' => 'The ID of the project this stage belongs to',
                ],
                'order' => [
                    'type' => 'integer',
                    'description' => 'The order position of the stage',
                ],
                'color' => [
                    'type' => 'string',
                    'description' => 'The color class for the stage (e.g., bg-blue-500)',
                ],
                'is_review_stage' => [
                    'type' => 'boolean',
                    'description' => 'Whether this is a review stage',
                ],
            ],
            'required' => ['title', 'project_id'],
        ], [
            'description' => 'Create a new stage for a project',
        ]);
    }

    /**
     * Execute the tool to create a new stage.
     *
     * @param array $params The parameters for creating the stage
     * @return array The created stage data
     */
    public function execute(array $params = []): array
    {
        if (!$this->validateParameters($params)) {
            return ['error' => 'Invalid parameters'];
        }

        $stage = Stage::create($params);
        return $stage->load(['project', 'mainResponsible'])->toArray();
    }
}
