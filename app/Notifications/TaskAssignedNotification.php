<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskAssignedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $task;

    /**
     * Create a new notification instance.
     */
    public function __construct($task)
    {
        $this->task = $task;
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
        // Default link for admin/team-lead points to the main project kanban
        $link = "/project/{$this->task->project_id}";
        
        // If the user is a regular 'user', direct them to their specific stage view
        if ($notifiable->role === 'user' && $this->task->project_id && $this->task->project_stage_id) {
            $link = "/user-project/{$this->task->project_id}/stage/{$this->task->project_stage_id}";
        } elseif (!$this->task->project_id) {
             $link = "/tasks";
        }

        return [
            'task_id' => $this->task->id,
            'title' => 'New Task Assigned',
            'message' => "You have been assigned to task '{$this->task->title}'.",
            'type' => 'task_assigned',
            'link' => $link,
        ];
    }
}
