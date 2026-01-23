<?php

namespace App\Observers;

use App\Models\TaskAttachment;
use App\Services\TaskHistoryService;
use Illuminate\Support\Facades\Log;

class TaskAttachmentObserver
{
    protected TaskHistoryService $historyService;

    public function __construct(TaskHistoryService $historyService)
    {
        $this->historyService = $historyService;
    }

    /**
     * Handle the TaskAttachment "created" event.
     */
    public function created(TaskAttachment $taskAttachment): void
    {
        $task = $taskAttachment->task;
        
        if ($task) {
            $this->historyService->trackAttachmentAdded(
                $task,
                $taskAttachment->name ?? 'Unnamed attachment',
                $taskAttachment->url ?? '',
                auth()->id()
            );
            
            Log::info("Attachment {$taskAttachment->id} added to task {$task->id}");
        }
    }

    /**
     * Handle the TaskAttachment "updated" event.
     */
    public function updated(TaskAttachment $taskAttachment): void
    {
        $task = $taskAttachment->task;
        
        if ($task) {
            $changes = $taskAttachment->getChanges();
            $original = [];
            
            foreach (array_keys($changes) as $key) {
                if (!in_array($key, ['updated_at', 'created_at'])) {
                    $original[$key] = $taskAttachment->getOriginal($key);
                }
            }
            
            if (!empty($original)) {
                \App\Models\TaskHistory::create([
                    'action' => 'attachment_updated',
                    'details' => sprintf(
                        'Attachment "%s" updated',
                        $taskAttachment->name ?? 'Unnamed attachment'
                    ),
                    'previous_details' => $original,
                    'task_id' => $task->id,
                    'user_id' => auth()->id(),
                ]);
                
                Log::info("Attachment {$taskAttachment->id} updated on task {$task->id}");
            }
        }
    }

    /**
     * Handle the TaskAttachment "deleted" event.
     */
    public function deleted(TaskAttachment $taskAttachment): void
    {
        $task = $taskAttachment->task;
        
        if ($task) {
            $this->historyService->trackAttachmentRemoved(
                $task,
                $taskAttachment->name ?? 'Unnamed attachment',
                $taskAttachment->url ?? '',
                auth()->id()
            );
            
            Log::info("Attachment {$taskAttachment->id} removed from task {$task->id}");
        }
    }

    /**
     * Handle the TaskAttachment "restored" event.
     */
    public function restored(TaskAttachment $taskAttachment): void
    {
        $task = $taskAttachment->task;
        
        if ($task) {
            \App\Models\TaskHistory::create([
                'action' => 'attachment_restored',
                'details' => sprintf(
                    'Attachment "%s" restored',
                    $taskAttachment->name ?? 'Unnamed attachment'
                ),
                'previous_details' => [
                    'attachment_id' => $taskAttachment->id,
                    'attachment_name' => $taskAttachment->name,
                    'attachment_url' => $taskAttachment->url,
                ],
                'task_id' => $task->id,
                'user_id' => auth()->id(),
            ]);
            
            Log::info("Attachment {$taskAttachment->id} restored on task {$task->id}");
        }
    }

    /**
     * Handle the TaskAttachment "force deleted" event.
     */
    public function forceDeleted(TaskAttachment $taskAttachment): void
    {
        // Force deleted attachments are permanently removed
        // No history tracking needed as the task itself may be deleted
        Log::info("Attachment {$taskAttachment->id} force deleted");
    }
}
