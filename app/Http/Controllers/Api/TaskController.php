<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Events\TaskUpdated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class TaskController extends Controller
{
    #[OA\Get(
        path: "/tasks",
        summary: "List all tasks",
        security: [["bearerAuth" => []]],
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(
                name: "project_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "assignee_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "user_status",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "string", enum: ["pending", "in-progress", "complete"])
            ),
            new OA\Parameter(
                name: "priority",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "string", enum: ["low", "medium", "high"])
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of tasks",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(type: "object")
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Task::with(['project', 'assignee', 'projectStage', 'attachments', 'subtasks.assignee', 'subtasks.project', 'assignedUsers']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        if ($request->has('assignee_id')) {
            $query->where(function($q) use ($request) {
                $q->where('assignee_id', $request->assignee_id)
                  ->orWhereHas('assignedUsers', function($sq) use ($request) {
                      $sq->where('users.id', $request->assignee_id);
                  });
            });
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

    #[OA\Post(
        path: "/tasks",
        summary: "Create a new task",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title", "project_id"],
                properties: [
                    new OA\Property(property: "title", type: "string", example: "Design homepage"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "project_id", type: "integer", example: 1),
                    new OA\Property(property: "assignee_id", type: "integer", nullable: true),
                    new OA\Property(property: "assignee_ids", type: "array", items: new OA\Items(type: "integer")),
                    new OA\Property(property: "due_date", type: "string", format: "date", nullable: true),
                    new OA\Property(property: "user_status", type: "string", enum: ["pending", "in-progress", "complete"], example: "pending"),
                    new OA\Property(property: "project_stage_id", type: "integer", nullable: true),
                    new OA\Property(property: "priority", type: "string", enum: ["low", "medium", "high"], example: "medium"),
                    new OA\Property(property: "tags", type: "array", items: new OA\Items(type: "string")),
                    new OA\Property(property: "estimated_hours", type: "number", nullable: true),
                    new OA\Property(property: "parent_id", type: "integer", nullable: true)
                ]
            )
        ),
        tags: ["Tasks"],
        responses: [
            new OA\Response(response: 201, description: "Task created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
            'assignee_id' => 'nullable|exists:users,id',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
            'due_date' => 'nullable|date',
            'user_status' => 'sometimes|string|max:255',
            'project_stage_id' => 'nullable|exists:stages,id',
            'start_stage_id' => 'nullable|exists:stages,id',
            'priority' => 'sometimes|in:low,medium,high',
            'tags' => 'nullable|array',
            'start_date' => 'nullable|date',
            'is_in_specific_stage' => 'sometimes|boolean',
            'revision_comment' => 'nullable|string',
            'estimated_hours' => 'nullable|numeric|min:0',
            'parent_id' => 'nullable|exists:tasks,id',
            'is_assignee_locked' => 'sometimes|boolean',
        ]);

        // If assignee_id is not provided but assignee_ids is, use the first as primary
        if (!isset($validated['assignee_id']) && isset($validated['assignee_ids']) && count($validated['assignee_ids']) > 0) {
            $validated['assignee_id'] = $validated['assignee_ids'][0];
        } else if (!isset($validated['assignee_id'])) {
            $validated['assignee_id'] = $request->user()->id;
        }

        $task = Task::create($validated);

        // Sync multiple assignees
        if (isset($validated['assignee_ids'])) {
            $task->assignedUsers()->sync($validated['assignee_ids']);
        } else if ($task->assignee_id) {
            // If only single assignee provided, allow it as sole assignee
            $task->assignedUsers()->sync([$task->assignee_id]);
        }

        // Check if task should be automatically moved to start stage
        // This happens when:
        // 1. Task is in Pending stage
        // 2. Has a start_stage_id set
        // 3. Start time has already passed or is now
        if ($task->start_date && $task->start_stage_id) {
            $now = \Carbon\Carbon::now();
            $startTime = \Carbon\Carbon::parse($task->start_date);
            
            // Reload to get the projectStage relationship
            $task->load('projectStage');
            
            if ($task->projectStage && $task->projectStage->title === 'Pending' && $startTime->lte($now)) {
                // Move task to the start stage immediately
                $task->project_stage_id = $task->start_stage_id;
                $task->save();
            }
        }

        // Notify assignees
        $notifiedUserIds = [];
        // Primary assignee
        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            $task->assignee->notify(new \App\Notifications\TaskAssignedNotification($task));
            $notifiedUserIds[] = $task->assignee_id;
        }
        
        // Multi-assignees
        foreach ($task->assignedUsers as $user) {
            if ($user->id !== $request->user()->id && !in_array($user->id, $notifiedUserIds)) {
                $user->notify(new \App\Notifications\TaskAssignedNotification($task));
                $notifiedUserIds[] = $user->id;
            }
        }

        // Notify other assignees? (Skipping for brevity, can iterate assignedUsers)

        try {
            TaskUpdated::dispatch($task, 'create');
        } catch (\Exception $e) {
            // Log error but don't fail the request if broadcasting fails
            \Illuminate\Support\Facades\Log::error('Failed to broadcast TaskUpdated event: ' . $e->getMessage());
        }

        return response()->json($task->load(['project', 'assignee', 'projectStage', 'assignedUsers', 'attachments']), 201);
    }

    #[OA\Get(
        path: "/tasks/{id}",
        summary: "Get task by ID",
        security: [["bearerAuth" => []]],
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Task details"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Task not found")
        ]
    )]
    public function show(Task $task, \App\Services\TaskHistoryService $historyService): JsonResponse
    {
        $historyService->trackTaskViewed($task);
        return response()->json($task->load(['project', 'assignee', 'projectStage', 'attachments', 'revisionHistories', 'comments.user', 'assignedUsers', 'taskHistories.user']));
    }

    #[OA\Put(
        path: "/tasks/{id}",
        summary: "Update task",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "assignee_id", type: "integer", nullable: true),
                    new OA\Property(property: "assignee_ids", type: "array", items: new OA\Items(type: "integer")),
                    new OA\Property(property: "due_date", type: "string", format: "date", nullable: true),
                    new OA\Property(property: "user_status", type: "string", enum: ["pending", "in-progress", "complete"]),
                    new OA\Property(property: "project_stage_id", type: "integer", nullable: true),
                    new OA\Property(property: "priority", type: "string", enum: ["low", "medium", "high"])
                ]
            )
        ),
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Task updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Task not found")
        ]
    )]
    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'sometimes|exists:projects,id',
            'assignee_id' => 'nullable|exists:users,id',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
            'due_date' => 'nullable|date',
            'user_status' => 'sometimes|string|max:255',
            'project_stage_id' => 'nullable|exists:stages,id',
            'start_stage_id' => 'nullable|exists:stages,id',
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
            'is_assignee_locked' => 'sometimes|boolean',
        ]);

        $task->fill($validated);
        
        $statusChanged = $task->isDirty('user_status');
        $assigneeChanged = $task->isDirty('assignee_id');
        $newStatus = $task->user_status;

        $syncChanges = [];
        // Handle multi-assignee sync
        if (isset($validated['assignee_ids'])) {
            $syncChanges = $task->assignedUsers()->sync($validated['assignee_ids']);
            // Update primary assignee_id if not explicitly set but array changed? 
            // Better to keep existing logic: if assignee_id passed, use it, else keep it.
        }

        if ($statusChanged && $newStatus === 'complete' && $task->assignedUsers()->count() > 1) {
             // Find the pivot entry for this user
             $userId = $request->user()->id;
             $pivot = $task->assignedUsers()->where('users.id', $userId)->first();
             if ($pivot) {
                 // Update pivot status
                 $task->assignedUsers()->updateExistingPivot($userId, ['status' => 'complete']);
             }
             
             // Check if ALL are complete
             $allComplete = !$task->assignedUsers()->wherePivot('status', '!=', 'complete')->exists();
             
             if (!$allComplete) {
                 // If not all complete, REVERT the main task status change (keep it as it was)
                 unset($task->user_status); 
             } else {
                 // All complete - attempt stage advancement
                 $this->performStageAdvancement($task);
             }
        } elseif ($statusChanged && $newStatus === 'complete') {
             // Single user completion - attempt stage advancement
             $this->performStageAdvancement($task);
        }

        $task->save();

        // Notify new assignee
        // Notify new assignee
        $notifiedUserIds = [];

        if ($assigneeChanged && $task->assignee_id && $task->assignee_id !== $request->user()->id) {
             $task->assignee->notify(new \App\Notifications\TaskAssignedNotification($task));
             $notifiedUserIds[] = $task->assignee_id;
        }

        // Notify newly attached multi-assignees
        if (isset($syncChanges['attached'])) {
            $newlyAssignedIds = $syncChanges['attached'];
            if (!empty($newlyAssignedIds)) {
                $newlyAssignedUsers = \App\Models\User::whereIn('id', $newlyAssignedIds)->get();
                foreach ($newlyAssignedUsers as $user) {
                    if ($user->id !== $request->user()->id && !in_array($user->id, $notifiedUserIds)) {
                        $user->notify(new \App\Notifications\TaskAssignedNotification($task));
                        $notifiedUserIds[] = $user->id;
                    }
                }
            }
        }

        // Notify if status updated (only if main task updated)
        if ($task->wasChanged('user_status')) {
             $notifiedStatusUserIds = [];
             if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
                 $task->assignee->notify(new \App\Notifications\TaskStatusUpdatedNotification($task, $task->user_status));
                 $notifiedStatusUserIds[] = $task->assignee_id;
             }
             
             foreach ($task->assignedUsers as $user) {
                 if ($user->id !== $request->user()->id && !in_array($user->id, $notifiedStatusUserIds)) {
                     $user->notify(new \App\Notifications\TaskStatusUpdatedNotification($task, $task->user_status));
                     $notifiedStatusUserIds[] = $user->id;
                 }
             }
        }

        // -----------------------------------------------------
        // NEW NOTIFICATIONS LOGIC
        // -----------------------------------------------------

        // 1. Task Completed / Advanced by User -> Notify Admin & Team Lead
        if ($statusChanged && $newStatus === 'complete') {
            // Find Team Leads for this project's department
            $departmentId = $task->project->department_id ?? null;
            if ($departmentId) {
                $teamLeads = \App\Models\User::where('role', 'team-lead')
                                             ->where('department_id', $departmentId)
                                             ->get();
                // Send to Team Leads
                if ($teamLeads->count() > 0) {
                     \Illuminate\Support\Facades\Notification::send($teamLeads, new \App\Notifications\TaskCompletedNotification($task, $request->user()));
                }
            }
            // Send to Admins (if not already covered by StatusUpdated, but detailed TaskCompleted is better)
             $admins = \App\Models\User::where('role', 'admin')->get();
             \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\TaskCompletedNotification($task, $request->user()));
        }

        // 2. Stage Changed (Approval / Rejection / Move) -> Notify Previous Assignee / Doer
        if ($task->wasChanged('project_stage_id')) {
            $newStage = $task->projectStage;
            $stageName = $newStage ? $newStage->title : 'Unknown Stage';

            // Scenario: Task was in Review (assigned to Admin/Lead) -> Moved to Completed (or Next).
            // The person who wants to know is the one who did the work (original_assignee_id).
            if ($task->original_assignee_id) {
                $originalAssignee = \App\Models\User::find($task->original_assignee_id);
                if ($originalAssignee) {
                    $originalAssignee->notify(new \App\Notifications\TaskApprovedNotification($task, $stageName));
                }
            } else {
                 // Fallback: If no original_assignee, maybe notify the *previous* assignee if different from current?
            }
        }

        try {
            TaskUpdated::dispatch($task, 'update');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to broadcast TaskUpdated event: ' . $e->getMessage());
        }

        return response()->json($task->load(['project', 'assignee', 'projectStage', 'assignedUsers']));
    }

    /**
     * Helper to advance task stage on completion
     */
    private function performStageAdvancement(Task $task)
    {
        $currentStage = $task->projectStage;
        if (!$currentStage) return;

        $nextStage = null;
        if ($currentStage->linked_review_stage_id) {
            $nextStage = \App\Models\Stage::find($currentStage->linked_review_stage_id);
        } else {
             $nextStage = \App\Models\Stage::where('project_id', $task->project_id)
                 ->where('order', '>', $currentStage->order)
                 ->orderBy('order', 'asc')
                 ->first();
        }

        if ($nextStage) {
            $task->project_stage_id = $nextStage->id;
            $task->user_status = 'pending';
            
            if ($nextStage->is_review_stage) {
                $task->previous_stage_id = $currentStage->id;
                $task->original_assignee_id = $task->assignee_id; // Capture current assignee
                $task->is_in_specific_stage = true;
            } else {
                 $task->is_in_specific_stage = false;
            }
            
            // Reassign if Main Responsible is set
            // Reassign if Main Responsible is set AND task assignment is NOT locked
            if ($nextStage->main_responsible_id && !$task->is_assignee_locked) {
                $task->assignee_id = $nextStage->main_responsible_id;
                // Sync new assignee immediately to pivot table
                $task->assignedUsers()->sync([$nextStage->main_responsible_id]);
                
                // Helper will save task later, but we need to notify inside update cycle or let update cycle handle it
                // update cycle checks dirty assignee_id.
            } else {
                // Determine if we should clear assignees or keep them
                // If moving to next stage and no responsible defined, we keep current assignee but reset their status?
                // Or clear?
                // Let's reset status to pending for all current assignees
                $task->assignedUsers()->newPivotStatement()->where('task_id', $task->id)->update(['status' => 'pending']);
            }
        } else {
            // No next stage -> Confirmation of Completion
            $task->user_status = 'complete';
            $task->completed_at = now();
        }
    }

    #[OA\Delete(
        path: "/tasks/{id}",
        summary: "Delete task",
        security: [["bearerAuth" => []]],
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "Task deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Task not found")
        ]
    )]
    public function destroy(Task $task): JsonResponse
    {
        $projectId = $task->project_id; // Capture for event
        // We need to keep a reference or just use the task object before deletion is finalized in memory? 
        // Laravel events serialize models. If deleted, it might be tricky. 
        // Identify the project first.
        
        $task->delete();
        
        // Dispatch 'delete' event. We pass the task, hoping serialization works (it usually does for deleted models in recent Laravel)
        // Or we pass a simple object if needed. But Event typed as Task.
        try {
            TaskUpdated::dispatch($task, 'delete');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to broadcast TaskUpdated event: ' . $e->getMessage());
        }
        
        return response()->json(null, 204);
    }

    #[OA\Post(
        path: "/tasks/{id}/start",
        summary: "Start a task (move to designated stage)",
        security: [["bearerAuth" => []]],
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Task started"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Task not found")
        ]
    )]
    public function start(Request $request, Task $task): JsonResponse
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($task) {
            $targetStageId = $task->start_stage_id;
            
            if (!$targetStageId) {
                 // If no specific start stage, find the next stage in order
                 $currentStage = $task->projectStage;
                 if ($currentStage) {
                     $nextStage = \App\Models\Stage::where('project_id', $task->project_id)
                         ->where('order', '>', $currentStage->order)
                         ->orderBy('order', 'asc')
                         ->first();
                     if ($nextStage) {
                         $targetStageId = $nextStage->id;
                     }
                 }
            }
    
            if ($targetStageId) {
                $task->project_stage_id = $targetStageId;
                $task->user_status = 'pending';
                
                // Update assignees based on stage defaults
                $targetStage = \App\Models\Stage::find($targetStageId);
                if ($targetStage && $targetStage->main_responsible_id && !$task->is_assignee_locked) {
                     $task->assignee_id = $targetStage->main_responsible_id;
                     $task->assignedUsers()->sync([$targetStage->main_responsible_id]);
                } else {
                     // Reset status for existing assignees
                     $task->assignedUsers()->newPivotStatement()->where('task_id', $task->id)->update(['status' => 'pending']);
                }
                
                $task->save();
                try {
                    TaskUpdated::dispatch($task, 'update');
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to broadcast TaskUpdated event: ' . $e->getMessage());
                }
            }
        });
        
        return response()->json($task->load(['project', 'assignee', 'projectStage', 'assignedUsers', 'attachments']));
    }

    #[OA\Post(
        path: "/tasks/{id}/complete",
        summary: "Complete a task with optional comments.user and attachments",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "user_status", type: "string", enum: ["complete"], example: "complete"),
                    new OA\Property(property: "comment", type: "string", nullable: true),
                    new OA\Property(property: "links", type: "array", items: new OA\Items(type: "string", format: "url")),
                    new OA\Property(property: "files", type: "array", items: new OA\Items(type: "string", format: "binary"))
                ]
            )
        ),
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Task completed"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Task not found")
        ]
    )]
    public function complete(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'user_status' => 'sometimes|in:complete',
            'project_stage_id' => 'sometimes|exists:stages,id',
            'comment' => 'nullable|string',
            'links' => 'nullable|array',
            'links.*' => 'string', // Relaxed validation
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $task, $request) {
            $userId = $request->user()->id;
            
            // Logic for multi-assignee completion
            $shouldCompleteMainTask = true;
            $hasPivot = $task->assignedUsers()->where('users.id', $userId)->exists();
            $multiAssignee = $task->assignedUsers()->count() > 1;
            
            if ($hasPivot && isset($validated['user_status']) && $validated['user_status'] === 'complete') {
                $task->assignedUsers()->updateExistingPivot($userId, ['status' => 'complete']);
                
                // Check if all others are complete
                if ($multiAssignee) {
                    $pendingOthers = $task->assignedUsers()->wherePivot('status', '!=', 'complete')->exists();
                    if ($pendingOthers) {
                        $shouldCompleteMainTask = false;
                    }
                }
            }

            // Update Task Status if allowed
            $updates = [];
            if ($shouldCompleteMainTask) {
                // Apply stage advancement logic
                $this->performStageAdvancement($task);
                $task->save();
                
                // Also apply other updates if provided (like stage override from request? usually null if just completing)
                 if (isset($validated['project_stage_id'])) {
                    $task->update(['project_stage_id' => $validated['project_stage_id']]);
                }
                
                try {
                    TaskUpdated::dispatch($task, 'update');
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to broadcast TaskUpdated event: ' . $e->getMessage());
                }

                // NOTIFY ADMIN & TEAM LEAD
                $departmentId = $task->project->department_id ?? null;
                if ($departmentId) {
                    $teamLeads = \App\Models\User::where('role', 'team-lead')
                                                 ->where('department_id', $departmentId)
                                                 ->get();
                    if ($teamLeads->count() > 0) {
                        \Illuminate\Support\Facades\Notification::send($teamLeads, new \App\Notifications\TaskCompletedNotification($task, $request->user(), $task->projectStage ? $task->projectStage->title : 'Completed'));
                    }
                }
                $admins = \App\Models\User::where('role', 'admin')->get();
                \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\TaskCompletedNotification($task, $request->user(), $task->projectStage ? $task->projectStage->title : 'Completed'));
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
                    $path = $file->store('task-attachments', 's3');
                    $url = \Illuminate\Support\Facades\Storage::disk('s3')->url($path);
                    
                    $task->attachments()->create([
                        'name' => $file->getClientOriginalName(),
                        'url' => $url,
                        'type' => 'file',
                    ]);
                }
            }
        });

        return response()->json($task->load(['project', 'assignee', 'projectStage', 'attachments', 'comments.user', 'assignedUsers']));
    }
}
