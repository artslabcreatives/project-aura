<?php
namespace App\Listeners;

use App\Events\ProjectStatusChanged;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class CascadeProjectStatusToTasks
{
    public function handle(ProjectStatusChanged $event): void
    {
        $project  = $event->project;
        $newStatus = $event->newStatus;

        DB::transaction(function () use ($project, $newStatus) {
            if ($newStatus === 'on-hold') {
                // Pause: lock all tasks that are not already complete/cancelled
                Task::where('project_id', $project->id)
                    ->whereNotIn('user_status', ['complete', 'cancelled'])
                    ->each(function (Task $task) {
                        $task->update([
                            'previous_status' => $task->user_status,
                            'is_locked'       => true,
                        ]);
                    });
            } elseif ($newStatus === 'cancelled') {
                // Cancel: mark all non-complete tasks as cancelled
                Task::where('project_id', $project->id)
                    ->where('user_status', '!=', 'complete')
                    ->each(function (Task $task) {
                        $task->update([
                            'previous_status' => $task->user_status,
                            'user_status'     => 'cancelled',
                            'is_locked'       => true,
                        ]);
                    });
            } elseif ($newStatus === 'active') {
                // Resume: restore tasks from previous_status and unlock
                Task::where('project_id', $project->id)
                    ->where('is_locked', true)
                    ->each(function (Task $task) {
                        $task->update([
                            'user_status'    => $task->previous_status ?? 'pending',
                            'previous_status'=> null,
                            'is_locked'      => false,
                        ]);
                    });
            }
        });
    }
}
