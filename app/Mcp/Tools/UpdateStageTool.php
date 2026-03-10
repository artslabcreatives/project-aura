<?php

namespace App\Mcp\Tools;

use App\Models\Stage;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UpdateStageTool extends Tool
{
    protected string $name = 'update_stage';

    protected string $description = 'Update an existing stage';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'stage_id' => $schema->integer()
                ->description('The ID of the stage to update')
                ->required(),
            'title' => $schema->string()
                ->description('The title of the stage'),
            'color' => $schema->string()
                ->description('The color of the stage'),
            'order' => $schema->integer()
                ->description('The order of the stage'),
            'type' => $schema->string()
                ->description('The type of the stage'),
            'main_responsible_id' => $schema->integer()
                ->description('The ID of the main responsible user'),
            'is_review_stage' => $schema->boolean()
                ->description('Whether this is a review stage'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'stage_id' => 'required|integer|exists:stages,id',
            'title' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'order' => 'nullable|integer',
            'type' => 'nullable|string|max:255',
            'main_responsible_id' => 'nullable|integer|exists:users,id',
            'is_review_stage' => 'nullable|boolean',
        ]);

        $stage = Stage::find($validated['stage_id']);
        $updateData = array_filter($validated, fn ($key) => $key !== 'stage_id', ARRAY_FILTER_USE_KEY);

        $stage->update($updateData);

        $data = $stage->fresh()->load(['project', 'mainResponsible'])->toArray();

        return Response::text(json_encode($data));
    }
}
