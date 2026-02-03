<?php

namespace App\Observers;

use App\Models\TaskComment;
use Illuminate\Support\Facades\Log;

class TaskCommentObserver
{
    /**
     * Handle the TaskComment "created" event.
     */
    public function created(TaskComment $taskComment): void
    {
        $task = $taskComment->task;
        $user = $taskComment->user;
        
        if ($task) {
            \App\Models\TaskHistory::create([
                'action' => 'comment_added',
                'details' => sprintf(
                    'Comment added by %s',
                    $user?->name ?? 'Unknown user'
                ),
                'previous_details' => [
                    'comment_id' => $taskComment->id,
                    'comment_text' => $taskComment->comment,
                    'commenter_id' => $taskComment->user_id,
                    'commenter_name' => $user?->name,
                ],
                'task_id' => $task->id,
                'user_id' => $taskComment->user_id ?? auth()->id(),
            ]);
            
            Log::info("Comment {$taskComment->id} added to task {$task->id}");

            // Notify Assignees
            $recipients = collect([]);
            if ($task->assignee_id && $task->assignee_id !== $taskComment->user_id) {
                $recipients->push($task->assignee);
            }
            foreach ($task->assignedUsers as $assignedUser) {
                if ($assignedUser->id !== $taskComment->user_id) {
                    $recipients->push($assignedUser);
                }
            }
            // Unique recipients
            $recipients = $recipients->unique('id');

            if ($recipients->isNotEmpty()) {
                \Illuminate\Support\Facades\Notification::send(
                    $recipients, 
                    new \App\Notifications\TaskCommentNotification($task, $taskComment->comment, $user)
                );
            }
        }
    }

    /**
     * Handle the TaskComment "updated" event.
     */
    public function updated(TaskComment $taskComment): void
    {
        $task = $taskComment->task;
        $user = $taskComment->user;
        
        if ($task && $taskComment->isDirty('comment')) {
            $originalComment = $taskComment->getOriginal('comment');
            
            \App\Models\TaskHistory::create([
                'action' => 'comment_updated',
                'details' => sprintf(
                    'Comment edited by %s',
                    $user?->name ?? 'Unknown user'
                ),
                'previous_details' => [
                    'comment_id' => $taskComment->id,
                    'original_comment' => $originalComment,
                    'new_comment' => $taskComment->comment,
                    'commenter_id' => $taskComment->user_id,
                    'commenter_name' => $user?->name,
                ],
                'task_id' => $task->id,
                'user_id' => auth()->id() ?? $taskComment->user_id,
            ]);
            
            Log::info("Comment {$taskComment->id} updated on task {$task->id}");
        }
    }

    /**
     * Handle the TaskComment "deleted" event.
     */
    public function deleted(TaskComment $taskComment): void
    {
        $task = $taskComment->task;
        $user = $taskComment->user;
        
        if ($task) {
            \App\Models\TaskHistory::create([
                'action' => 'comment_deleted',
                'details' => sprintf(
                    'Comment deleted (originally by %s)',
                    $user?->name ?? 'Unknown user'
                ),
                'previous_details' => [
                    'comment_id' => $taskComment->id,
                    'comment_text' => $taskComment->comment,
                    'original_commenter_id' => $taskComment->user_id,
                    'original_commenter_name' => $user?->name,
                    'deleted_by_id' => auth()->id(),
                    'deleted_by_name' => auth()->user()?->name,
                ],
                'task_id' => $task->id,
                'user_id' => auth()->id(),
            ]);
            
            Log::info("Comment {$taskComment->id} deleted from task {$task->id}");
        }
    }

    /**
     * Handle the TaskComment "restored" event.
     */
    public function restored(TaskComment $taskComment): void
    {
        $task = $taskComment->task;
        $user = $taskComment->user;
        
        if ($task) {
            \App\Models\TaskHistory::create([
                'action' => 'comment_restored',
                'details' => sprintf(
                    'Comment restored (originally by %s)',
                    $user?->name ?? 'Unknown user'
                ),
                'previous_details' => [
                    'comment_id' => $taskComment->id,
                    'comment_text' => $taskComment->comment,
                    'original_commenter_id' => $taskComment->user_id,
                    'original_commenter_name' => $user?->name,
                ],
                'task_id' => $task->id,
                'user_id' => auth()->id(),
            ]);
            
            Log::info("Comment {$taskComment->id} restored on task {$task->id}");
        }
    }

    /**
     * Handle the TaskComment "force deleted" event.
     */
    public function forceDeleted(TaskComment $taskComment): void
    {
        // Force deleted comments are permanently removed
        // No history tracking needed as the task itself may be deleted
        Log::info("Comment {$taskComment->id} force deleted");
    }
}
