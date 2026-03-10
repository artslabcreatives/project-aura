<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectGroup;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProjectGroupController extends Controller
{
    #[OA\Get(
        path: "/project-groups",
        summary: "List all project groups",
        security: [["bearerAuth" => []]],
        tags: ["Project Groups"],
        parameters: [
            new OA\Parameter(
                name: "department_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of project groups",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(type: "object")
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request)
    {
        $query = ProjectGroup::query();

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->orderBy('name')->get());
    }

    #[OA\Post(
        path: "/project-groups",
        summary: "Create a new project group",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name", "department_id"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Client Projects"),
                    new OA\Property(property: "department_id", type: "integer", example: 1),
                    new OA\Property(property: "parent_id", type: "integer", nullable: true)
                ]
            )
        ),
        tags: ["Project Groups"],
        responses: [
            new OA\Response(response: 201, description: "Project group created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'parent_id' => 'nullable|exists:project_groups,id',
        ]);

        $projectGroup = ProjectGroup::create($validated);

        return response()->json($projectGroup, 201);
    }

    public function update(Request $request, ProjectGroup $projectGroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'sometimes|exists:departments,id',
            'parent_id' => 'nullable|exists:project_groups,id',
        ]);

        $projectGroup->update($validated);

        return response()->json($projectGroup);
    }

    public function destroy(ProjectGroup $projectGroup)
    {
        // Check if there are projects assigned to this group
        if ($projectGroup->projects()->exists()) {
            return response()->json([
                'message' => 'Cannot delete group. There are projects assigned to this group. Please unassign them first.'
            ], 422);
        }
        
        // Also check if there are sub-groups
        if ($projectGroup->children()->exists()) {
            return response()->json([
                'message' => 'Cannot delete group. It has sub-groups. Please delete or move them first.'
            ], 422);
        }

        $projectGroup->delete();

        return response()->noContent();
    }
}
