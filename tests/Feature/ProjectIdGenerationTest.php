<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectIdGenerationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectIdGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected ProjectIdGenerationService $service;
    private \ReflectionMethod $getClientCodeMethod;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(ProjectIdGenerationService::class);
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->department = Department::create(['name' => 'Engineering']);

        $reflection = new \ReflectionClass($this->service);
        $this->getClientCodeMethod = $reflection->getMethod('getClientCode');
        $this->getClientCodeMethod->setAccessible(true);
    }

    // -----------------------------------------------------------------------
    // ProjectIdGenerationService unit-level tests
    // -----------------------------------------------------------------------

    public function test_generates_prj_prefix_when_no_client(): void
    {
        $project = Project::create([
            'name' => 'No Client Project',
            'department_id' => $this->department->id,
            'created_by' => $this->user->id,
        ]);

        // project_code is auto-assigned by the observer; verify format
        $project->refresh();
        $this->assertMatchesRegularExpression('/^PRJ-\d{3,}$/', $project->project_code);
    }

    public function test_generates_client_initials_prefix_for_multi_word_company(): void
    {
        $client = Client::create([
            'company_name' => 'Acme Corporation',
            'created_by' => $this->user->id,
        ]);

        $project = Project::create([
            'name' => 'Client Project',
            'department_id' => $this->department->id,
            'client_id' => $client->id,
            'created_by' => $this->user->id,
        ]);

        $project->refresh();
        // "Acme Corporation" → initials "AC"
        $this->assertStringStartsWith('AC-', $project->project_code);
    }

    public function test_generates_client_prefix_for_single_word_company(): void
    {
        $client = Client::create([
            'company_name' => 'GlobalTech',
            'created_by' => $this->user->id,
        ]);

        $project = Project::create([
            'name' => 'GlobalTech Project',
            'department_id' => $this->department->id,
            'client_id' => $client->id,
            'created_by' => $this->user->id,
        ]);

        $project->refresh();
        // "GlobalTech" → first 4 chars "GLOB"
        $this->assertStringStartsWith('GLOB-', $project->project_code);
    }

    public function test_sequential_numbering_increments_per_prefix(): void
    {
        $client = Client::create([
            'company_name' => 'Test Inc',
            'created_by' => $this->user->id,
        ]);

        $project1 = Project::create([
            'name' => 'First Project',
            'department_id' => $this->department->id,
            'client_id' => $client->id,
            'created_by' => $this->user->id,
        ]);

        $project2 = Project::create([
            'name' => 'Second Project',
            'department_id' => $this->department->id,
            'client_id' => $client->id,
            'created_by' => $this->user->id,
        ]);

        $project1->refresh();
        $project2->refresh();

        // Both should start with "TI-" (initials of "Test Inc")
        $this->assertStringStartsWith('TI-', $project1->project_code);
        $this->assertStringStartsWith('TI-', $project2->project_code);

        // Numbers should be different and consecutive
        $num1 = (int) substr(strrchr($project1->project_code, '-'), 1);
        $num2 = (int) substr(strrchr($project2->project_code, '-'), 1);
        $this->assertEquals(1, abs($num2 - $num1));
    }

    public function test_different_clients_have_independent_sequential_series(): void
    {
        $clientA = Client::create([
            'company_name' => 'Alpha Beta',
            'created_by' => $this->user->id,
        ]);

        $clientB = Client::create([
            'company_name' => 'Zeta Corp',
            'created_by' => $this->user->id,
        ]);

        $projectA = Project::create([
            'name' => 'Alpha Project',
            'department_id' => $this->department->id,
            'client_id' => $clientA->id,
            'created_by' => $this->user->id,
        ]);

        $projectB = Project::create([
            'name' => 'Zeta Project',
            'department_id' => $this->department->id,
            'client_id' => $clientB->id,
            'created_by' => $this->user->id,
        ]);

        $projectA->refresh();
        $projectB->refresh();

        // Each client prefix series starts at 001
        $this->assertStringEndsWith('-001', $projectA->project_code);
        $this->assertStringEndsWith('-001', $projectB->project_code);
    }

    public function test_project_codes_are_unique(): void
    {
        $client = Client::create([
            'company_name' => 'Unique Corp',
            'created_by' => $this->user->id,
        ]);

        $codes = [];
        for ($i = 0; $i < 5; $i++) {
            $project = Project::create([
                'name' => "Project {$i}",
                'department_id' => $this->department->id,
                'client_id' => $client->id,
                'created_by' => $this->user->id,
            ]);
            $project->refresh();
            $codes[] = $project->project_code;
        }

        // All codes must be distinct
        $this->assertCount(5, array_unique($codes));
    }

    // -----------------------------------------------------------------------
    // API-level tests
    // -----------------------------------------------------------------------

    public function test_project_code_is_returned_in_api_response(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/projects', [
                'name' => 'API Code Test',
                'department_id' => $this->department->id,
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('project_code', fn ($code) => str_starts_with($code, 'PRJ-'));
    }

    public function test_project_code_uses_client_prefix_via_api(): void
    {
        $client = Client::create([
            'company_name' => 'Via API Client',
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/projects', [
                'name' => 'API Client Project',
                'department_id' => $this->department->id,
                'client_id' => $client->id,
            ]);

        $response->assertStatus(201);
        // "Via API Client" → initials "VAC"
        $response->assertJsonPath('project_code', fn ($code) => str_starts_with($code, 'VAC-'));
    }

    // -----------------------------------------------------------------------
    // Service unit tests (prefix derivation)
    // -----------------------------------------------------------------------

    public function test_service_get_client_code_for_multi_word_name(): void
    {
        $client = new Client(['company_name' => 'Tech Corp Innovations']);
        $this->assertEquals('TCI', $this->getClientCodeMethod->invoke($this->service, $client));
    }

    public function test_service_get_client_code_limits_to_five_chars(): void
    {
        $client = new Client(['company_name' => 'Alpha Beta Gamma Delta Epsilon']);
        $code = $this->getClientCodeMethod->invoke($this->service, $client);
        $this->assertLessThanOrEqual(5, strlen($code));
    }

    public function test_service_get_client_code_for_single_word_name(): void
    {
        $client = new Client(['company_name' => 'Microsoft']);
        $this->assertEquals('MICR', $this->getClientCodeMethod->invoke($this->service, $client));
    }
}
