<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistoryEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class HistoryEntryController extends Controller
{
    #[OA\Get(
        path: "/history-entries",
        summary: "List history entries",
        security: [["bearerAuth" => []]],
        tags: ["History Entries"],
        parameters: [
            new OA\Parameter(
                name: "project_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "entity_type",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "string", enum: ["task", "stage", "project"])
            ),
            new OA\Parameter(
                name: "entity_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "List of history entries"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = HistoryEntry::with(['user', 'project']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }
        
        if ($request->has('entity_id')) {
            $query->where('entity_id', $request->entity_id);
        }
        
        $entries = $query->orderByDesc('timestamp')->get();
        return response()->json($entries);
    }

    #[OA\Post(
        path: "/history-entries",
        summary: "Create a new history entry",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["action", "entity_id", "entity_type", "project_id"],
                properties: [
                    new OA\Property(property: "action", type: "string", example: "Task completed"),
                    new OA\Property(property: "entity_id", type: "integer"),
                    new OA\Property(property: "entity_type", type: "string", enum: ["task", "stage", "project"]),
                    new OA\Property(property: "project_id", type: "integer"),
                    new OA\Property(property: "details", type: "object", nullable: true)
                ]
            )
        ),
        tags: ["History Entries"],
        responses: [
            new OA\Response(response: 201, description: "History entry created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|string|max:255',
            'entity_id' => 'required|integer',
            'entity_type' => 'required|in:task,stage,project',
            'project_id' => 'required|exists:projects,id',
            'details' => 'nullable|array',
        ]);

        // Automatically use the authenticated user's ID
        $validated['user_id'] = $request->user()->id;

        $entry = HistoryEntry::create($validated);
        return response()->json($entry->load(['user', 'project']), 201);
    }

    #[OA\Get(
        path: "/history-entries/{id}",
        summary: "Get history entry by ID",
        security: [["bearerAuth" => []]],
        tags: ["History Entries"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "History entry details"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "History entry not found")
        ]
    )]
    public function show(HistoryEntry $historyEntry): JsonResponse
    {
        return response()->json($historyEntry->load(['user', 'project']));
    }

    #[OA\Put(
        path: "/history-entries/{id}",
        summary: "Update history entry",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "action", type: "string"),
                    new OA\Property(property: "details", type: "object", nullable: true)
                ]
            )
        ),
        tags: ["History Entries"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "History entry updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "History entry not found")
        ]
    )]
    public function update(Request $request, HistoryEntry $historyEntry): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'sometimes|required|string|max:255',
            'details' => 'nullable|array',
        ]);

        $historyEntry->update($validated);
        return response()->json($historyEntry);
    }

    #[OA\Delete(
        path: "/history-entries/{id}",
        summary: "Delete history entry",
        security: [["bearerAuth" => []]],
        tags: ["History Entries"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "History entry deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "History entry not found")
        ]
    )]
    public function destroy(HistoryEntry $historyEntry): JsonResponse
    {
        $historyEntry->delete();
        return response()->json(null, 204);
    }
}
