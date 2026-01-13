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
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
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

        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            $task->assignee->notify(new \App\Notifications\TaskAssignedNotification($task));
        }
        // Notify other assignees? (Skipping for brevity, can iterate assignedUsers)

        return response()->json($task->load(['project', 'assignee', 'projectStage', 'assignedUsers']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load(['project', 'assignee', 'projectStage', 'attachments', 'revisionHistories', 'comments', 'assignedUsers']));
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
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
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

        // Handle multi-assignee sync
        if (isset($validated['assignee_ids'])) {
            $task->assignedUsers()->sync($validated['assignee_ids']);
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
        if ($assigneeChanged && $task->assignee_id && $task->assignee_id !== $request->user()->id) {
             $task->assignee->notify(new \App\Notifications\TaskAssignedNotification($task));
        }

        // Notify if status updated (only if main task updated)
        if ($task->wasChanged('user_status')) {
             if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
                 $task->assignee->notify(new \App\Notifications\TaskStatusUpdatedNotification($task, $task->user_status));
             }
             $admins = \App\Models\User::where('role', 'admin')->get();
             \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\TaskStatusUpdatedNotification($task, $task->user_status));
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
            if ($nextStage->main_responsible_id) {
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
                 $task->assignedUsers()->update(['status' => 'pending']);
            }
        } else {
            // No next stage -> Confirmation of Completion
            $task->user_status = 'complete';
            $task->completed_at = now();
        }
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

        return response()->json($task->load(['project', 'assignee', 'projectStage', 'attachments', 'comments', 'assignedUsers']));
    }
}
