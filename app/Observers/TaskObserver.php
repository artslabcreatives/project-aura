<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\Stage;
use App\Models\User;
use App\Notifications\TaskCompletedNotification;
use App\Notifications\TaskReviewNeededNotification;
use Illuminate\Support\Facades\Log;

class TaskObserver
{
    /**
     * Handle the Task "updating" event.
     * This runs before the update is saved to the database.
     */
    public function updating(Task $task): void
    {
        // Check if project_stage_id is being changed (e.g. sent back from review)
        if ($task->isDirty('project_stage_id')) {
            $newStageId = $task->project_stage_id;
            
            // Check if we are moving back to the previous stage
            if ($task->previous_stage_id && $newStageId == $task->previous_stage_id) {
                // We are reverting to the previous stage
                
                // Restore original assignee if available
                if ($task->original_assignee_id) {
                    $task->assignee_id = $task->original_assignee_id;
                    Log::info("Task {$task->id} reverted to stage {$newStageId} - Restored assignee {$task->original_assignee_id}");
                }
                
                // Clear the previous stage/assignee tracking since we are back
                $task->previous_stage_id = null;
                $task->original_assignee_id = null;
            }
        }

        // Check if user_status is being changed to 'complete'
        if ($task->isDirty('user_status') && $task->user_status === 'complete') {
            
            // If this is a subtask, DO NOT move it to another stage.
            // Subtasks stay in the parent's stage.
            if ($task->parent_id) {
               return; 
            }

            // Get the current stage
            $currentStage = Stage::find($task->project_stage_id);
            
            if ($currentStage) {
                $targetStageId = null;
                $shouldResetStatus = false;
                
                // Check if there is a linked review stage
                if ($currentStage->linked_review_stage_id) {
                    $targetStageId = $currentStage->linked_review_stage_id;
                    $targetStage = Stage::find($targetStageId);
                    
                    if ($targetStage && $targetStage->is_review_stage) {
                        // Moving to Review Stage - keep status as complete
                        // Store the previous stage and original assignee for context
                        $task->previous_stage_id = $currentStage->id;
                        $task->original_assignee_id = $task->assignee_id;
                        // Keep the same assignee for review context
                        // Do NOT reset status - it stays "complete"
                        
                        Log::info("Task {$task->id} moved to review stage {$targetStageId}");
                    }
                } else {
                    // Move to next sequential stage
                    $nextStage = Stage::where('project_id', $currentStage->project_id)
                        ->where('order', '>', $currentStage->order)
                        ->orderBy('order', 'asc')
                        ->first();
                    
                    if ($nextStage) {
                        $targetStageId = $nextStage->id;
                        $shouldResetStatus = true;
                        
                        // Auto-assign to main responsible person of target stage
                        if ($nextStage->main_responsible_id) {
                            $task->assignee_id = $nextStage->main_responsible_id;
                            Log::info("Task {$task->id} assigned to user {$nextStage->main_responsible_id}");
                        } else {
                            // No main responsible set - unassign
                            $task->assignee_id = null;
                            Log::info("Task {$task->id} unassigned - no main responsible for stage {$nextStage->id}");
                        }
                        
                        // Reset status to pending for the new assignee
                        $task->user_status = 'pending';
                        
                        Log::info("Task {$task->id} moved to next stage {$targetStageId} and status reset to pending");
                    }
                }
                
                // Update the project_stage_id if we found a target stage
                if ($targetStageId) {
                    $task->project_stage_id = $targetStageId;
                    $task->completed_at = now();
                }
            }
        }
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        // Log for debugging purposes
        Log::debug("Task {$task->id} updated", [
            'status' => $task->user_status,
            'stage' => $task->project_stage_id,
            'assignee' => $task->assignee_id,
        ]);

        // If this task is a subtask and is completed, check if all siblings are complete
        if ($task->parent_id && $task->user_status === 'complete') {
            $parent = $task->parentTask;
            if ($parent) {
                $incompleteSubtasks = $parent->subtasks()->where('user_status', '!=', 'complete')->count();
                
                if ($incompleteSubtasks === 0) {
                    // All subtasks are complete, complete the parent
                    Log::info("All subtasks for task {$parent->id} are complete. Completing parent task.");
                    $parent->update(['user_status' => 'complete']);
                }
            }
        }

        // Send notification if stage changed or completed
        // We check if project_stage_id was changed in this update cycle
        // Note: 'updating' runs before DB update, 'updated' runs after.
        // But 'getChanges()' in 'updated' should show what changed.
        if ($task->wasChanged('project_stage_id')) {
            $newStage = Stage::find($task->project_stage_id);
            $stageName = $newStage ? $newStage->title : 'Unknown Stage';
            
            // Current user who performed the action (if available in request/auth)
            // Since this is an observer, Auth::user() usually works if the action was triggered by an HTTP request
             $user = auth()->user();
             if (!$user && $task->assignee_id) {
                 // Fallback if no auth user (e.g. queue job), though for now we assume interactive
                 $user = User::find($task->assignee_id); 
             }
             
             if ($user) {
                 // Check if the new stage is a review stage and notify the responsible user
                 if ($newStage && $newStage->is_review_stage && $newStage->mainResponsible) {
                     $responsibleUser = $newStage->mainResponsible;
                     
                     // Avoid double notification if the responsible user is the one who moved the task (optional but good UX)
                     if ($responsibleUser->id !== $user->id) {
                         $responsibleUser->notify(new TaskReviewNeededNotification($task, $user, $stageName));
                         Log::info("Sent review needed notification for task {$task->id} to user {$responsibleUser->id}");
                     }
                 }

                 // Get Admins and Team Leads
                 // Ideally filter by project department if applicable, but for now sends to all relevant roles
                 $recipients = User::whereIn('role', ['admin', 'team-lead'])->get();
                 
                 foreach ($recipients as $recipient) {
                     // Don't notify self? Optional.
                     // if ($recipient->id === $user->id) continue;
                     
                     $recipient->notify(new TaskCompletedNotification($task, $user, $stageName));
                 }
                 
                 Log::info("Sent task movement notifications for task {$task->id} to " . $recipients->count() . " users.");
             }
        }
    }
}
