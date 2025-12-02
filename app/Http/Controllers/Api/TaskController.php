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
        $query = Task::with(['project', 'assignee', 'projectStage', 'attachments']);
        
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
        ]);

        // If assignee_id is not provided, assign to the authenticated user
        if (!isset($validated['assignee_id'])) {
            $validated['assignee_id'] = $request->user()->id;
        }

        $task = Task::create($validated);
        return response()->json($task->load(['project', 'assignee', 'projectStage']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load(['project', 'assignee', 'projectStage', 'attachments', 'revisionHistories']));
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
        ]);

        $task->update($validated);
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
}
