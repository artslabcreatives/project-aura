<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->department = Department::create(['name' => 'Engineering']);
    }

    public function test_can_update_user_status(): void
    {
        $user = User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'working',
        ]);

        $user->update(['status' => 'on_leave']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'on_leave',
        ]);
    }

    public function test_can_get_users_on_leave(): void
    {
        User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'on_leave',
        ]);

        User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'working',
        ]);

        $usersOnLeave = User::where('status', 'on_leave')->get();

        $this->assertCount(1, $usersOnLeave);
    }

    public function test_can_detect_overworked_users(): void
    {
        $user = User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'working',
            'capacity_hours_per_day' => 6,
        ]);

        $project = \App\Models\Project::create([
            'name' => 'Test Project',
            'department_id' => $this->department->id,
        ]);

        // Create tasks with total estimated hours exceeding capacity
        Task::create([
            'title' => 'Task 1',
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'estimated_hours' => 5,
            'user_status' => 'in-progress',
        ]);

        Task::create([
            'title' => 'Task 2',
            'project_id' => $project->id,
            'assignee_id' => $user->id,
            'estimated_hours' => 5,
            'user_status' => 'pending',
        ]);

        $assignedHours = Task::where('assignee_id', $user->id)
            ->where('user_status', '!=', 'complete')
            ->sum('estimated_hours');

        $this->assertTrue($assignedHours > $user->capacity_hours_per_day);
    }

    public function test_can_get_idle_users(): void
    {
        $idleUser = User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'idle',
        ]);

        $activeUser = User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'working',
        ]);

        $project = \App\Models\Project::create([
            'name' => 'Test Project',
            'department_id' => $this->department->id,
        ]);

        Task::create([
            'title' => 'Active Task',
            'project_id' => $project->id,
            'assignee_id' => $activeUser->id,
            'user_status' => 'in-progress',
        ]);

        // Get users with no active tasks
        $users = User::get()->filter(function ($user) {
            return $user->assignedTasks()->where('user_status', '!=', 'complete')->count() === 0;
        });

        $this->assertTrue($users->contains($idleUser));
        $this->assertFalse($users->contains($activeUser));
    }
}
