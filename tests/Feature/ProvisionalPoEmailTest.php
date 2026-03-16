<?php

namespace Tests\Feature;

use App\Mail\ProvisionalPoMailable;
use App\Models\Client;
use App\Models\ClientContact;
use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProvisionalPoEmailTest extends TestCase
{
    use RefreshDatabase;

    protected Department $department;
    protected User $adminUser;
    protected Client $client;

    protected function setUp(): void
    {
        parent::setUp();

        $this->department = Department::create(['name' => 'Engineering']);

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'department_id' => $this->department->id,
        ]);

        $this->client = Client::create([
            'company_name' => 'Acme Corp',
            'email' => 'contact@acme.com',
            'created_by' => $this->adminUser->id,
        ]);
    }

    public function test_provisional_po_email_sent_to_client_on_project_creation(): void
    {
        Mail::fake();
        Storage::fake('s3');

        $this->actingAs($this->adminUser, 'sanctum');

        $file = UploadedFile::fake()->create('po_document.pdf', 500, 'application/pdf');

        $response = $this->postJson('/api/projects', [
            'name' => 'New PO Project',
            'client_id' => $this->client->id,
            'po_number' => 'PO-2026-001',
            'po_document' => $file,
        ]);

        $response->assertStatus(201);

        $createdProjectId = $response->json('id');

        Mail::assertQueued(ProvisionalPoMailable::class, function (ProvisionalPoMailable $mail) use ($createdProjectId) {
            return $mail->hasTo('contact@acme.com') && $mail->project->id === $createdProjectId;
        });
    }

    public function test_provisional_po_email_uses_primary_contact_email(): void
    {
        Mail::fake();
        Storage::fake('s3');

        $this->actingAs($this->adminUser, 'sanctum');

        ClientContact::create([
            'client_id' => $this->client->id,
            'name' => 'Primary Contact',
            'email' => 'primary@acme.com',
            'is_primary' => true,
        ]);

        ClientContact::create([
            'client_id' => $this->client->id,
            'name' => 'Other Contact',
            'email' => 'other@acme.com',
            'is_primary' => false,
        ]);

        $file = UploadedFile::fake()->create('po_document.pdf', 500, 'application/pdf');

        $response = $this->postJson('/api/projects', [
            'name' => 'PO Project With Contacts',
            'client_id' => $this->client->id,
            'po_number' => 'PO-2026-002',
            'po_document' => $file,
        ]);

        $response->assertStatus(201);

        Mail::assertQueued(ProvisionalPoMailable::class, function (ProvisionalPoMailable $mail) {
            return $mail->hasTo('primary@acme.com') && ! $mail->hasTo('contact@acme.com');
        });
    }

    public function test_provisional_po_email_not_sent_when_no_client(): void
    {
        Mail::fake();
        Storage::fake('s3');

        $this->actingAs($this->adminUser, 'sanctum');

        $file = UploadedFile::fake()->create('po_document.pdf', 500, 'application/pdf');

        $response = $this->postJson('/api/projects', [
            'name' => 'Project Without Client',
            'po_number' => 'PO-2026-003',
            'po_document' => $file,
        ]);

        $response->assertStatus(201);

        Mail::assertNothingQueued();
    }

    public function test_provisional_po_email_not_sent_when_no_po_document(): void
    {
        Mail::fake();
        Storage::fake('s3');

        $this->actingAs($this->adminUser, 'sanctum');

        $response = $this->postJson('/api/projects', [
            'name' => 'Project Without PO Document',
            'client_id' => $this->client->id,
            'po_number' => 'PO-2026-004',
        ]);

        $response->assertStatus(201);

        Mail::assertNothingQueued();
    }

    public function test_provisional_po_email_sent_when_po_document_added_via_update(): void
    {
        Mail::fake();
        Storage::fake('s3');

        $this->actingAs($this->adminUser, 'sanctum');

        $project = Project::create([
            'name' => 'Existing Project',
            'client_id' => $this->client->id,
            'created_by' => $this->adminUser->id,
        ]);

        $file = UploadedFile::fake()->create('po_document.pdf', 500, 'application/pdf');

        $response = $this->putJson("/api/projects/{$project->id}", [
            'name' => 'Existing Project',
            'po_number' => 'PO-2026-005',
            'po_document' => $file,
        ]);

        $response->assertStatus(200);

        Mail::assertQueued(ProvisionalPoMailable::class, function (ProvisionalPoMailable $mail) use ($project) {
            return $mail->hasTo('contact@acme.com') && $mail->project->id === $project->id;
        });
    }

    public function test_provisional_po_email_not_sent_when_po_document_already_existed(): void
    {
        Mail::fake();
        Storage::fake('s3');

        $this->actingAs($this->adminUser, 'sanctum');

        // Project already has a PO document
        $project = Project::create([
            'name' => 'Project With Existing PO',
            'client_id' => $this->client->id,
            'po_document' => 'purchase-orders/existing.pdf',
            'created_by' => $this->adminUser->id,
        ]);

        $file = UploadedFile::fake()->create('new_po_document.pdf', 500, 'application/pdf');

        $response = $this->putJson("/api/projects/{$project->id}", [
            'name' => 'Project With Existing PO',
            'po_document' => $file,
        ]);

        $response->assertStatus(200);

        // Email should NOT be sent again (PO was already raised)
        Mail::assertNothingQueued();
    }

    public function test_provisional_po_mailable_ccs_account_manager(): void
    {
        $project = Project::create([
            'name' => 'Project With AM',
            'client_id' => $this->client->id,
            'created_by' => $this->adminUser->id,
        ]);

        // Build a User model in-memory with account-manager role without persisting
        // (SQLite test DB only allows the original enum values from the base migration)
        $accountManager = new User([
            'name' => 'Account Manager',
            'email' => 'am@company.com',
            'role' => 'account-manager',
        ]);

        // Inject the collaborators collection directly so getAccountManagerAddresses()
        // filters it in PHP without hitting the database
        $project->setRelation('collaborators', collect([$accountManager]));
        $project->load('client.contacts');

        $mailable = new ProvisionalPoMailable($project);
        $mailable->assertHasCc('am@company.com');
    }
}
