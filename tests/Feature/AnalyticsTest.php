<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Stage;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Project $project;
    protected Stage $stage;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user
        $this->user = User::factory()->create();

        // Create test project
        $this->project = Project::factory()->create();

        // Create test stage
        $this->stage = Stage::factory()->create([
            'project_id' => $this->project->id,
            'order' => 1,
        ]);
    }

    /** @test */
    public function it_can_get_completion_analytics_for_week()
    {
        // Create completed tasks within the current week
        Task::factory()->count(5)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'assignee_id' => $this->user->id,
            'user_status' => 'complete',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/completion?period=week');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'period',
                'start_date',
                'end_date',
                'total_completed',
                'breakdown',
                'by_project',
                'by_stage',
                'by_user',
                'by_priority',
            ])
            ->assertJson([
                'period' => 'week',
                'total_completed' => 5,
            ]);
    }

    /** @test */
    public function it_can_get_completion_analytics_for_month()
    {
        // Create completed tasks
        Task::factory()->count(10)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'assignee_id' => $this->user->id,
            'user_status' => 'complete',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/completion?period=month');

        $response->assertStatus(200)
            ->assertJson([
                'period' => 'month',
                'total_completed' => 10,
            ]);
    }

    /** @test */
    public function it_can_filter_analytics_by_project()
    {
        $project2 = Project::factory()->create();
        $stage2 = Stage::factory()->create(['project_id' => $project2->id]);

        // Create tasks for project 1
        Task::factory()->count(3)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now(),
        ]);

        // Create tasks for project 2
        Task::factory()->count(5)->create([
            'project_id' => $project2->id,
            'project_stage_id' => $stage2->id,
            'user_status' => 'complete',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/analytics/completion?period=month&project_id={$this->project->id}");

        $response->assertStatus(200)
            ->assertJson([
                'total_completed' => 3,
            ]);
    }

    /** @test */
    public function it_can_get_comparison_analytics()
    {
        // Create tasks in current month
        Task::factory()->count(10)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now(),
        ]);

        // Create tasks in previous month
        Task::factory()->count(5)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now()->subMonth(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/comparison?period=month');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_period',
                'previous_period',
                'comparison' => [
                    'absolute_change',
                    'percentage_change',
                    'trend',
                ],
            ])
            ->assertJson([
                'comparison' => [
                    'absolute_change' => 5,
                    'trend' => 'up',
                ],
            ]);
    }

    /** @test */
    public function it_can_get_completion_rate_analytics()
    {
        // Create 10 tasks, 7 completed
        Task::factory()->count(7)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now(),
            'created_at' => now()->subDays(5),
        ]);

        Task::factory()->count(3)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'pending',
            'created_at' => now()->subDays(5),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/completion-rate?period=month');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'period',
                'total_tasks',
                'completed_tasks',
                'completion_rate',
                'pending_tasks',
            ])
            ->assertJson([
                'total_tasks' => 10,
                'completed_tasks' => 7,
                'completion_rate' => 70.0,
                'pending_tasks' => 3,
            ]);
    }

    /** @test */
    public function it_can_get_average_completion_time()
    {
        // Create tasks with known completion times
        Task::factory()->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'created_at' => now()->subHours(24),
            'completed_at' => now(),
        ]);

        Task::factory()->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'created_at' => now()->subHours(48),
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/completion-time?period=month');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'period',
                'average_hours',
                'average_days',
                'median_hours',
                'median_days',
                'min_hours',
                'max_hours',
                'total_tasks',
            ])
            ->assertJson([
                'total_tasks' => 2,
            ]);
    }

    /** @test */
    public function it_can_get_dashboard_analytics()
    {
        // Create some completed tasks
        Task::factory()->count(5)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now(),
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/dashboard?period=month');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'completion_analytics',
                'completion_rate',
                'completion_time',
                'comparison',
            ]);
    }

    /** @test */
    public function it_requires_authentication_for_analytics()
    {
        $response = $this->getJson('/api/analytics/completion?period=month');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_validates_period_parameter()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/completion?period=invalid');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['period']);
    }

    /** @test */
    public function it_can_filter_by_priority()
    {
        Task::factory()->count(3)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now(),
            'priority' => 'high',
        ]);

        Task::factory()->count(5)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now(),
            'priority' => 'low',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/analytics/completion?period=month&priority=high');

        $response->assertStatus(200)
            ->assertJson([
                'total_completed' => 3,
            ]);
    }

    /** @test */
    public function it_can_use_custom_date_ranges()
    {
        $startDate = now()->subDays(10)->format('Y-m-d');
        $endDate = now()->format('Y-m-d');

        Task::factory()->count(5)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now()->subDays(5),
        ]);

        Task::factory()->count(3)->create([
            'project_id' => $this->project->id,
            'project_stage_id' => $this->stage->id,
            'user_status' => 'complete',
            'completed_at' => now()->subDays(20), // Outside range
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/analytics/completion?period=month&start_date={$startDate}&end_date={$endDate}");

        $response->assertStatus(200)
            ->assertJson([
                'total_completed' => 5,
            ]);
    }
}
