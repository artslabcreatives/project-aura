<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class TaskAttachmentController extends Controller
{
    #[OA\Get(
        path: "/task-attachments",
        summary: "List task attachments",
        security: [["bearerAuth" => []]],
        tags: ["Task Attachments"],
        parameters: [
            new OA\Parameter(
                name: "task_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "List of attachments"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = TaskAttachment::with('task');
        
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }
        
        $attachments = $query->get();
        return response()->json($attachments);
    }

    #[OA\Post(
        path: "/task-attachments",
        summary: "Create a new task attachment",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["task_id"],
                    properties: [
                        new OA\Property(property: "task_id", type: "integer"),
                        new OA\Property(property: "name", type: "string", nullable: true),
                        new OA\Property(property: "file", type: "string", format: "binary", nullable: true),
                        new OA\Property(property: "url", type: "string", nullable: true),
                        new OA\Property(property: "type", type: "string", enum: ["file", "link"])
                    ]
                )
            )
        ),
        tags: ["Task Attachments"],
        responses: [
            new OA\Response(response: 201, description: "Attachment created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'name' => 'nullable|string|max:255',
            'file' => 'nullable|file|max:10240', // Max 10MB
            'url' => 'nullable|string|max:2048',
            'type' => 'sometimes|in:file,link',
        ]);

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('task-attachments', 'public');
            $validated['url'] = '/storage/' . $path;
            $validated['type'] = 'file';
            if (empty($validated['name'])) {
                $validated['name'] = $file->getClientOriginalName();
            }
        } else {
            // For non-file attachments (links), name is required
            if (empty($validated['name'])) {
                return response()->json([
                    'message' => 'The name field is required for link attachments.',
                    'errors' => ['name' => ['The name field is required.']]
                ], 422);
            }
        }

        // Remove the uploaded file from validated data as it's not a fillable field
        unset($validated['file']);

        $attachment = TaskAttachment::create($validated);
        return response()->json($attachment, 201);
    }

    #[OA\Get(
        path: "/task-attachments/{id}",
        summary: "Get attachment by ID",
        security: [["bearerAuth" => []]],
        tags: ["Task Attachments"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Attachment details"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Attachment not found")
        ]
    )]
    public function show(TaskAttachment $taskAttachment): JsonResponse
    {
        return response()->json($taskAttachment->load('task'));
    }

    #[OA\Put(
        path: "/task-attachments/{id}",
        summary: "Update attachment",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string"),
                    new OA\Property(property: "url", type: "string"),
                    new OA\Property(property: "type", type: "string", enum: ["file", "link"])
                ]
            )
        ),
        tags: ["Task Attachments"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Attachment updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Attachment not found")
        ]
    )]
    public function update(Request $request, TaskAttachment $taskAttachment): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'url' => 'sometimes|required|string|max:2048',
            'type' => 'sometimes|in:file,link',
        ]);

        $taskAttachment->update($validated);
        return response()->json($taskAttachment);
    }

    #[OA\Delete(
        path: "/task-attachments/{id}",
        summary: "Delete attachment",
        security: [["bearerAuth" => []]],
        tags: ["Task Attachments"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "Attachment deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Attachment not found")
        ]
    )]
    public function destroy(TaskAttachment $taskAttachment): JsonResponse
    {
        $taskAttachment->delete();
        return response()->json(null, 204);
    }
}
