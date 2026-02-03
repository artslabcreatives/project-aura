<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskAttachmentNotification extends Notification
{
    use Queueable;

    public $task;
    public $attachment;
    public $uploader;

    public function __construct($task, $attachment, $uploader)
    {
        $this->task = $task;
        $this->attachment = $attachment;
        $this->uploader = $uploader;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'title' => 'New Attachment',
            'message' => "{$this->uploader->name} added an attachment to task '{$this->task->title}'",
            'type' => 'task_attachment',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
