<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class StageController extends Controller
{
    #[OA\Get(
        path: "/stages",
        summary: "List all stages",
        security: [["bearerAuth" => []]],
        tags: ["Stages"],
        parameters: [
            new OA\Parameter(
                name: "project_id",
                in: "query",
                required: false,
                description: "Filter by project ID",
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "stage_group_id",
                in: "query",
                required: false,
                description: "Filter by stage group ID",
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of stages with stage group information",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "id", type: "integer", example: 1),
                            new OA\Property(property: "title", type: "string", example: "Design"),
                            new OA\Property(property: "color", type: "string", example: "bg-blue-500"),
                            new OA\Property(property: "order", type: "integer", example: 1),
                            new OA\Property(property: "type", type: "string", enum: ["user", "project"], example: "project"),
                            new OA\Property(property: "stage_group_id", type: "integer", nullable: true, example: 1),
                            new OA\Property(property: "project", type: "object", example: ["id" => 1, "name" => "Project Name"]),
                            new OA\Property(property: "stageGroup", type: "object", example: ["id" => 1, "name" => "Completed"], nullable: true),
                        ],
                        type: "object"
                    )
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Stage::with(['project', 'mainResponsible', 'backupResponsible1', 'backupResponsible2', 'stageGroup']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->has('stage_group_id')) {
            $query->where('stage_group_id', $request->stage_group_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
            if ($request->type === 'user') {
                $query->where('user_id', auth()->id());
                
                if ($request->has('context_stage_id')) {
                    $query->where('context_stage_id', $request->context_stage_id);
                }
            }
        }
        
        $stages = $query->orderBy('order')->get();
        return response()->json($stages);
    }

    #[OA\Post(
        path: "/stages",
        summary: "Create a new stage",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title"],
                properties: [
                    new OA\Property(property: "title", type: "string", example: "Design"),
                    new OA\Property(property: "color", type: "string", example: "bg-blue-500"),
                    new OA\Property(property: "order", type: "integer", example: 1),
                    new OA\Property(property: "type", type: "string", enum: ["user", "project"], example: "project"),
                    new OA\Property(property: "project_id", type: "integer", nullable: true),
                    new OA\Property(property: "stage_group_id", type: "integer", nullable: true, description: "ID of the stage group this stage belongs to"),
                    new OA\Property(property: "main_responsible_id", type: "integer", nullable: true),
                    new OA\Property(property: "is_review_stage", type: "boolean", example: false)
                ]
            )
        ),
        tags: ["Stages"],
        responses: [
            new OA\Response(response: 201, description: "Stage created with stage group information"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'color' => 'sometimes|string|max:255',
            'order' => 'sometimes|integer',
            'type' => 'sometimes|in:user,project',
            'project_id' => 'nullable|required_if:type,project|exists:projects,id',
            'main_responsible_id' => 'nullable|exists:users,id',
            'backup_responsible_id_1' => 'nullable|exists:users,id',
            'backup_responsible_id_2' => 'nullable|exists:users,id',
            'is_review_stage' => 'sometimes|boolean',
            'linked_review_stage_id' => 'nullable|exists:stages,id',
            'approved_target_stage_id' => 'nullable|exists:stages,id',
            'stage_group_id' => 'nullable|exists:stage_groups,id',
            'context_stage_id' => 'nullable|exists:stages,id',
        ]);

        if (isset($validated['type']) && $validated['type'] === 'user') {
            $validated['user_id'] = auth()->id();
        }

        $stage = Stage::create($validated);
        return response()->json($stage->load(['project', 'mainResponsible', 'stageGroup']), 201);
    }

    #[OA\Get(
        path: "/stages/{id}",
        summary: "Get stage by ID",
        security: [["bearerAuth" => []]],
        tags: ["Stages"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Stage details with stage group information"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Stage not found")
        ]
    )]
    public function show(Stage $stage): JsonResponse
    {
        return response()->json($stage->load(['project', 'mainResponsible', 'backupResponsible1', 'backupResponsible2', 'stageGroup', 'tasks']));
    }

    #[OA\Put(
        path: "/stages/{id}",
        summary: "Update stage",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "color", type: "string"),
                    new OA\Property(property: "order", type: "integer"),
                    new OA\Property(property: "stage_group_id", type: "integer", nullable: true, description: "ID of the stage group this stage belongs to"),
                    new OA\Property(property: "main_responsible_id", type: "integer", nullable: true),
                    new OA\Property(property: "is_review_stage", type: "boolean")
                ]
            )
        ),
        tags: ["Stages"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Stage updated with stage group information"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Stage not found")
        ]
    )]
    public function update(Request $request, Stage $stage): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'color' => 'sometimes|string|max:255',
            'order' => 'sometimes|integer',
            'type' => 'sometimes|in:user,project',
            'project_id' => 'nullable|exists:projects,id',
            'main_responsible_id' => 'nullable|exists:users,id',
            'backup_responsible_id_1' => 'nullable|exists:users,id',
            'backup_responsible_id_2' => 'nullable|exists:users,id',
            'is_review_stage' => 'sometimes|boolean',
            'linked_review_stage_id' => 'nullable|exists:stages,id',
            'approved_target_stage_id' => 'nullable|exists:stages,id',
            'stage_group_id' => 'nullable|exists:stage_groups,id',
        ]);

        $stage->update($validated);
        return response()->json($stage->load(['project', 'mainResponsible', 'stageGroup']));
    }

    #[OA\Delete(
        path: "/stages/{id}",
        summary: "Delete stage",
        security: [["bearerAuth" => []]],
        tags: ["Stages"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "Stage deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Stage not found")
        ]
    )]
    public function destroy(Stage $stage): JsonResponse
    {
        $stage->delete();
        return response()->json(null, 204);
    }
}
