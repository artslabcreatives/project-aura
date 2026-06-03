<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectCreatedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $project;
    protected $creator;

    /**
     * Create a new notification instance.
     */
    public function __construct($project, $creator = null)
    {
        $this->project = $project;
        $this->creator = $creator;
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
        $message = $this->creator
            ? "{$this->creator->name} created new project '{$this->project->name}' for your department."
            : "New project '{$this->project->name}' has been created.";

        return [
            'project_id' => $this->project->id,
            'title' => 'New Project Created',
            'message' => $message,
            'type' => 'project_created',
            'link' => "/project/{$this->project->id}",
        ];
    }
}
