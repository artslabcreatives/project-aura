<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\Stage;
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
    }
}
