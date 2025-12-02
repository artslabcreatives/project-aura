<?php

namespace App\Mcp\Tools;

use App\Models\Stage;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class CreateStageTool extends Tool
{
    protected string $name = 'create_stage';

    protected string $description = 'Create a new stage for a project';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'title' => $schema->string()
                ->description('The title of the stage')
                ->required(),
            'project_id' => $schema->integer()
                ->description('The ID of the project this stage belongs to')
                ->required(),
            'order' => $schema->integer()
                ->description('The order position of the stage'),
            'color' => $schema->string()
                ->description('The color class for the stage (e.g., bg-blue-500)'),
            'is_review_stage' => $schema->boolean()
                ->description('Whether this is a review stage'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'project_id' => 'required|integer|exists:projects,id',
            'order' => 'nullable|integer',
            'color' => 'nullable|string|max:255',
            'is_review_stage' => 'nullable|boolean',
        ]);

        $stage = Stage::create($validated);
        $data = $stage->load(['project', 'mainResponsible'])->toArray();
        return Response::text(json_encode($data));
    }
}
