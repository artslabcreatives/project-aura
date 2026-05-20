<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\Stage;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessRecurringTasks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:process-recurring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process and spawn scheduled recurring tasks that are due';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $runner = getenv('AURA_JOB_RUNNER') ?: 'automatic';
        $logMessages = [];

        $now = Carbon::now();
        $msg = "Processing recurring tasks at: " . $now->toDateTimeString();
        $this->info($msg);
        $logMessages[] = $msg;

        try {
            // Get all active recurring tasks that are due, excluding 'on_completion' type
            $tasks = Task::where('is_recurring', true)
                ->whereNotNull('next_recurrence_at')
                ->where('next_recurrence_at', '<=', $now)
                ->where('recurrence_interval', '!=', 'on_completion')
                ->get();

            if ($tasks->isEmpty()) {
                $msg = "No recurring tasks are due at this time.";
                $this->info($msg);
                $logMessages[] = $msg;

                \App\Models\BackgroundJobLog::create([
                    'command' => 'tasks:process-recurring',
                    'runner' => $runner,
                    'status' => 'success',
                    'output' => implode("\n", $logMessages),
                ]);
                return 0;
            }

            $msg = "Found " . $tasks->count() . " recurring tasks to process.";
            $this->info($msg);
            $logMessages[] = $msg;

            foreach ($tasks as $task) {
                $self = $this;
                DB::transaction(function () use ($task, $now, $self, &$logMessages) {
                    // 1. Calculate duration for clone dates
                    $originalDurationDays = 0;
                    if ($task->start_date && $task->due_date) {
                        $originalDurationDays = $task->start_date->diffInDays($task->due_date);
                    }

                    $newStartDate = $task->next_recurrence_at->copy();
                    $newDueDate = $task->due_date ? $newStartDate->copy()->addDays($originalDurationDays) : null;

                    // 2. Determine target stage
                    $firstStage = Stage::where('project_id', $task->project_id)->orderBy('order', 'asc')->first();
                    $cloneStageId = $task->start_stage_id ?? ($firstStage?->id ?? $task->project_stage_id);

                    // 3. Create active task clone
                    $clone = Task::create([
                        'title' => $task->title,
                        'description' => $task->description,
                        'board_id' => $task->board_id,
                        'project_id' => $task->project_id,
                        'assignee_id' => $task->assignee_id,
                        'user_status' => 'pending',
                        'project_stage_id' => $cloneStageId,
                        'priority' => $task->priority,
                        'tags' => $task->tags,
                        'start_date' => $newStartDate,
                        'due_date' => $newDueDate,
                        'is_recurring' => false,
                        'is_assignee_locked' => $task->is_assignee_locked,
                        'hourly_rate' => $task->hourly_rate,
                        'estimated_hours' => $task->estimated_hours,
                    ]);

                    // Sync assignees
                    $assigneeIds = $task->assignedUsers->pluck('id')->toArray();
                    if (!empty($assigneeIds)) {
                        $clone->assignedUsers()->sync($assigneeIds);
                    } elseif ($task->assignee_id) {
                        $clone->assignedUsers()->sync([$task->assignee_id]);
                    }

                    // Notify assignees about the cloned recurring task
                    $notifiedUserIds = [];
                    $clone->load(['assignedUsers', 'assignee']);

                    if ($clone->assignee_id) {
                        try {
                            $clone->assignee->notify(new \App\Notifications\TaskAssignedNotification($clone));
                            $notifiedUserIds[] = $clone->assignee_id;
                        } catch (\Exception $e) {
                            Log::error("Failed to notify primary assignee on recurring clone: " . $e->getMessage());
                        }
                    }

                    foreach ($clone->assignedUsers as $user) {
                        if (!in_array($user->id, $notifiedUserIds)) {
                            try {
                                $user->notify(new \App\Notifications\TaskAssignedNotification($clone));
                                $notifiedUserIds[] = $user->id;
                            } catch (\Exception $e) {
                                Log::error("Failed to notify multi-assignee on recurring clone: " . $e->getMessage());
                            }
                        }
                    }

                    // 4. Advance the original template task's recurrence state
                    $nextRun = $self->calculateNextRecurrence($task->next_recurrence_at, $task->recurrence_interval, $task->recurrence_custom_days);

                    // If recurrence_end_at is set and next run is past the end date, terminate recurrence
                    if ($task->recurrence_end_at && $nextRun->gt($task->recurrence_end_at)) {
                        $task->is_recurring = false;
                        $task->next_recurrence_at = null;
                    } else {
                        $task->next_recurrence_at = $nextRun;
                        // Shift original dates forward too to keep the template in sync
                        if ($task->start_date) {
                            $task->start_date = $nextRun;
                        }
                        if ($task->due_date) {
                            $task->due_date = $nextRun->copy()->addDays($originalDurationDays);
                        }
                    }
                    $task->save();

                    $logMsg = "Spawned cloned task #{$clone->id} ('{$clone->title}') from recurring template #{$task->id}. Next run: " . ($task->next_recurrence_at ? $task->next_recurrence_at->toDateTimeString() : 'Terminated');
                    $self->info($logMsg);
                    $logMessages[] = $logMsg;
                    Log::info($logMsg);
                });
            }

            $msg = "Finished processing recurring tasks.";
            $this->info($msg);
            $logMessages[] = $msg;

            \App\Models\BackgroundJobLog::create([
                'command' => 'tasks:process-recurring',
                'runner' => $runner,
                'status' => 'success',
                'output' => implode("\n", $logMessages),
            ]);

        } catch (\Exception $e) {
            $logMessages[] = "ERROR: " . $e->getMessage();
            \App\Models\BackgroundJobLog::create([
                'command' => 'tasks:process-recurring',
                'runner' => $runner,
                'status' => 'failed',
                'output' => implode("\n", $logMessages),
                'error_message' => $e->getMessage(),
            ]);
            throw $e;
        }

        return 0;
    }

    /**
     * Calculate next recurrence timestamp based on interval
     */
    private function calculateNextRecurrence(Carbon $current, string $interval, ?array $customDays): Carbon
    {
        $next = $current->copy();

        switch ($interval) {
            case 'daily':
                return $next->addDay();

            case 'weekly':
                return $next->addWeek();

            case 'monthly':
                return $next->addMonth();

            case 'custom':
                if (empty($customDays)) {
                    return $next->addWeek(); // Fallback to weekly
                }
                
                // Find the next day of the week listed in custom days
                $next->addDay();
                for ($i = 0; $i < 7; $i++) {
                    if (in_array($next->dayOfWeek, $customDays)) {
                        return $next;
                    }
                    $next->addDay();
                }
                return $next;

            default:
                return $next->addWeek();
        }
    }
}
