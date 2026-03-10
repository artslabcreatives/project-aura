<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskStatusUpdatedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $task;
    protected $status;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $status)
    {
        $this->task = $task;
        $this->status = $status;
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
            'title' => 'Task Status Updated',
            'message' => "Task '{$this->task->title}' status updated to '{$this->status}'.",
            'type' => 'task_status_updated',
            'link' => "/project/{$this->task->project_id}",
        ];
    }
}
