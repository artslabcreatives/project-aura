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
    public $movedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $fromStage, $toStage, $movedBy = 'System')
    {
        $this->task = $task;
        $this->fromStage = $fromStage;
        $this->toStage = $toStage;
        $this->movedBy = $movedBy;
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
            'message' => sprintf(
                "%s moved task '%s' from '%s' to '%s'.",
                $this->movedBy ?? 'System',
                $this->task->title,
                $this->fromStage,
                $this->toStage
            ),
            'type' => 'task_stage_changed',
            'link' => "/project/{$this->task->project_id}?task={$this->task->id}",
        ];
    }
}
