<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskReviewNeededNotification extends Notification
{
    use Queueable;

    public $task;
    public $user; // The user who moved the task
    public $stageName;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $user, $stageName)
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
        return ['database'];
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
            'title' => 'Review Needed',
            'message' => "Task '{$this->task->title}' is ready for review in {$this->stageName}.",
            'type' => 'review_needed',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
