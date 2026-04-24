<?php

namespace Tests\Feature;

use App\Events\ProjectStatusChanged;
use App\Listeners\CascadeProjectStatusToTasks;
use App\Models\Project;
use App\Models\Stage;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectStatusCascadeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->project = Project::factory()->create(['status' => 'active']);
    }

    private function createTask(array $attrs = []): Task
    {
        return Task::factory()->create(array_merge([
            'project_id'  => $this->project->id,
            'user_status' => 'in-progress',
            'is_locked'   => false,
        ], $attrs));
    }

    public function test_on_hold_locks_non_complete_tasks_and_saves_previous_status(): void
    {
        $task1 = $this->createTask(['user_status' => 'pending']);
        $task2 = $this->createTask(['user_status' => 'in-progress']);
        $task3 = $this->createTask(['user_status' => 'complete']);

        $listener = new CascadeProjectStatusToTasks();
        $listener->handle(new ProjectStatusChanged($this->project, 'active', 'on-hold'));

        $task1->refresh();
        $task2->refresh();
        $task3->refresh();

        $this->assertTrue($task1->is_locked);
        $this->assertEquals('pending', $task1->previous_status);

        $this->assertTrue($task2->is_locked);
        $this->assertEquals('in-progress', $task2->previous_status);

        // Complete tasks should NOT be locked
        $this->assertFalse($task3->is_locked);
        $this->assertNull($task3->previous_status);
    }

    public function test_cancelled_marks_all_non_complete_tasks_as_cancelled(): void
    {
        $task1 = $this->createTask(['user_status' => 'pending']);
        $task2 = $this->createTask(['user_status' => 'in-progress']);
        $task3 = $this->createTask(['user_status' => 'complete']);

        $listener = new CascadeProjectStatusToTasks();
        $listener->handle(new ProjectStatusChanged($this->project, 'active', 'cancelled'));

        $task1->refresh();
        $task2->refresh();
        $task3->refresh();

        $this->assertEquals('cancelled', $task1->user_status);
        $this->assertTrue($task1->is_locked);

        $this->assertEquals('cancelled', $task2->user_status);
        $this->assertTrue($task2->is_locked);

        // Complete tasks should remain complete
        $this->assertEquals('complete', $task3->user_status);
        $this->assertFalse($task3->is_locked);
    }

    public function test_active_restores_tasks_from_previous_status(): void
    {
        $task1 = $this->createTask([
            'user_status'     => 'cancelled',
            'previous_status' => 'pending',
            'is_locked'       => true,
        ]);
        $task2 = $this->createTask([
            'user_status'     => 'cancelled',
            'previous_status' => 'in-progress',
            'is_locked'       => true,
        ]);
        $task3 = $this->createTask([
            'user_status' => 'complete',
            'is_locked'   => false,
        ]);

        $listener = new CascadeProjectStatusToTasks();
        $listener->handle(new ProjectStatusChanged($this->project, 'on-hold', 'active'));

        $task1->refresh();
        $task2->refresh();
        $task3->refresh();

        $this->assertEquals('pending', $task1->user_status);
        $this->assertFalse($task1->is_locked);
        $this->assertNull($task1->previous_status);

        $this->assertEquals('in-progress', $task2->user_status);
        $this->assertFalse($task2->is_locked);
        $this->assertNull($task2->previous_status);

        // Non-locked tasks untouched
        $this->assertEquals('complete', $task3->user_status);
    }

    public function test_active_restores_to_pending_when_no_previous_status(): void
    {
        $task = $this->createTask([
            'user_status'     => 'cancelled',
            'previous_status' => null,
            'is_locked'       => true,
        ]);

        $listener = new CascadeProjectStatusToTasks();
        $listener->handle(new ProjectStatusChanged($this->project, 'on-hold', 'active'));

        $task->refresh();

        $this->assertEquals('pending', $task->user_status);
        $this->assertFalse($task->is_locked);
    }

    public function test_project_update_dispatches_status_changed_event(): void
    {
        $this->actingAs($this->user, 'sanctum');

        \Event::fake([\App\Events\ProjectStatusChanged::class]);

        $this->putJson("/api/projects/{$this->project->id}", [
            'status' => 'on-hold',
        ]);

        \Event::assertDispatched(\App\Events\ProjectStatusChanged::class, function ($event) {
            return $event->newStatus === 'on-hold' && $event->project->id === $this->project->id;
        });
    }
}
