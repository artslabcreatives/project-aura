<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class DepartmentController extends Controller
{
    #[OA\Get(
        path: "/departments",
        summary: "List all departments",
        security: [["bearerAuth" => []]],
        tags: ["Departments"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of departments",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "id", type: "integer"),
                            new OA\Property(property: "name", type: "string"),
                            new OA\Property(property: "users", type: "array", items: new OA\Items(type: "object")),
                            new OA\Property(property: "projects", type: "array", items: new OA\Items(type: "object"))
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(): JsonResponse
    {
        $departments = Department::with(['users', 'projects'])->get();
        return response()->json($departments);
    }

    #[OA\Post(
        path: "/departments",
        summary: "Create a new department",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Marketing")
                ]
            )
        ),
        tags: ["Departments"],
        responses: [
            new OA\Response(
                response: 201,
                description: "Department created",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "name", type: "string")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    #[OA\Get(
        path: "/departments/{id}",
        summary: "Get department by ID",
        security: [["bearerAuth" => []]],
        tags: ["Departments"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "Department ID",
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Department details",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "name", type: "string"),
                        new OA\Property(property: "users", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "projects", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Department not found")
        ]
    )]
    public function show(Department $department): JsonResponse
    {
        return response()->json($department->load(['users', 'projects']));
    }

    #[OA\Put(
        path: "/departments/{id}",
        summary: "Update department",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Marketing")
                ]
            )
        ),
        tags: ["Departments"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Department updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Department not found"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function update(Request $request, Department $department): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
        ]);

        $department->update($validated);
        return response()->json($department);
    }

    #[OA\Delete(
        path: "/departments/{id}",
        summary: "Delete department",
        security: [["bearerAuth" => []]],
        tags: ["Departments"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "Department deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Department not found")
        ]
    )]
    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        return response()->json(null, 204);
    }
}
