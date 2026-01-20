<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test data
        $this->department = Department::create(['name' => 'Engineering']);
        $this->user = User::factory()->create([
            'department_id' => $this->department->id,
            'status' => 'working',
            'capacity_hours_per_day' => 6,
        ]);
    }

    public function test_can_create_project_with_new_fields(): void
    {
        $projectData = [
            'name' => 'Test Project',
            'description' => 'Test Description',
            'department_id' => $this->department->id,
            'deadline' => now()->addDays(30)->format('Y-m-d'),
            'created_by' => $this->user->id,
        ];

        $project = Project::create($projectData);

        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
        ]);

        $this->assertEquals($this->user->id, $project->created_by);
        $this->assertNotNull($project->deadline);
    }

    public function test_can_update_project(): void
    {
        $project = Project::create([
            'name' => 'Original Project',
            'department_id' => $this->department->id,
        ]);

        $project->update([
            'name' => 'Updated Project',
            'deadline' => now()->addDays(15)->format('Y-m-d'),
        ]);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Project',
        ]);
    }

    public function test_project_has_creator_relationship(): void
    {
        $project = Project::create([
            'name' => 'Test Project',
            'created_by' => $this->user->id,
        ]);

        $this->assertInstanceOf(User::class, $project->creator);
        $this->assertEquals($this->user->id, $project->creator->id);
    }
}
