<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Department;
use App\Models\Estimate;
use App\Models\EstimateItem;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstimateManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Department $department;
    protected Client $client;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $this->department = Department::create(['name' => 'Sales']);
        $this->user = User::factory()->create([
            'department_id' => $this->department->id,
            'role' => 'admin',
            'status' => 'working',
        ]);
        $this->client = Client::create([
            'company_name' => 'Acme Corp',
            'email' => 'acme@example.com',
            'created_by' => $this->user->id,
        ]);
        $this->project = Project::create([
            'name' => 'Acme Website',
            'department_id' => $this->department->id,
            'client_id' => $this->client->id,
            'created_by' => $this->user->id,
        ]);
    }

    public function test_can_create_estimate(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/estimates', [
            'title' => 'Q1 Proposal',
            'client_id' => $this->client->id,
            'project_id' => $this->project->id,
            'issue_date' => '2026-03-16',
            'valid_until' => '2026-04-16',
            'currency' => 'USD',
            'tax_rate' => 10,
            'notes' => 'Payment within 30 days',
            'items' => [
                ['description' => 'Design', 'quantity' => 10, 'unit_price' => 50],
                ['description' => 'Development', 'quantity' => 20, 'unit_price' => 100],
            ],
        ]);

        $response->assertStatus(201);
        $data = $response->json();
        $this->assertEquals('Q1 Proposal', $data['title']);
        $this->assertEquals('draft', $data['status']);
        $this->assertEquals(2500, $data['subtotal']);      // 10*50 + 20*100
        $this->assertEquals(250, $data['tax_amount']);     // 10% of 2500
        $this->assertEquals(2750, $data['total']);
        $this->assertCount(2, $data['items']);
    }

    public function test_estimate_defaults_to_draft_status(): void
    {
        $estimate = Estimate::create([
            'title' => 'Test Estimate',
            'created_by' => $this->user->id,
        ]);

        $this->assertEquals('draft', $estimate->status);
    }

    public function test_can_list_estimates(): void
    {
        Estimate::create(['title' => 'Estimate A', 'status' => 'draft', 'created_by' => $this->user->id]);
        Estimate::create(['title' => 'Estimate B', 'status' => 'sent', 'created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)->getJson('/api/estimates');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json());
    }

    public function test_can_filter_estimates_by_status(): void
    {
        Estimate::create(['title' => 'Estimate A', 'status' => 'draft', 'created_by' => $this->user->id]);
        Estimate::create(['title' => 'Estimate B', 'status' => 'sent', 'created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)->getJson('/api/estimates?status=draft');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json());
        $this->assertEquals('Estimate A', $response->json()[0]['title']);
    }

    public function test_can_filter_estimates_by_client(): void
    {
        Estimate::create(['title' => 'Estimate A', 'client_id' => $this->client->id, 'created_by' => $this->user->id]);
        Estimate::create(['title' => 'Estimate B', 'created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)->getJson("/api/estimates?client_id={$this->client->id}");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json());
        $this->assertEquals('Estimate A', $response->json()[0]['title']);
    }

    public function test_can_show_estimate(): void
    {
        $estimate = Estimate::create([
            'title' => 'Show Test',
            'client_id' => $this->client->id,
            'created_by' => $this->user->id,
        ]);
        $estimate->items()->create(['description' => 'Item 1', 'quantity' => 1, 'unit_price' => 100, 'total' => 100]);

        $response = $this->actingAs($this->user)->getJson("/api/estimates/{$estimate->id}");

        $response->assertStatus(200);
        $this->assertEquals('Show Test', $response->json('title'));
        $this->assertCount(1, $response->json('items'));
    }

    public function test_can_update_estimate(): void
    {
        $estimate = Estimate::create([
            'title' => 'Original Title',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/estimates/{$estimate->id}", [
            'title' => 'Updated Title',
            'tax_rate' => 15,
            'items' => [
                ['description' => 'Service', 'quantity' => 5, 'unit_price' => 200],
            ],
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Updated Title', $response->json('title'));
        $this->assertEquals(1000, $response->json('subtotal'));  // 5 * 200
        $this->assertEquals(150, $response->json('tax_amount')); // 15% of 1000
    }

    public function test_can_delete_estimate(): void
    {
        $estimate = Estimate::create(['title' => 'To Delete', 'created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)->deleteJson("/api/estimates/{$estimate->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('estimates', ['id' => $estimate->id]);
    }

    public function test_can_send_draft_estimate(): void
    {
        $estimate = Estimate::create([
            'title' => 'Draft Estimate',
            'status' => 'draft',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/estimates/{$estimate->id}/send");

        $response->assertStatus(200);
        $this->assertEquals('sent', $response->json('status'));
        $this->assertDatabaseHas('estimates', ['id' => $estimate->id, 'status' => 'sent']);
    }

    public function test_cannot_send_non_draft_estimate(): void
    {
        $estimate = Estimate::create([
            'title' => 'Sent Estimate',
            'status' => 'sent',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/estimates/{$estimate->id}/send");

        $response->assertStatus(422);
    }

    public function test_can_approve_sent_estimate(): void
    {
        $estimate = Estimate::create([
            'title' => 'Sent Estimate',
            'status' => 'sent',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/estimates/{$estimate->id}/approve");

        $response->assertStatus(200);
        $this->assertEquals('approved', $response->json('status'));
        $this->assertDatabaseHas('estimates', ['id' => $estimate->id, 'status' => 'approved']);
    }

    public function test_cannot_approve_draft_estimate(): void
    {
        $estimate = Estimate::create([
            'title' => 'Draft Estimate',
            'status' => 'draft',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)->postJson("/api/estimates/{$estimate->id}/approve");

        $response->assertStatus(422);
    }

    public function test_estimate_items_cascade_deleted_with_estimate(): void
    {
        $estimate = Estimate::create(['title' => 'With Items', 'created_by' => $this->user->id]);
        $item = $estimate->items()->create([
            'description' => 'Item 1',
            'quantity' => 1,
            'unit_price' => 100,
            'total' => 100,
        ]);

        $estimate->delete();

        $this->assertDatabaseMissing('estimate_items', ['id' => $item->id]);
    }

    public function test_estimate_linked_to_project(): void
    {
        $estimate = Estimate::create([
            'title' => 'Project Estimate',
            'project_id' => $this->project->id,
            'client_id' => $this->client->id,
            'created_by' => $this->user->id,
        ]);

        $this->assertDatabaseHas('estimates', [
            'id' => $estimate->id,
            'project_id' => $this->project->id,
            'client_id' => $this->client->id,
        ]);
        $this->assertEquals($this->project->id, $estimate->project->id);
        $this->assertEquals($this->client->id, $estimate->client->id);
    }

    public function test_create_estimate_requires_title(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/estimates', [
            'client_id' => $this->client->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title']);
    }
}
