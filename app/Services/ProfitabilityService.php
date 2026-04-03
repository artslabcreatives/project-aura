<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class ProfitabilityService
{
    /**
     * Calculate and update project profitability.
     */
    public function calculateProjectProfitability(Project $project): array
    {
        // Calculate revenue from estimate
        $revenue = $this->calculateProjectRevenue($project);

        // Calculate cost from actual hours worked
        $cost = $this->calculateProjectCost($project);

        // Calculate profit
        $profit = $revenue - $cost;

        // Calculate profit margin percentage
        $profitMarginPercentage = $revenue > 0
            ? ($profit / $revenue) * 100
            : 0;

        // Update project with calculated values
        $project->update([
            'total_revenue' => $revenue,
            'total_cost' => $cost,
            'actual_profit' => $profit,
            'profit_margin_percentage' => $profitMarginPercentage,
        ]);

        return [
            'revenue' => $revenue,
            'cost' => $cost,
            'profit' => $profit,
            'profit_margin_percentage' => round($profitMarginPercentage, 2),
        ];
    }

    /**
     * Calculate project revenue from estimate.
     */
    public function calculateProjectRevenue(Project $project): float
    {
        if ($project->estimate) {
            return (float) $project->estimate->total;
        }

        // Fallback: sum of task estimated values if no estimate
        return $project->tasks()
            ->whereNotNull('hourly_rate')
            ->whereNotNull('estimated_hours')
            ->get()
            ->sum(function ($task) {
                return $task->hourly_rate * $task->estimated_hours;
            });
    }

    /**
     * Calculate project cost from actual hours worked.
     */
    public function calculateProjectCost(Project $project): float
    {
        return $project->tasks()
            ->whereNotNull('hourly_rate')
            ->get()
            ->sum(function ($task) {
                return $task->hourly_rate * $task->actual_hours_worked;
            });
    }

    /**
     * Get profitability breakdown by task.
     */
    public function getTaskProfitabilityBreakdown(Project $project): array
    {
        return $project->tasks()
            ->whereNotNull('hourly_rate')
            ->get()
            ->map(function ($task) {
                $estimatedCost = $task->hourly_rate * ($task->estimated_hours ?? 0);
                $actualCost = $task->hourly_rate * $task->actual_hours_worked;
                $variance = $estimatedCost - $actualCost;

                return [
                    'task_id' => $task->id,
                    'task_name' => $task->name,
                    'estimated_hours' => $task->estimated_hours,
                    'actual_hours' => $task->actual_hours_worked,
                    'hourly_rate' => $task->hourly_rate,
                    'estimated_cost' => round($estimatedCost, 2),
                    'actual_cost' => round($actualCost, 2),
                    'variance' => round($variance, 2),
                    'efficiency_percentage' => $task->estimated_hours > 0
                        ? round(($task->estimated_hours / max($task->actual_hours_worked, 0.01)) * 100, 2)
                        : 0,
                ];
            })
            ->toArray();
    }

    /**
     * Calculate profitability for all client projects.
     */
    public function getClientProfitability(int $clientId): array
    {
        $projects = Project::where('client_id', $clientId)
            ->with('estimate')
            ->get();

        $totalRevenue = 0;
        $totalCost = 0;

        foreach ($projects as $project) {
            $totalRevenue += $this->calculateProjectRevenue($project);
            $totalCost += $this->calculateProjectCost($project);
        }

        $totalProfit = $totalRevenue - $totalCost;
        $profitMargin = $totalRevenue > 0
            ? ($totalProfit / $totalRevenue) * 100
            : 0;

        return [
            'client_id' => $clientId,
            'total_projects' => $projects->count(),
            'total_revenue' => round($totalRevenue, 2),
            'total_cost' => round($totalCost, 2),
            'total_profit' => round($totalProfit, 2),
            'profit_margin_percentage' => round($profitMargin, 2),
            'projects' => $projects->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'revenue' => $project->total_revenue ?? $this->calculateProjectRevenue($project),
                    'cost' => $project->total_cost ?? $this->calculateProjectCost($project),
                    'profit' => $project->actual_profit,
                    'profit_margin' => $project->profit_margin_percentage,
                ];
            }),
        ];
    }

    /**
     * Update task actual hours and cost.
     */
    public function updateTaskHours(Task $task): void
    {
        // Sum all time logs for this task
        $totalHours = $task->timeLogs()
            ->whereNotNull('ended_at')
            ->sum('hours_logged');

        $task->update([
            'actual_hours_worked' => $totalHours,
            'task_cost' => $task->hourly_rate ? $task->hourly_rate * $totalHours : null,
        ]);

        // Recalculate project profitability
        if ($task->project) {
            $this->calculateProjectProfitability($task->project);
        }
    }
}
