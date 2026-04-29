<?php

namespace App\Observers;

use App\Models\ProjectExpense;
use App\Models\User;
use App\Notifications\FinancialNotification;
use Illuminate\Support\Facades\Notification;

class ProjectExpenseObserver
{
    /**
     * Handle the ProjectExpense "created" event.
     */
    public function created(ProjectExpense $projectExpense): void
    {
        $project = $projectExpense->project;
        if ($project) {
            $recipients = User::whereIn('role', ['admin', 'hr'])->get();
            Notification::send($recipients, new FinancialNotification($project, 'expense', $projectExpense));
        }
    }
}
