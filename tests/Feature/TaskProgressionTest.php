<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\Stage;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskProgressionTest extends TestCase
{
    use RefreshDatabase;

    protected $project;
    protected $user1;
    protected $user2;
    protected $stage1;
    protected $stage2;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Department
        $department = Department::create(['name' => 'Engineering']);

        // Setup Users
        $this->user1 = User::factory()->create([
            'name' => 'User One',
            'department_id' => $department->id,
        ]);

        $this->user2 = User::factory()->create([
            'name' => 'User Two',
            'department_id' => $department->id,
        ]);

        // Setup Project
        $this->project = Project::create([
            'name' => 'Progression Project',
            'department_id' => $department->id,
        ]);

        // Setup Stages
        $this->stage1 = Stage::create([
            'title' => 'Stage 1 (Design)',
            'project_id' => $this->project->id,
            'order' => 1,
            'main_responsible_id' => $this->user1->id,
        ]);

        $this->stage2 = Stage::create([
            'title' => 'Stage 2 (Development)',
            'project_id' => $this->project->id,
            'order' => 2,
            'main_responsible_id' => $this->user2->id,
        ]);
    }

    /** @test */
    public function it_moves_task_to_next_project_stage_and_assigns_next_user_when_completed()
    {
        // 1. Create a task in Stage 1 assigned to User 1
        $task = Task::create([
            'title' => 'Feature A',
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage1->id,
            'assignee_id' => $this->user1->id,
            'user_status' => 'in-progress',
        ]);

        // Verify initial state
        $this->assertEquals($this->stage1->id, $task->project_stage_id);
        $this->assertEquals($this->user1->id, $task->assignee_id);
        $this->assertEquals('in-progress', $task->user_status);

        // 2. User 1 moves task to "Complete" (simulated by updating user_status)
        $task->update(['user_status' => 'complete']);

        // 3. Refresh task to check changes made by Observer
        $task->refresh();

        // 4. Verify Task has moved to Stage 2
        $this->assertEquals($this->stage2->id, $task->project_stage_id, 'Task should move to Stage 2');

        // 5. Verify Task is now assigned to User 2 (Responsible for Stage 2)
        $this->assertEquals($this->user2->id, $task->assignee_id, 'Task should be assigned to User 2');

        // 6. Verify Task user_status is reset to 'pending' for the new user
        $this->assertEquals('pending', $task->user_status, 'Task status should be reset to pending for the new user');
        
        // 7. Verify completed_at was set
        $this->assertNotNull($task->completed_at);
    }
}
