<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskAttachmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TaskAttachment::with('task');
        
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }
        
        $attachments = $query->get();
        return response()->json($attachments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'name' => 'required|string|max:255',
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
            if (!isset($validated['name'])) {
                $validated['name'] = $file->getClientOriginalName();
            }
        }

        // Remove the uploaded file from validated data as it's not a fillable field
        unset($validated['file']);

        $attachment = TaskAttachment::create($validated);
        return response()->json($attachment, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskAttachment $taskAttachment): JsonResponse
    {
        return response()->json($taskAttachment->load('task'));
    }

    /**
     * Update the specified resource in storage.
     */
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskAttachment $taskAttachment): JsonResponse
    {
        $taskAttachment->delete();
        return response()->json(null, 204);
    }
}
