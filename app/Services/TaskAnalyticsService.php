<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TaskAnalyticsService
{
    /**
     * Get task completion analytics for a specific time period
     *
     * @param string $period 'week', 'month', 'quarter', 'year'
     * @param Carbon|null $startDate
     * @param Carbon|null $endDate
     * @param array $filters ['project_id' => 1, 'stage_id' => 2, 'user_id' => 3]
     * @return array
     */
    public function getCompletionAnalytics(string $period, ?Carbon $startDate = null, ?Carbon $endDate = null, array $filters = []): array
    {
        if (!$startDate) {
            $startDate = $this->getDefaultStartDate($period);
        }
        
        if (!$endDate) {
            $endDate = now();
        }

        $query = Task::query()
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$startDate, $endDate]);

        // Apply filters
        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
        if (isset($filters['stage_id'])) {
            $query->where('project_stage_id', $filters['stage_id']);
        }
        if (isset($filters['user_id'])) {
            $query->where('assignee_id', $filters['user_id']);
        }
        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        // Get total count
        $totalCompleted = $query->count();

        // Get completion breakdown by time period
        $breakdown = $this->getBreakdownByPeriod($query, $period, $startDate, $endDate);

        // Get breakdown by project
        $byProject = $this->getBreakdownByProject($query, $startDate, $endDate);

        // Get breakdown by stage
        $byStage = $this->getBreakdownByStage($query, $startDate, $endDate);

        // Get breakdown by user
        $byUser = $this->getBreakdownByUser($query, $startDate, $endDate);

        // Get breakdown by priority
        $byPriority = $this->getBreakdownByPriority($query, $startDate, $endDate);

        return [
            'period' => $period,
            'start_date' => $startDate->toDateTimeString(),
            'end_date' => $endDate->toDateTimeString(),
            'total_completed' => $totalCompleted,
            'breakdown' => $breakdown,
            'by_project' => $byProject,
            'by_stage' => $byStage,
            'by_user' => $byUser,
            'by_priority' => $byPriority,
        ];
    }

    /**
     * Compare current period with previous period
     */
    public function getComparisonAnalytics(string $period, array $filters = []): array
    {
        $currentStart = $this->getDefaultStartDate($period);
        $currentEnd = now();

        // Get current period analytics
        $currentAnalytics = $this->getCompletionAnalytics($period, $currentStart, $currentEnd, $filters);

        // Calculate previous period dates
        $periodLength = $currentEnd->diffInSeconds($currentStart);
        $previousEnd = $currentStart->copy();
        $previousStart = $currentStart->copy()->subSeconds($periodLength);

        // Get previous period analytics
        $previousAnalytics = $this->getCompletionAnalytics($period, $previousStart, $previousEnd, $filters);

        // Calculate changes
        $change = $currentAnalytics['total_completed'] - $previousAnalytics['total_completed'];
        $percentageChange = $previousAnalytics['total_completed'] > 0
            ? round(($change / $previousAnalytics['total_completed']) * 100, 2)
            : 0;

        return [
            'current_period' => $currentAnalytics,
            'previous_period' => $previousAnalytics,
            'comparison' => [
                'absolute_change' => $change,
                'percentage_change' => $percentageChange,
                'trend' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'stable'),
            ],
        ];
    }

    /**
     * Get completion rate analytics
     */
    public function getCompletionRateAnalytics(string $period, array $filters = []): array
    {
        $startDate = $this->getDefaultStartDate($period);
        $endDate = now();

        $query = Task::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        // Apply filters
        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
        if (isset($filters['stage_id'])) {
            $query->where('project_stage_id', $filters['stage_id']);
        }
        if (isset($filters['user_id'])) {
            $query->where('assignee_id', $filters['user_id']);
        }

        $totalTasks = $query->count();
        $completedTasks = (clone $query)->where('user_status', 'complete')->count();
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

        return [
            'period' => $period,
            'start_date' => $startDate->toDateTimeString(),
            'end_date' => $endDate->toDateTimeString(),
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'completion_rate' => $completionRate,
            'pending_tasks' => $totalTasks - $completedTasks,
        ];
    }

    /**
     * Get average completion time analytics
     */
    public function getAverageCompletionTime(string $period, array $filters = []): array
    {
        $startDate = $this->getDefaultStartDate($period);
        $endDate = now();

        $query = Task::query()
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$startDate, $endDate]);

        // Apply filters
        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
        if (isset($filters['stage_id'])) {
            $query->where('project_stage_id', $filters['stage_id']);
        }
        if (isset($filters['user_id'])) {
            $query->where('assignee_id', $filters['user_id']);
        }

        $tasks = $query->get(['id', 'created_at', 'completed_at']);

        if ($tasks->isEmpty()) {
            return [
                'period' => $period,
                'average_hours' => 0,
                'average_days' => 0,
                'median_hours' => 0,
                'total_tasks' => 0,
            ];
        }

        $completionTimes = $tasks->map(function ($task) {
            return $task->created_at->diffInHours($task->completed_at);
        })->sort()->values();

        $averageHours = round($completionTimes->average(), 2);
        $medianHours = $this->calculateMedian($completionTimes->toArray());

        return [
            'period' => $period,
            'average_hours' => $averageHours,
            'average_days' => round($averageHours / 24, 2),
            'median_hours' => $medianHours,
            'median_days' => round($medianHours / 24, 2),
            'min_hours' => $completionTimes->min(),
            'max_hours' => $completionTimes->max(),
            'total_tasks' => $tasks->count(),
        ];
    }

    /**
     * Get breakdown by time period
     */
    private function getBreakdownByPeriod($query, string $period, Carbon $startDate, Carbon $endDate): array
    {
        $format = $this->getDateFormatForPeriod($period);
        
        $breakdown = (clone $query)
            ->select(
                DB::raw("DATE_FORMAT(completed_at, '$format') as period_label"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('period_label')
            ->orderBy('period_label')
            ->get()
            ->pluck('count', 'period_label')
            ->toArray();

        return $breakdown;
    }

    /**
     * Get breakdown by project
     */
    private function getBreakdownByProject($query, Carbon $startDate, Carbon $endDate): array
    {
        return (clone $query)
            ->select('project_id', 'projects.name as project_name', DB::raw('COUNT(*) as count'))
            ->join('projects', 'tasks.project_id', '=', 'projects.id')
            ->groupBy('project_id', 'projects.name')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'project_id' => $item->project_id,
                    'project_name' => $item->project_name,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get breakdown by stage
     */
    private function getBreakdownByStage($query, Carbon $startDate, Carbon $endDate): array
    {
        return (clone $query)
            ->select('project_stage_id', 'stages.name as stage_name', DB::raw('COUNT(*) as count'))
            ->join('stages', 'tasks.project_stage_id', '=', 'stages.id')
            ->groupBy('project_stage_id', 'stages.name')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'stage_id' => $item->project_stage_id,
                    'stage_name' => $item->stage_name,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get breakdown by user
     */
    private function getBreakdownByUser($query, Carbon $startDate, Carbon $endDate): array
    {
        return (clone $query)
            ->select('assignee_id', 'users.name as user_name', DB::raw('COUNT(*) as count'))
            ->join('users', 'tasks.assignee_id', '=', 'users.id')
            ->groupBy('assignee_id', 'users.name')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'user_id' => $item->assignee_id,
                    'user_name' => $item->user_name,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get breakdown by priority
     */
    private function getBreakdownByPriority($query, Carbon $startDate, Carbon $endDate): array
    {
        return (clone $query)
            ->select('priority', DB::raw('COUNT(*) as count'))
            ->whereNotNull('priority')
            ->groupBy('priority')
            ->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
            ->get()
            ->pluck('count', 'priority')
            ->toArray();
    }

    /**
     * Get default start date based on period
     */
    private function getDefaultStartDate(string $period): Carbon
    {
        return match($period) {
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };
    }

    /**
     * Get date format for SQL grouping based on period
     */
    private function getDateFormatForPeriod(string $period): string
    {
        return match($period) {
            'week' => '%Y-W%u', // Year-Week
            'month' => '%Y-%m', // Year-Month
            'quarter' => '%Y-Q%q', // Year-Quarter (custom)
            'year' => '%Y', // Year
            default => '%Y-%m',
        };
    }

    /**
     * Calculate median value
     */
    private function calculateMedian(array $values): float
    {
        if (empty($values)) {
            return 0;
        }

        sort($values);
        $count = count($values);
        $middle = floor($count / 2);

        if ($count % 2 == 0) {
            return ($values[$middle - 1] + $values[$middle]) / 2;
        }

        return $values[$middle];
    }
}
