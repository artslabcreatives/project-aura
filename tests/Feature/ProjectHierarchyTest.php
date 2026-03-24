<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectHierarchyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->department = Department::create(['name' => 'Internal']);
    }

    public function test_can_create_project_with_client_and_estimate()
    {
        $client = Client::create([
            'company_name' => 'Test Client',
            'created_by' => $this->user->id,
        ]);

        $projectData = [
            'name' => 'Hierarchy Project',
            'description' => 'Testing hierarchy',
            'department_id' => $this->department->id,
            'client_id' => $client->id,
            'estimated_hours' => 100,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/projects', $projectData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [
            'name' => 'Hierarchy Project',
            'client_id' => $client->id,
            'estimated_hours' => 100,
            'status' => 'active',
        ]);

        $response->assertJsonPath('client.company_name', 'Test Client');
    }

    public function test_can_update_project_hierarchy_fields()
    {
        $project = Project::create([
            'name' => 'Old Project',
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
        ]);

        $client = Client::create([
            'company_name' => 'New Client',
            'created_by' => $this->user->id,
        ]);

        $updateData = [
            'client_id' => $client->id,
            'estimated_hours' => 150,
            'status' => 'on-hold',
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/projects/{$project->id}", $updateData);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'client_id' => $client->id,
            'estimated_hours' => 150,
            'status' => 'on-hold',
        ]);
    }

    public function test_client_loads_with_projects()
    {
        $client = Client::create([
            'company_name' => 'Client with Projects',
            'created_by' => $this->user->id,
        ]);

        Project::create([
            'name' => 'Project 1',
            'client_id' => $client->id,
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
        ]);

        Project::create([
            'name' => 'Project 2',
            'client_id' => $client->id,
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/clients/{$client->id}");

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'projects');
        $response->assertJsonPath('projects.0.name', 'Project 1');
    }
}
