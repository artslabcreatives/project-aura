<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StageGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class StageGroupController extends Controller
{
    #[OA\Get(
        path: "/stage-groups",
        summary: "List all stage groups",
        description: "Retrieve all stage groups with their associated stages. Stages include their names and stage_group_id.",
        security: [["bearerAuth" => []]],
        tags: ["Stage Groups"],
        parameters: [
            new OA\Parameter(
                name: "project_id",
                in: "query",
                required: false,
                description: "Filter by project ID",
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of stage groups with stages",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "id", type: "integer", example: 1),
                            new OA\Property(property: "name", type: "string", example: "Completed"),
                            new OA\Property(property: "description", type: "string", nullable: true, example: "Stages for completed tasks"),
                            new OA\Property(
                                property: "stages",
                                type: "array",
                                items: new OA\Items(
                                    properties: [
                                        new OA\Property(property: "id", type: "integer"),
                                        new OA\Property(property: "title", type: "string"),
                                        new OA\Property(property: "stage_group_id", type: "integer"),
                                    ]
                                )
                            ),
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
        $query = StageGroup::with(['project', 'stages']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $stageGroups = $query->get();
        return response()->json($stageGroups);
    }

    #[OA\Post(
        path: "/stage-groups",
        summary: "Create a new stage group",
        description: "Create a stage group that can be used to classify stages internally (e.g., Completed, Pending, Active)",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Completed", description: "Name of the stage group"),
                    new OA\Property(property: "description", type: "string", nullable: true, example: "Stages for completed tasks"),
                    new OA\Property(property: "project_id", type: "integer", nullable: true, description: "Optional project ID to scope the group to a specific project")
                ]
            )
        ),
        tags: ["Stage Groups"],
        responses: [
            new OA\Response(response: 201, description: "Stage group created with empty stages array"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $stageGroup = StageGroup::create($validated);
        return response()->json($stageGroup->load(['project', 'stages']), 201);
    }

    #[OA\Get(
        path: "/stage-groups/{id}",
        summary: "Get stage group by ID",
        description: "Retrieve a specific stage group with all its associated stages that include stage_group_id",
        security: [["bearerAuth" => []]],
        tags: ["Stage Groups"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Stage group details with stages"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Stage group not found")
        ]
    )]
    public function show(StageGroup $stageGroup): JsonResponse
    {
        return response()->json($stageGroup->load(['project', 'stages']));
    }

    #[OA\Put(
        path: "/stage-groups/{id}",
        summary: "Update stage group",
        description: "Update a stage group's name, description, or project association",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "project_id", type: "integer", nullable: true)
                ]
            )
        ),
        tags: ["Stage Groups"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Stage group updated with stages"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Stage group not found")
        ]
    )]
    public function update(Request $request, StageGroup $stageGroup): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $stageGroup->update($validated);
        return response()->json($stageGroup->load(['project', 'stages']));
    }

    #[OA\Delete(
        path: "/stage-groups/{id}",
        summary: "Delete stage group",
        security: [["bearerAuth" => []]],
        tags: ["Stage Groups"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "Stage group deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Stage group not found")
        ]
    )]
    public function destroy(StageGroup $stageGroup): JsonResponse
    {
        $stageGroup->delete();
        return response()->json(null, 204);
    }
}
