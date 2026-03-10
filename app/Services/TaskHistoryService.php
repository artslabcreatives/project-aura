<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskHistory;
use Illuminate\Support\Facades\Log;

class TaskHistoryService
{
    /**
     * Track stage change for a task
     */
    public function trackStageChange(Task $task, int $oldStageId, int $newStageId, ?int $userId = null): void
    {
        $oldStage = \App\Models\Stage::find($oldStageId);
        $newStage = \App\Models\Stage::find($newStageId);
        
        $action = $newStage && $newStage->is_review_stage ? 'moved_to_review_stage' : 'stage_changed';
        
        // Populate both incoming and outgoing, even if same
        TaskHistory::create([
            'action' => $action,
            'details' => sprintf(
                'Stage changed from "%s" to "%s"',
                $oldStage?->title ?? 'Unknown',
                $newStage?->title ?? 'Unknown'
            ),
            'previous_details' => [
                'old_stage_id' => $oldStageId,
                'old_stage_title' => $oldStage?->title,
                'new_stage_id' => $newStageId,
                'new_stage_title' => $newStage?->title,
            ],
            'incoming_stage_id' => $oldStageId,
            'outgoing_stage_id' => $newStageId,
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Stage change tracked for task {$task->id} from stage {$oldStageId} to {$newStageId}");
    }

    /**
     * Track assignee change for a task
     */
    public function trackAssigneeChange(Task $task, ?int $oldAssigneeId, ?int $newAssigneeId, ?int $userId = null): void
    {
        $oldAssignee = $oldAssigneeId ? \App\Models\User::find($oldAssigneeId) : null;
        $newAssignee = $newAssigneeId ? \App\Models\User::find($newAssigneeId) : null;
        
        $action = $newAssigneeId ? ($oldAssigneeId ? 'reassigned' : 'assigned') : 'unassigned';
        
        $details = match($action) {
            'assigned' => sprintf('Task assigned to %s', $newAssignee?->name ?? 'Unknown'),
            'unassigned' => sprintf('Task unassigned from %s', $oldAssignee?->name ?? 'Unknown'),
            'reassigned' => sprintf(
                'Task reassigned from %s to %s',
                $oldAssignee?->name ?? 'Unknown',
                $newAssignee?->name ?? 'Unknown'
            ),
        };
        
        // Populate both incoming and outgoing, even if same
        TaskHistory::create([
            'action' => $action,
            'details' => $details,
            'previous_details' => [
                'old_assignee_id' => $oldAssigneeId,
                'old_assignee_name' => $oldAssignee?->name,
                'old_assignee_email' => $oldAssignee?->email,
                'new_assignee_id' => $newAssigneeId,
                'new_assignee_name' => $newAssignee?->name,
                'new_assignee_email' => $newAssignee?->email,
            ],
            'incoming_user_id' => $oldAssigneeId,
            'outgoing_user_id' => $newAssigneeId,
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Assignee change tracked for task {$task->id}");
    }

    /**
     * Track status change for a task
     */
    public function trackStatusChange(Task $task, string $oldStatus, string $newStatus, ?int $userId = null): void
    {
        TaskHistory::create([
            'action' => 'status_changed',
            'details' => sprintf('Status changed from "%s" to "%s"', $oldStatus, $newStatus),
            'previous_details' => [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Status change tracked for task {$task->id} from {$oldStatus} to {$newStatus}");
    }

    /**
     * Track task details update (title, description, etc.)
     */
    public function trackDetailsUpdate(Task $task, array $changedAttributes, ?int $userId = null): void
    {
        $details = [];
        $previousDetails = [];
        
        foreach ($changedAttributes as $attribute => $newValue) {
            $oldValue = $task->getOriginal($attribute);
            
            // Skip tracking for internal fields
            if (in_array($attribute, ['updated_at', 'created_at', 'deleted_at'])) {
                continue;
            }
            
            $details[] = sprintf('%s changed', ucfirst(str_replace('_', ' ', $attribute)));
            // Store both old and new values for complete change tracking
            $previousDetails['old_' . $attribute] = $oldValue;
            $previousDetails['new_' . $attribute] = $newValue;
        }
        
        if (empty($details)) {
            return;
        }
        
        TaskHistory::create([
            'action' => 'updated',
            'details' => implode(', ', $details),
            'previous_details' => $previousDetails,
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Details update tracked for task {$task->id}");
    }

    /**
     * Track attachment addition
     */
    public function trackAttachmentAdded(Task $task, string $attachmentName, string $attachmentPath, ?int $userId = null): void
    {
        TaskHistory::create([
            'action' => 'attachment_added',
            'details' => sprintf('Attachment "%s" added', $attachmentName),
            'previous_details' => [
                'attachment_name' => $attachmentName,
                'attachment_path' => $attachmentPath,
            ],
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Attachment addition tracked for task {$task->id}");
    }

    /**
     * Track attachment removal
     */
    public function trackAttachmentRemoved(Task $task, string $attachmentName, string $attachmentPath, ?int $userId = null): void
    {
        TaskHistory::create([
            'action' => 'attachment_removed',
            'details' => sprintf('Attachment "%s" removed', $attachmentName),
            'previous_details' => [
                'attachment_name' => $attachmentName,
                'attachment_path' => $attachmentPath,
            ],
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Attachment removal tracked for task {$task->id}");
    }

    /**
     * Track task completion
     */
    public function trackTaskCompleted(Task $task, ?int $userId = null): void
    {
        TaskHistory::create([
            'action' => 'completed',
            'details' => 'Task marked as complete',
            'previous_details' => [
                'old_completed_at' => $task->getOriginal('completed_at'),
                'new_completed_at' => $task->completed_at,
                'old_user_status' => $task->getOriginal('user_status'),
                'new_user_status' => $task->user_status,
            ],
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Task completion tracked for task {$task->id}");
    }

    /**
     * Track task creation
     */
    public function trackTaskCreated(Task $task, ?int $userId = null): void
    {
        TaskHistory::create([
            'action' => 'created',
            'details' => 'Task created',
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Task creation tracked for task {$task->id}");
    }

    /**
     * Track task archival
     */
    public function trackTaskArchived(Task $task, ?int $userId = null): void
    {
        TaskHistory::create([
            'action' => 'archived',
            'details' => 'Task archived',
            'previous_details' => [
                'old_archived_at' => $task->getOriginal('archived_at'),
                'new_archived_at' => now(),
                'archived_from_stage_id' => $task->project_stage_id,
                'archived_from_assignee_id' => $task->assignee_id,
            ],
            'incoming_stage_id' => $task->project_stage_id,
            'incoming_user_id' => $task->assignee_id,
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Task archival tracked for task {$task->id}");
    }

    /**
     * Track task restoration
     */
    public function trackTaskRestored(Task $task, ?int $userId = null): void
    {
        TaskHistory::create([
            'action' => 'restored',
            'details' => 'Task restored from archive',
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
        
        Log::info("TaskHistory: Task restoration tracked for task {$task->id}");
    }

    /**
     * Track multiple changes at once
     */
    public function trackChanges(Task $task, ?int $userId = null): void
    {
        // Use getChanges() instead of getDirty() since this is called in the 'updated' event
        // getDirty() only works before save, getChanges() returns what was actually changed
        $changes = $task->getChanges();
        
        // Track stage change
        if (isset($changes['project_stage_id'])) {
            $this->trackStageChange(
                $task,
                $task->getOriginal('project_stage_id'),
                $changes['project_stage_id'],
                $userId
            );
        }
        
        // Track assignee change
        if (isset($changes['assignee_id'])) {
            $this->trackAssigneeChange(
                $task,
                $task->getOriginal('assignee_id'),
                $changes['assignee_id'],
                $userId
            );
        }
        
        // Track status change
        if (isset($changes['user_status'])) {
            $this->trackStatusChange(
                $task,
                $task->getOriginal('user_status'),
                $changes['user_status'],
                $userId
            );
            
            // Special handling for completion
            if ($changes['user_status'] === 'complete') {
                $this->trackTaskCompleted($task, $userId);
            }
        }
        
        // Track other detail changes
        $detailChanges = array_diff_key($changes, array_flip([
            'project_stage_id',
            'assignee_id',
            'user_status',
            'updated_at',
            'previous_stage_id',
            'original_assignee_id',
            'completed_at'
        ]));
        
        if (!empty($detailChanges)) {
            $this->trackDetailsUpdate($task, $detailChanges, $userId);
        }
    }

    /**
     * Track task being viewed
     */
    public function trackTaskViewed(Task $task, ?int $userId = null): void
    {
        // Optional: Debounce or check recent views to avoid spam
        // For now, we log every view as requested
        
        TaskHistory::create([
            'action' => 'viewed',
            'details' => 'Task viewed',
            'task_id' => $task->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
    }
}
