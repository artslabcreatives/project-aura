<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskSuggestedNotification extends Notification
{
    use Queueable;

    public $task;
    public $user; // The user who suggested/created the task

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $user)
    {
        $this->task = $task;
        $this->user = $user;
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
            'title' => 'New Task Suggested',
            'message' => "{$this->user->name} has suggested a new task: '{$this->task->title}'.",
            'type' => 'task_suggested',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
