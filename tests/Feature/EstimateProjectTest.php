<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Department;
use App\Models\Estimate;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstimateProjectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->department = Department::create(['name' => 'Internal']);
    }

    public function test_creating_estimate_auto_generates_suggested_project()
    {
        $client = Client::create([
            'company_name' => 'Acme Corp',
            'created_by'   => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/estimates', [
                'title'           => 'Website Redesign',
                'description'     => 'Full site overhaul',
                'client_id'       => $client->id,
                'estimated_hours' => 80,
                'amount'          => 5000.00,
                'status'          => 'draft',
            ]);

        $response->assertStatus(201);

        // Estimate is persisted
        $this->assertDatabaseHas('estimates', [
            'title'           => 'Website Redesign',
            'client_id'       => $client->id,
            'estimated_hours' => 80,
            'status'          => 'draft',
        ]);

        // Suggested project was auto-created
        $this->assertDatabaseHas('projects', [
            'name'            => 'Website Redesign',
            'client_id'       => $client->id,
            'estimated_hours' => 80,
            'status'          => 'suggested',
        ]);

        // Estimate is linked to the auto-created project
        $estimate = Estimate::where('title', 'Website Redesign')->first();
        $this->assertNotNull($estimate->project_id);

        // Project is linked back to the estimate
        $project = Project::find($estimate->project_id);
        $this->assertEquals($estimate->id, $project->estimate_id);

        // Response includes the project relationship
        $response->assertJsonPath('project.status', 'suggested');
        $response->assertJsonPath('project.client_id', $client->id);
    }

    public function test_suggested_project_is_linked_to_client()
    {
        $client = Client::create([
            'company_name' => 'Beta Client',
            'created_by'   => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/estimates', [
                'title'     => 'Mobile App',
                'client_id' => $client->id,
                'status'    => 'draft',
            ]);

        $response->assertStatus(201);

        $project = Project::where('name', 'Mobile App')->first();
        $this->assertNotNull($project);
        $this->assertEquals($client->id, $project->client_id);
        $this->assertEquals('suggested', $project->status);

        // Verify bidirectional link
        $estimate = Estimate::find($response->json('id'));
        $this->assertEquals($project->id, $estimate->project_id);
        $this->assertEquals($estimate->id, $project->estimate_id);
    }

    public function test_estimate_can_be_created_without_client()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/estimates', [
                'title'  => 'Internal Tooling',
                'status' => 'draft',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('projects', [
            'name'   => 'Internal Tooling',
            'status' => 'suggested',
        ]);
    }

    public function test_can_list_estimates()
    {
        $client = Client::create([
            'company_name' => 'List Client',
            'created_by'   => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->postJson('/api/estimates', [
                'title'     => 'Estimate One',
                'client_id' => $client->id,
                'status'    => 'draft',
            ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/estimates');

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonPath('0.title', 'Estimate One');
    }

    public function test_can_update_estimate_status()
    {
        $estimate = $this->actingAs($this->user)
            ->postJson('/api/estimates', [
                'title'  => 'Updatable Estimate',
                'status' => 'draft',
            ]);

        $estimateId = $estimate->json('id');

        $response = $this->actingAs($this->user)
            ->putJson("/api/estimates/{$estimateId}", [
                'status' => 'sent',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('estimates', [
            'id'     => $estimateId,
            'status' => 'sent',
        ]);
    }

    public function test_can_delete_estimate()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/estimates', [
                'title'  => 'To Delete',
                'status' => 'draft',
            ]);

        $estimateId = $response->json('id');

        $this->actingAs($this->user)
            ->deleteJson("/api/estimates/{$estimateId}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('estimates', ['id' => $estimateId]);
    }

    public function test_project_status_suggested_is_valid()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/projects', [
                'name'   => 'Suggested Project',
                'status' => 'suggested',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [
            'name'   => 'Suggested Project',
            'status' => 'suggested',
        ]);
    }
}
