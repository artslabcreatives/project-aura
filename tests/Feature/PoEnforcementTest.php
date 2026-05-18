<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Department;
use App\Models\Project;
use App\Models\Stage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PoEnforcementTest extends TestCase
{
    use RefreshDatabase;

    protected Department $department;
    protected User $adminUser;
    protected User $regularUser;
    protected Client $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->department = Department::create(['name' => 'Engineering']);

        $this->adminUser = User::factory()->create([
            'role'          => 'admin',
            'department_id' => $this->department->id,
        ]);

        $this->regularUser = User::factory()->create([
            'role'          => 'user',
            'department_id' => $this->department->id,
        ]);

        $this->client = Client::create([
            'company_name' => 'Blocked Client',
            'created_by'   => $this->adminUser->id,
        ]);
    }

    // -----------------------------------------------------------------------
    // PO Enforcement – Task 5
    // -----------------------------------------------------------------------

    public function test_task_creation_blocked_when_project_has_no_po(): void
    {
        $project = Project::create([
            'name'            => 'PO Required Project',
            'department_id'   => $this->department->id,
            'created_by'      => $this->adminUser->id,
            'is_locked_by_po' => true, // no PO yet
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/tasks', [
                'title'      => 'Should Be Blocked',
                'project_id' => $project->id,
            ]);

        $response->assertStatus(403);
        $response->assertJsonPath('project_status', 'requires_po');
    }

    public function test_task_creation_allowed_when_project_has_po(): void
    {
        $project = Project::create([
            'name'            => 'PO Received Project',
            'department_id'   => $this->department->id,
            'created_by'      => $this->adminUser->id,
            'is_locked_by_po' => false, // PO received
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/tasks', [
                'title'      => 'Should Succeed',
                'project_id' => $project->id,
            ]);

        $response->assertStatus(201);
    }

    public function test_task_creation_allowed_during_active_grace_period(): void
    {
        $project = Project::create([
            'name'                    => 'Grace Period Project',
            'department_id'           => $this->department->id,
            'created_by'              => $this->adminUser->id,
            'is_locked_by_po'         => true, // No PO
            'grace_period_days'       => 7,
            'grace_period_started_at' => now()->subDay(), // started yesterday, still active
            'grace_period_approved_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/tasks', [
                'title'      => 'Task In Grace Period',
                'project_id' => $project->id,
            ]);

        $response->assertStatus(201);
    }

    public function test_task_creation_blocked_when_grace_period_has_expired(): void
    {
        $project = Project::create([
            'name'                    => 'Expired Grace Period Project',
            'department_id'           => $this->department->id,
            'created_by'              => $this->adminUser->id,
            'is_locked_by_po'         => true,
            'grace_period_days'       => 3,
            'grace_period_started_at' => now()->subDays(5), // started 5 days ago, 3-day grace = expired
            'grace_period_approved_by' => $this->adminUser->id,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/tasks', [
                'title'      => 'Should Be Blocked Again',
                'project_id' => $project->id,
            ]);

        $response->assertStatus(403);
        $response->assertJsonPath('project_status', 'requires_po');
    }

    // -----------------------------------------------------------------------
    // Grace Period – Task 6
    // -----------------------------------------------------------------------

    public function test_admin_can_grant_grace_period(): void
    {
        $project = Project::create([
            'name'            => 'No PO Project',
            'department_id'   => $this->department->id,
            'created_by'      => $this->adminUser->id,
            'is_locked_by_po' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/projects/{$project->id}/grace-period", [
                'grace_period_days' => 14,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('projects', [
            'id'                => $project->id,
            'grace_period_days' => 14,
            'grace_period_approved_by' => $this->adminUser->id,
        ]);

        $this->assertNotNull($project->fresh()->grace_period_started_at);
    }

    public function test_regular_user_cannot_grant_grace_period(): void
    {
        $project = Project::create([
            'name'            => 'No PO Project',
            'department_id'   => $this->department->id,
            'created_by'      => $this->adminUser->id,
            'is_locked_by_po' => true,
        ]);

        $response = $this->actingAs($this->regularUser)
            ->postJson("/api/projects/{$project->id}/grace-period", [
                'grace_period_days' => 14,
            ]);

        $response->assertStatus(403);
    }

    public function test_grace_period_active_check_works_correctly(): void
    {
        $project = new Project([
            'is_locked_by_po'         => true,
            'grace_period_days'       => 7,
            'grace_period_started_at' => now()->subDays(3),
        ]);

        $this->assertTrue($project->isGracePeriodActive());
    }

    public function test_grace_period_expired_check_works_correctly(): void
    {
        $project = new Project([
            'is_locked_by_po'         => true,
            'grace_period_days'       => 3,
            'grace_period_started_at' => now()->subDays(5),
        ]);

        $this->assertFalse($project->isGracePeriodActive());
    }

    // -----------------------------------------------------------------------
    // Manual Project Blocking – Task 9
    // -----------------------------------------------------------------------

    public function test_admin_can_manually_block_a_project(): void
    {
        $project = Project::create([
            'name'          => 'Active Project',
            'department_id' => $this->department->id,
            'created_by'    => $this->adminUser->id,
            'status'        => 'active',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/projects/{$project->id}/block");

        $response->assertStatus(200);

        $this->assertDatabaseHas('projects', [
            'id'                 => $project->id,
            'is_manually_blocked' => true,
            'status'              => 'blocked',
        ]);
    }

    public function test_regular_user_cannot_manually_block_a_project(): void
    {
        $project = Project::create([
            'name'          => 'Active Project',
            'department_id' => $this->department->id,
            'created_by'    => $this->adminUser->id,
            'status'        => 'active',
        ]);

        $response = $this->actingAs($this->regularUser)
            ->postJson("/api/projects/{$project->id}/block");

        $response->assertStatus(403);
    }

    public function test_task_creation_blocked_when_project_is_manually_blocked(): void
    {
        $project = Project::create([
            'name'                => 'Manually Blocked Project',
            'department_id'       => $this->department->id,
            'created_by'          => $this->adminUser->id,
            'is_locked_by_po'     => false, // Has a PO
            'is_manually_blocked' => true,
            'status'              => 'blocked',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/tasks', [
                'title'      => 'Should Be Blocked',
                'project_id' => $project->id,
            ]);

        $response->assertStatus(403);
        $response->assertJsonPath('project_status', 'blocked');
    }

    public function test_admin_can_unblock_a_project(): void
    {
        $project = Project::create([
            'name'                => 'Blocked Project',
            'department_id'       => $this->department->id,
            'created_by'          => $this->adminUser->id,
            'is_manually_blocked' => true,
            'status'              => 'blocked',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/projects/{$project->id}/unblock");

        $response->assertStatus(200);

        $this->assertDatabaseHas('projects', [
            'id'                  => $project->id,
            'is_manually_blocked' => false,
            'status'              => 'active',
        ]);
    }

    public function test_unblock_preserves_status_when_not_blocked(): void
    {
        $project = Project::create([
            'name'                => 'On-Hold Project',
            'department_id'       => $this->department->id,
            'created_by'          => $this->adminUser->id,
            'is_manually_blocked' => true,
            'status'              => 'on-hold',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/projects/{$project->id}/unblock");

        $response->assertStatus(200);

        // Status should remain 'on-hold', not be forced to 'active'
        $this->assertDatabaseHas('projects', [
            'id'                  => $project->id,
            'is_manually_blocked' => false,
            'status'              => 'on-hold',
        ]);
    }
}
