<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TagController extends Controller
{
    #[OA\Get(
        path: "/tags",
        summary: "List all tags",
        security: [["bearerAuth" => []]],
        tags: ["Tags"],
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
                description: "List of tags",
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
        $query = \App\Models\Tag::query();

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->get());
    }

    #[OA\Post(
        path: "/tags",
        summary: "Create a new tag",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name", "department_id"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Urgent"),
                    new OA\Property(property: "department_id", type: "integer", example: 1)
                ]
            )
        ),
        tags: ["Tags"],
        responses: [
            new OA\Response(response: 201, description: "Tag created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 403, description: "Forbidden"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = auth()->user();

        // Authorization check
        if ($user->role !== 'admin' && $user->role !== 'team-lead') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'team-lead' && $user->department_id != $request->department_id) {
            return response()->json(['message' => 'You can only create tags for your own department'], 403);
        }
        
        // Check if tag exists for this department
        $existingTag = \App\Models\Tag::where('name', $request->name)
                                    ->where('department_id', $request->department_id)
                                    ->first();
                                    
        if ($existingTag) {
            return response()->json($existingTag);
        }

        $tag = \App\Models\Tag::create([
            'name' => $request->name,
            'department_id' => $request->department_id,
        ]);

        return response()->json($tag, 201);
    }
}
