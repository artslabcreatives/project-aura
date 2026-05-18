<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskEarlyStartNotification extends Notification
{
    use Queueable;

    public $task;
    public $newStage;
    public $startedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $newStage, $startedBy)
    {
        $this->task = $task;
        $this->newStage = $newStage;
        $this->startedBy = $startedBy;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'title' => 'Early Task Start',
            'message' => sprintf(
                "%s started task '%s' early. Moved from Pending to '%s'.",
                $this->startedBy,
                $this->task->title,
                $this->newStage
            ),
            'type' => 'task_early_start',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
