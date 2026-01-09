<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['project', 'assignee', 'projectStage', 'attachments', 'subtasks.assignee', 'subtasks.project']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        if ($request->has('assignee_id')) {
            $query->where('assignee_id', $request->assignee_id);
        }
        
        if ($request->has('user_status')) {
            $query->where('user_status', $request->user_status);
        }
        
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }
        
        $tasks = $query->get();
        return response()->json($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
            'assignee_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'user_status' => 'sometimes|in:pending,in-progress,complete',
            'project_stage_id' => 'nullable|exists:stages,id',
            'priority' => 'sometimes|in:low,medium,high',
            'tags' => 'nullable|array',
            'start_date' => 'nullable|date',
            'is_in_specific_stage' => 'sometimes|boolean',
            'revision_comment' => 'nullable|string',
            'estimated_hours' => 'nullable|numeric|min:0',
            'parent_id' => 'nullable|exists:tasks,id',
        ]);

        // If assignee_id is not provided, assign to the authenticated user
        if (!isset($validated['assignee_id'])) {
            $validated['assignee_id'] = $request->user()->id;
        }

        $task = Task::create($validated);

        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            $task->assignee->notify(new \App\Notifications\TaskAssignedNotification($task));
        }

        return response()->json($task->load(['project', 'assignee', 'projectStage']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load(['project', 'assignee', 'projectStage', 'attachments', 'revisionHistories', 'comments']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'sometimes|exists:projects,id',
            'assignee_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'user_status' => 'sometimes|in:pending,in-progress,complete',
            'project_stage_id' => 'nullable|exists:stages,id',
            'priority' => 'sometimes|in:low,medium,high',
            'tags' => 'nullable|array',
            'start_date' => 'nullable|date',
            'is_in_specific_stage' => 'sometimes|boolean',
            'revision_comment' => 'nullable|string',
            'previous_stage_id' => 'nullable|exists:stages,id',
            'original_assignee_id' => 'nullable|exists:users,id',
            'completed_at' => 'nullable|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'parent_id' => 'nullable|exists:tasks,id',
        ]);

        $task->fill($validated);
        
        $statusChanged = $task->isDirty('user_status');
        $assigneeChanged = $task->isDirty('assignee_id');
        $newStatus = $task->user_status;

        $task->save();

        // Notify new assignee
        if ($assigneeChanged && $task->assignee_id && $task->assignee_id !== $request->user()->id) {
             $task->assignee->notify(new \App\Notifications\TaskAssignedNotification($task));
        }

        // Notify if status updated
        if ($statusChanged) {
             // Notify the assignee (if they didn't do it) and maybe admins
             if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
                 $task->assignee->notify(new \App\Notifications\TaskStatusUpdatedNotification($task, $newStatus));
             }
             
             // Also notify admins of status change
             $admins = \App\Models\User::where('role', 'admin')->get();
             \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\TaskStatusUpdatedNotification($task, $newStatus));
        }

        return response()->json($task->load(['project', 'assignee', 'projectStage']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();
        return response()->json(null, 204);
    }
    /**
     * Complete the task with optional comments and resources.
     */
    public function complete(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'user_status' => 'sometimes|in:complete',
            'project_stage_id' => 'sometimes|exists:stages,id',
            'comment' => 'nullable|string',
            'links' => 'nullable|array',
            'links.*' => 'string|url',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $task, $request) {
            // Update Task Status
            $updates = [];
            if (isset($validated['user_status'])) {
                $updates['user_status'] = $validated['user_status'];
                if ($validated['user_status'] === 'complete') {
                    $updates['completed_at'] = now();
                }
            }
            if (isset($validated['project_stage_id'])) {
                $updates['project_stage_id'] = $validated['project_stage_id'];
            }
            
            if (!empty($updates)) {
                $task->update($updates);
                
                // Trigger notifications logic if needed (simplified here)
                if (isset($updates['user_status']) && $updates['user_status'] === 'complete') {
                     // Notify relevant parties
                }
            }

            // Add Comment
            if (!empty($validated['comment'])) {
                $task->comments()->create([
                    'user_id' => $request->user()->id,
                    'comment' => $validated['comment'],
                ]);
            }

            // Add Links
            if (!empty($validated['links'])) {
                foreach ($validated['links'] as $link) {
                    $task->attachments()->create([
                        'name' => $link,
                        'url' => $link,
                        'type' => 'link',
                    ]);
                }
            }

            // Add Files
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    // Store file
                    $path = $file->store('task-attachments', 'public');
                    $url = \Illuminate\Support\Facades\Storage::url($path);
                    
                    $task->attachments()->create([
                        'name' => $file->getClientOriginalName(),
                        'url' => $url,
                        'type' => 'file',
                    ]);
                }
            }
        });

        return response()->json($task->load(['project', 'assignee', 'projectStage', 'attachments', 'comments']));
    }
}
