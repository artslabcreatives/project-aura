<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->department = Department::create(['name' => 'Engineering']);
        $this->user = User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'working',
            'capacity_hours_per_day' => 6,
        ]);
        $this->project = Project::create([
            'name' => 'Test Project',
            'department_id' => $this->department->id,
        ]);
    }

    public function test_can_create_task_with_estimated_hours(): void
    {
        $taskData = [
            'title' => 'Test Task',
            'description' => 'Test Description',
            'project_id' => $this->project->id,
            'assignee_id' => $this->user->id,
            'due_date' => now()->addDays(7),
            'priority' => 'high',
            'estimated_hours' => 8,
        ];

        $task = Task::create($taskData);

        $this->assertDatabaseHas('tasks', [
            'title' => 'Test Task',
            'estimated_hours' => 8,
            'assignee_id' => $this->user->id,
        ]);
    }

    public function test_can_reassign_task(): void
    {
        $user2 = User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'working',
        ]);

        $task = Task::create([
            'title' => 'Test Task',
            'project_id' => $this->project->id,
            'assignee_id' => $this->user->id,
        ]);

        $originalAssignee = $task->assignee_id;
        $task->update(['assignee_id' => $user2->id]);

        $this->assertEquals($user2->id, $task->fresh()->assignee_id);
    }

    public function test_can_get_overdue_tasks(): void
    {
        Task::create([
            'title' => 'Overdue Task',
            'project_id' => $this->project->id,
            'assignee_id' => $this->user->id,
            'due_date' => now()->subDays(5),
            'user_status' => 'in-progress',
        ]);

        Task::create([
            'title' => 'Future Task',
            'project_id' => $this->project->id,
            'assignee_id' => $this->user->id,
            'due_date' => now()->addDays(5),
            'user_status' => 'pending',
        ]);

        $overdueTasks = Task::whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->where('user_status', '!=', 'complete')
            ->get();

        $this->assertCount(1, $overdueTasks);
        $this->assertEquals('Overdue Task', $overdueTasks->first()->title);
    }

    public function test_can_get_unassigned_tasks(): void
    {
        Task::create([
            'title' => 'Unassigned Task',
            'project_id' => $this->project->id,
            'assignee_id' => null,
        ]);

        Task::create([
            'title' => 'Assigned Task',
            'project_id' => $this->project->id,
            'assignee_id' => $this->user->id,
        ]);

        $unassignedTasks = Task::whereNull('assignee_id')
            ->where('user_status', '!=', 'complete')
            ->get();

        $this->assertCount(1, $unassignedTasks);
        $this->assertEquals('Unassigned Task', $unassignedTasks->first()->title);
    }

    public function test_can_get_blocked_tasks(): void
    {
        Task::create([
            'title' => 'Blocked Task',
            'project_id' => $this->project->id,
            'assignee_id' => $this->user->id,
            'user_status' => 'blocked',
        ]);

        Task::create([
            'title' => 'Normal Task',
            'project_id' => $this->project->id,
            'assignee_id' => $this->user->id,
            'user_status' => 'in-progress',
        ]);

        $blockedTasks = Task::where('user_status', 'blocked')->get();

        $this->assertCount(1, $blockedTasks);
        $this->assertEquals('Blocked Task', $blockedTasks->first()->title);
    }
}
