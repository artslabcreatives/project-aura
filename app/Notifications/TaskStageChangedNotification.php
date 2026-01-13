<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskStageChangedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $task;
    public $fromStage;
    public $toStage;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $fromStage, $toStage)
    {
        $this->task = $task;
        $this->fromStage = $fromStage;
        $this->toStage = $toStage;
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
            'title' => 'Task Stage Changed',
            'message' => "Task '{$this->task->title}' moved from '{$this->fromStage}' to '{$this->toStage}'.",
            'type' => 'task_stage_changed',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
