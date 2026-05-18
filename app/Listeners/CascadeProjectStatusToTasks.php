<?php
namespace App\Listeners;

use App\Events\ProjectStatusChanged;
use Illuminate\Support\Facades\DB;

class CascadeProjectStatusToTasks
{
    public function handle(ProjectStatusChanged $event): void
    {
        $project   = $event->project;
        $newStatus = $event->newStatus;
        $projectId = $project->id;

        DB::transaction(function () use ($projectId, $newStatus) {
            if ($newStatus === 'on-hold') {
                // Pause: snapshot current status then lock — single UPDATE via SQL assignment
                DB::statement(
                    "UPDATE tasks
                     SET previous_status = user_status,
                         is_locked = 1,
                         updated_at = NOW()
                     WHERE project_id = ?
                       AND user_status NOT IN ('complete', 'cancelled')",
                    [$projectId]
                );
            } elseif ($newStatus === 'cancelled') {
                // Cancel: snapshot then mark all non-complete tasks cancelled
                DB::statement(
                    "UPDATE tasks
                     SET previous_status = user_status,
                         user_status = 'cancelled',
                         is_locked = 1,
                         updated_at = NOW()
                     WHERE project_id = ?
                       AND user_status != 'complete'",
                    [$projectId]
                );
            } elseif ($newStatus === 'active') {
                // Resume: restore from previous_status (fall back to 'pending') and unlock
                DB::statement(
                    "UPDATE tasks
                     SET user_status = COALESCE(previous_status, 'pending'),
                         previous_status = NULL,
                         is_locked = 0,
                         updated_at = NOW()
                     WHERE project_id = ?
                       AND is_locked = 1",
                    [$projectId]
                );
            }
        });
    }
}
