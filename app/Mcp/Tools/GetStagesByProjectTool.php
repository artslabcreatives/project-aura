<?php

namespace App\Mcp\Tools;

use App\Models\Stage;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GetStagesByProjectTool extends Tool
{
    protected string $name = 'get_stages_by_project';

    protected string $description = 'Get all stages for a specific project';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'project_id' => $schema->integer()
                ->description('The ID of the project')
                ->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'project_id' => 'required|integer|exists:projects,id',
        ]);

        $stages = Stage::with(['project', 'mainResponsible', 'backupResponsible1', 'backupResponsible2', 'tasks'])
            ->where('project_id', $validated['project_id'])
            ->orderBy('order')
            ->get();

        $data = $stages->toArray();

        return Response::text(json_encode($data));
    }
}
