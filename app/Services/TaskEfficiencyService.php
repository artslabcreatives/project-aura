<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TaskEfficiencyService
{
    /**
     * Calculate efficiency for a task.
     * Efficiency = (estimated_hours / actual_hours_worked) * 100
     * Values over 100% mean the task was completed faster than estimated.
     */
    public function calculateTaskEfficiency(Task $task): ?float
    {
        if (!$task->estimated_hours || $task->actual_hours_worked <= 0) {
            return null;
        }

        return ($task->estimated_hours / $task->actual_hours_worked) * 100;
    }

    /**
     * Get efficiency metrics for a project.
     */
    public function getProjectEfficiency(int $projectId): array
    {
        $tasks = Task::where('project_id', $projectId)
            ->whereNotNull('estimated_hours')
            ->where('actual_hours_worked', '>', 0)
            ->get();

        if ($tasks->isEmpty()) {
            return [
                'total_tasks' => 0,
                'average_efficiency' => 0,
                'on_time_count' => 0,
                'delayed_count' => 0,
                'tasks' => [],
            ];
        }

        $totalEfficiency = 0;
        $onTimeCount = 0;
        $delayedCount = 0;
        $taskDetails = [];

        foreach ($tasks as $task) {
            $efficiency = $this->calculateTaskEfficiency($task);

            if ($efficiency !== null) {
                $totalEfficiency += $efficiency;

                if ($efficiency >= 100) {
                    $onTimeCount++;
                } else {
                    $delayedCount++;
                }

                $taskDetails[] = [
                    'task_id' => $task->id,
                    'task_name' => $task->title,
                    'estimated_hours' => $task->estimated_hours,
                    'actual_hours' => $task->actual_hours_worked,
                    'efficiency_percentage' => round($efficiency, 2),
                    'variance_hours' => round($task->estimated_hours - $task->actual_hours_worked, 2),
                    'assignee' => $task->assignee ? [
                        'id' => $task->assignee->id,
                        'name' => $task->assignee->name,
                    ] : null,
                ];
            }
        }

        $averageEfficiency = $tasks->count() > 0
            ? $totalEfficiency / $tasks->count()
            : 0;

        return [
            'total_tasks' => $tasks->count(),
            'average_efficiency' => round($averageEfficiency, 2),
            'on_time_count' => $onTimeCount,
            'delayed_count' => $delayedCount,
            'on_time_percentage' => $tasks->count() > 0
                ? round(($onTimeCount / $tasks->count()) * 100, 2)
                : 0,
            'tasks' => $taskDetails,
        ];
    }

    /**
     * Get efficiency metrics for a user across all their tasks.
     * This tracks efficiency without penalizing reassignments by only
     * counting time logs from the current assignee.
     */
    public function getUserEfficiency(int $userId): array
    {
        $user = User::findOrFail($userId);

        // Get tasks where user has logged time
        $tasks = Task::whereHas('timeLogs', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->whereNotNull('estimated_hours')
        ->with(['timeLogs' => function ($query) use ($userId) {
            $query->where('user_id', $userId);
        }])
        ->get();

        if ($tasks->isEmpty()) {
            return [
                'user_id' => $userId,
                'user_name' => $user->name,
                'total_tasks' => 0,
                'total_hours_worked' => 0,
                'total_hours_estimated' => 0,
                'average_efficiency' => 0,
                'tasks' => [],
            ];
        }

        $totalHoursWorked = 0;
        $totalHoursEstimated = 0;
        $taskDetails = [];

        foreach ($tasks as $task) {
            // Calculate hours worked by this user only
            $userHours = $task->timeLogs->sum('hours_logged');
            $totalHoursWorked += $userHours;
            $totalHoursEstimated += $task->estimated_hours;

            $efficiency = $task->estimated_hours > 0 && $userHours > 0
                ? ($task->estimated_hours / $userHours) * 100
                : null;

            if ($efficiency !== null) {
                $taskDetails[] = [
                    'task_id' => $task->id,
                    'task_name' => $task->title,
                    'project_name' => $task->project->name ?? null,
                    'estimated_hours' => $task->estimated_hours,
                    'user_hours_worked' => round($userHours, 2),
                    'efficiency_percentage' => round($efficiency, 2),
                ];
            }
        }

        $averageEfficiency = $totalHoursEstimated > 0 && $totalHoursWorked > 0
            ? ($totalHoursEstimated / $totalHoursWorked) * 100
            : 0;

        return [
            'user_id' => $userId,
            'user_name' => $user->name,
            'total_tasks' => count($taskDetails),
            'total_hours_worked' => round($totalHoursWorked, 2),
            'total_hours_estimated' => round($totalHoursEstimated, 2),
            'average_efficiency' => round($averageEfficiency, 2),
            'tasks' => $taskDetails,
        ];
    }

    /**
     * Get efficiency trends over time for a user.
     */
    public function getUserEfficiencyTrends(int $userId, int $days = 30): array
    {
        $user = User::findOrFail($userId);
        $startDate = now()->subDays($days);

        $timeLogs = DB::table('task_time_logs')
            ->join('tasks', 'task_time_logs.task_id', '=', 'tasks.id')
            ->where('task_time_logs.user_id', $userId)
            ->where('task_time_logs.ended_at', '>=', $startDate)
            ->whereNotNull('task_time_logs.ended_at')
            ->whereNotNull('tasks.estimated_hours')
            ->select(
                DB::raw('DATE(task_time_logs.ended_at) as date'),
                DB::raw('SUM(task_time_logs.hours_logged) as total_hours'),
                DB::raw('SUM(tasks.estimated_hours) as total_estimated')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $trends = $timeLogs->map(function ($log) {
            $efficiency = $log->total_estimated > 0 && $log->total_hours > 0
                ? ($log->total_estimated / $log->total_hours) * 100
                : 0;

            return [
                'date' => $log->date,
                'hours_worked' => round($log->total_hours, 2),
                'hours_estimated' => round($log->total_estimated, 2),
                'efficiency_percentage' => round($efficiency, 2),
            ];
        });

        return [
            'user_id' => $userId,
            'user_name' => $user->name,
            'period_days' => $days,
            'trends' => $trends->toArray(),
        ];
    }

    /**
     * Get department-wide efficiency metrics.
     */
    public function getDepartmentEfficiency(int $departmentId): array
    {
        $users = User::where('department_id', $departmentId)->get();

        $departmentMetrics = [
            'department_id' => $departmentId,
            'total_users' => $users->count(),
            'total_tasks' => 0,
            'total_hours_worked' => 0,
            'total_hours_estimated' => 0,
            'average_efficiency' => 0,
            'users' => [],
        ];

        foreach ($users as $user) {
            $userEfficiency = $this->getUserEfficiency($user->id);

            if ($userEfficiency['total_tasks'] > 0) {
                $departmentMetrics['total_tasks'] += $userEfficiency['total_tasks'];
                $departmentMetrics['total_hours_worked'] += $userEfficiency['total_hours_worked'];
                $departmentMetrics['total_hours_estimated'] += $userEfficiency['total_hours_estimated'];

                $departmentMetrics['users'][] = [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'efficiency' => $userEfficiency['average_efficiency'],
                    'tasks_completed' => $userEfficiency['total_tasks'],
                ];
            }
        }

        $departmentMetrics['average_efficiency'] =
            $departmentMetrics['total_hours_estimated'] > 0 && $departmentMetrics['total_hours_worked'] > 0
                ? round(($departmentMetrics['total_hours_estimated'] / $departmentMetrics['total_hours_worked']) * 100, 2)
                : 0;

        // Sort users by efficiency
        usort($departmentMetrics['users'], function ($a, $b) {
            return $b['efficiency'] <=> $a['efficiency'];
        });

        return $departmentMetrics;
    }
}
