<?php

namespace App\Notifications;

use App\Models\Project;
use App\Models\ProjectExpense;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class FinancialNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $project;
    protected $expense;
    protected $type; // 'budget' or 'expense'

    /**
     * Create a new notification instance.
     */
    public function __construct(Project $project, $type, ProjectExpense $expense = null)
    {
        $this->project = $project;
        $this->type = $type;
        $this->expense = $expense;
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
        if ($this->type === 'budget') {
            $amount = $this->project->budget_allocated;
            $currency = $this->project->currency ?? 'LKR';
            return [
                'title' => 'Budget Updated',
                'message' => "A budget of {$currency} " . number_format($amount, 2) . " has been allocated to project: {$this->project->name}",
                'project_id' => $this->project->id,
                'type' => 'budget',
            ];
        } else {
            $amount = $this->expense->amount;
            $currency = $this->expense->currency ?? 'LKR';
            $submittedBy = $this->expense->submittedBy->name ?? 'User';
            return [
                'title' => 'New Financial Entry',
                'message' => "{$submittedBy} added a new {$this->expense->type} of {$currency} " . number_format($amount, 2) . " to project: {$this->project->name}",
                'project_id' => $this->project->id,
                'expense_id' => $this->expense->id,
                'type' => 'expense',
            ];
        }
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => $this->type === 'budget' ? 'Budget Updated' : 'New Financial Entry',
            'message' => $this->toArray($notifiable)['message'],
            'project_id' => $this->project->id,
            'type' => $this->type,
        ]);
    }
}
