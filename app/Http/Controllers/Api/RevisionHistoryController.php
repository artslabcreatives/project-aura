<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RevisionHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class RevisionHistoryController extends Controller
{
    #[OA\Get(
        path: "/revision-histories",
        summary: "List revision histories",
        security: [["bearerAuth" => []]],
        tags: ["Revision History"],
        parameters: [
            new OA\Parameter(
                name: "task_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "List of revisions"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = RevisionHistory::with(['task', 'requestedBy']);
        
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }
        
        $revisions = $query->orderByDesc('requested_at')->get();
        return response()->json($revisions);
    }

    #[OA\Post(
        path: "/revision-histories",
        summary: "Create a new revision request",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["task_id", "comment", "requested_by_id"],
                properties: [
                    new OA\Property(property: "task_id", type: "integer"),
                    new OA\Property(property: "comment", type: "string", example: "Please revise the design"),
                    new OA\Property(property: "requested_by_id", type: "integer")
                ]
            )
        ),
        tags: ["Revision History"],
        responses: [
            new OA\Response(response: 201, description: "Revision created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'comment' => 'required|string',
            'requested_by_id' => 'required|exists:users,id',
        ]);

        $revision = RevisionHistory::create($validated);
        return response()->json($revision->load(['task', 'requestedBy']), 201);
    }

    #[OA\Get(
        path: "/revision-histories/{id}",
        summary: "Get revision by ID",
        security: [["bearerAuth" => []]],
        tags: ["Revision History"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Revision details"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Revision not found")
        ]
    )]
    public function show(RevisionHistory $revisionHistory): JsonResponse
    {
        return response()->json($revisionHistory->load(['task', 'requestedBy']));
    }

    #[OA\Put(
        path: "/revision-histories/{id}",
        summary: "Update revision",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "comment", type: "string"),
                    new OA\Property(property: "resolved_at", type: "string", format: "date", nullable: true)
                ]
            )
        ),
        tags: ["Revision History"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Revision updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Revision not found")
        ]
    )]
    public function update(Request $request, RevisionHistory $revisionHistory): JsonResponse
    {
        $validated = $request->validate([
            'comment' => 'sometimes|required|string',
            'resolved_at' => 'nullable|date',
        ]);

        $revisionHistory->update($validated);
        return response()->json($revisionHistory);
    }

    #[OA\Delete(
        path: "/revision-histories/{id}",
        summary: "Delete revision",
        security: [["bearerAuth" => []]],
        tags: ["Revision History"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "Revision deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Revision not found")
        ]
    )]
    public function destroy(RevisionHistory $revisionHistory): JsonResponse
    {
        $revisionHistory->delete();
        return response()->json(null, 204);
    }
}
