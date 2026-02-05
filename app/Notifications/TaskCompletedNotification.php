<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCompletedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $task;
    public $user;
    public $stageName;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $user, $stageName = 'Completed')
    {
        $this->task = $task;
        $this->user = $user;
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
            'title' => 'Task Completed/Advanced',
            'message' => "User {$this->user->name} completed task '{$this->task->title}'. It is now in {$this->stageName}.",
            'type' => 'task_completed',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
