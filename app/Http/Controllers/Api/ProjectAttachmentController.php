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

class ProjectAttachmentController extends Controller
{
    /**
     * Store a new attachment (file or link) for a project.
     */
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

    /**
     * Remove the specified attachment.
     */
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
