<?php

namespace App\Mcp\Tools;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class GenerateDailyReportTool extends Tool
{
    protected string $name = 'generate_daily_report';

    protected string $description = 'Generate a daily report with pending projects, overdue tasks, and workload heatmap';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'date' => $schema->string()
                ->description('The date for the report (YYYY-MM-DD). Defaults to today'),
        ];
    }

    public function handle(Request $request): Response
    {
        $date = $request->get('date', now()->toDateString());

        // Get pending projects
        $pendingProjects = Project::with(['tasks'])
            ->get()
            ->filter(function ($project) {
                return $project->tasks->where('user_status', '!=', 'complete')->count() > 0;
            })
            ->count();

        // Get overdue tasks
        $overdueTasks = Task::whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->where('user_status', '!=', 'complete')
            ->count();

        // Get users on leave
        $usersOnLeave = User::where('status', 'on_leave')->count();

        // Calculate workload heatmap by department
        $workloadHeatmap = User::with(['department', 'assignedTasks'])
            ->get()
            ->groupBy('department.name')
            ->map(function ($users, $departmentName) {
                $totalCapacity = $users->sum('capacity_hours_per_day');
                $totalAssigned = $users->sum(function ($user) {
                    return $user->assignedTasks()
                        ->where('user_status', '!=', 'complete')
                        ->sum('estimated_hours');
                });

                return [
                    'department' => $departmentName ?? 'Unassigned',
                    'total_capacity' => $totalCapacity,
                    'total_assigned' => $totalAssigned,
                    'utilization_percentage' => $totalCapacity > 0 ? round(($totalAssigned / $totalCapacity) * 100, 2) : 0,
                    'user_count' => $users->count(),
                ];
            })
            ->values();

        $report = [
            'report_date' => $date,
            'generated_at' => now()->toDateTimeString(),
            'summary' => [
                'pending_projects' => $pendingProjects,
                'overdue_tasks' => $overdueTasks,
                'users_on_leave' => $usersOnLeave,
            ],
            'workload_heatmap' => $workloadHeatmap,
        ];

        return Response::text(json_encode($report));
    }
}
