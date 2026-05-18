<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use App\Services\ResumableUploadService;
use OpenApi\Attributes as OA;

class ProjectAttachmentController extends Controller
{
    #[OA\Post(
        path: "/projects/{project}/attachments",
        summary: "Add project attachment",
        description: "Attach a file (via direct upload or TUS upload_key) or a URL link to a project",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        parameters: [new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["type"],
                    properties: [
                        new OA\Property(property: "type", type: "string", enum: ["file", "link"]),
                        new OA\Property(property: "name", type: "string"),
                        new OA\Property(property: "file", type: "string", format: "binary"),
                        new OA\Property(property: "upload_key", type: "string", description: "TUS upload key"),
                        new OA\Property(property: "url", type: "string", format: "uri", description: "Required when type=link"),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Attachment created"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(Request $request, Project $project, ResumableUploadService $resumableUploadService): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'required|in:file,link',
            'file' => 'nullable|file|max:20480', // 20MB max
            'upload_key' => 'nullable|string|max:255',
            'url' => 'required_if:type,link|string|url',
        ]);

        $attachmentData = [
            'project_id' => $project->id,
            'name' => $validated['name'] ?? null,
            'type' => $validated['type'],
            'uploaded_at' => now(),
        ];

        if ($validated['type'] === 'file') {
            if (!empty($validated['upload_key'])) {
                $finalized = $resumableUploadService->finalizeToDisk(
                    $validated['upload_key'],
                    'project-attachments',
                    $validated['name'] ?? null,
                );

                $attachmentData['url'] = $finalized['url'];
                $attachmentData['file_path'] = $finalized['path'] ?? null;
                $attachmentData['name'] = $attachmentData['name'] ?? $finalized['name'];
            } elseif ($request->hasFile('file')) {
                $file = $request->file('file');
                $path = $file->store('project-attachments', 's3');
                $attachmentData['url'] = Storage::disk('s3')->url($path);
                $attachmentData['file_path'] = $path;
                if (empty($attachmentData['name'])) {
                    $attachmentData['name'] = $file->getClientOriginalName();
                }
            }
        } else {
            $attachmentData['url'] = $validated['url'];
            if (empty($attachmentData['name'])) {
                return response()->json([
                    'message' => 'The name field is required for link attachments.',
                    'errors' => ['name' => ['The name field is required.']]
                ], 422);
            }
        }

        $attachment = ProjectAttachment::create($attachmentData);
        
        // Invalidate project cache
        Cache::forget('projects_version');

        return response()->json($attachment, 201);
    }

    #[OA\Delete(
        path: "/project-attachments/{attachment}",
        summary: "Delete project attachment",
        description: "Removes a project attachment and deletes the file from S3 if applicable",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        parameters: [new OA\Parameter(name: "attachment", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 204, description: "Deleted")]
    )]
    public function destroy(ProjectAttachment $attachment): JsonResponse
    {
        if ($attachment->type === 'file' && $attachment->file_path) {
            Storage::disk('s3')->delete($attachment->file_path);
        }

        $attachment->delete();
        
        // Invalidate project cache
        Cache::forget('projects_version');

        return response()->json(null, 204);
    }
}
