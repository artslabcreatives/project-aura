<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskCommentNotification extends Notification
{
    use Queueable;

    public $task;
    public $comment;
    public $commenter;

    public function __construct($task, $comment, $commenter)
    {
        $this->task = $task;
        $this->comment = $comment;
        $this->commenter = $commenter;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'title' => 'New Comment',
            'message' => "{$this->commenter->name} commented on task '{$this->task->title}'",
            'type' => 'task_comment',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
