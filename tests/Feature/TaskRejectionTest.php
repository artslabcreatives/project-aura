<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\Stage;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskRejectionTest extends TestCase
{
    use RefreshDatabase;

    protected $project;
    protected $developer;
    protected $reviewer;
    protected $devStage;
    protected $reviewStage;

    protected function setUp(): void
    {
        parent::setUp();

        $department = Department::create(['name' => 'Engineering']);

        $this->developer = User::factory()->create([
            'name' => 'Developer',
            'department_id' => $department->id,
        ]);

        $this->reviewer = User::factory()->create([
            'name' => 'Reviewer',
            'department_id' => $department->id,
        ]);

        $this->project = Project::create([
            'name' => 'Test Project',
            'department_id' => $department->id,
        ]);

        $this->devStage = Stage::create([
            'title' => 'Development',
            'project_id' => $this->project->id,
            'order' => 1,
            'main_responsible_id' => $this->developer->id,
        ]);

        $this->reviewStage = Stage::create([
            'title' => 'Review',
            'project_id' => $this->project->id,
            'order' => 2,
            'is_review_stage' => true,
            'main_responsible_id' => $this->reviewer->id,
        ]);
        
        // Link them
        $this->devStage->update(['linked_review_stage_id' => $this->reviewStage->id]);
    }

    /** @test */
    public function it_restores_original_assignee_when_task_is_sent_back_from_review()
    {
        // 1. Create task in Dev Stage assigned to Developer
        $task = Task::create([
            'title' => 'Feature X',
            'project_id' => $this->project->id,
            'project_stage_id' => $this->devStage->id,
            'assignee_id' => $this->developer->id,
            'user_status' => 'in-progress',
        ]);

        // 2. Move to Review (Simulate completion)
        $task->update(['user_status' => 'complete']);
        $task->refresh();

        // Verify it's in Review Stage
        $this->assertEquals($this->reviewStage->id, $task->project_stage_id);
        // Verify context is saved
        $this->assertEquals($this->devStage->id, $task->previous_stage_id);
        $this->assertEquals($this->developer->id, $task->original_assignee_id);
        
        // Note: In the current implementation (from previous turn), the assignee stays as the developer 
        // because "Keep the same assignee for review context" was in the comments.
        // BUT, usually a review stage has a responsible person (the reviewer).
        // If the reviewer takes over, they might reassign it to themselves.
        // Let's simulate the reviewer taking the task.
        
        $task->update(['assignee_id' => $this->reviewer->id]);
        
        // 3. Reviewer rejects the task (Moves it back to Dev Stage)
        // This usually involves changing stage back to previous_stage_id and status to pending/in-progress
        $task->update([
            'project_stage_id' => $this->devStage->id,
            'user_status' => 'pending', // Reset status
        ]);
        
        $task->refresh();

        // 4. Verify it's back in Dev Stage
        $this->assertEquals($this->devStage->id, $task->project_stage_id);

        // 5. Verify it is assigned back to the Developer (Original Assignee)
        // This is what we expect to fail currently
        $this->assertEquals($this->developer->id, $task->assignee_id, 'Task should be reassigned to the original developer');
    }
}
