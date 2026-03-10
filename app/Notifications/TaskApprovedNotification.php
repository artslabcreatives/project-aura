<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskApprovedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $task;
    public $stageName;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $stageName)
    {
        $this->task = $task;
        $this->stageName = $stageName;
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
            'title' => 'Task Approved',
            'message' => "Your task '{$this->task->title}' has been approved and moved to {$this->stageName}.",
            'type' => 'task_approved',
            'link' => "/project/{$this->task->project_id}",
        ];
    }
}
