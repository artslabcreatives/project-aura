<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceModuleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->user, 'sanctum');
    }

    public function test_can_create_manual_invoice(): void
    {
        $response = $this->postJson('/api/invoices', [
            'source'         => 'manual',
            'invoice_number' => 'INV-001',
            'status'         => 'pending',
            'amount'         => 1500.00,
            'currency'       => 'USD',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['source' => 'manual', 'invoice_number' => 'INV-001']);

        $this->assertDatabaseHas('invoices', ['invoice_number' => 'INV-001', 'source' => 'manual']);
    }

    public function test_can_create_xero_invoice(): void
    {
        $response = $this->postJson('/api/invoices', [
            'source'          => 'xero',
            'xero_invoice_id' => 'XERO-123',
            'xero_status'     => 'AUTHORISED',
            'amount'          => 3000.00,
            'currency'        => 'AUD',
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['source' => 'xero', 'xero_invoice_id' => 'XERO-123']);
    }

    public function test_can_filter_invoices_by_source(): void
    {
        Invoice::factory()->create(['source' => 'manual']);
        Invoice::factory()->create(['source' => 'xero']);

        $response = $this->getJson('/api/invoices?source=manual');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $invoice) {
            $this->assertEquals('manual', $invoice['source']);
        }
    }

    public function test_can_filter_invoices_by_project_id(): void
    {
        $project = Project::factory()->create();
        Invoice::factory()->create(['project_id' => $project->id]);
        Invoice::factory()->create(['project_id' => null]);

        $response = $this->getJson("/api/invoices?project_id={$project->id}");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $invoice) {
            $this->assertEquals($project->id, $invoice['project_id']);
        }
    }

    public function test_can_filter_invoices_by_status(): void
    {
        Invoice::factory()->create(['status' => 'paid']);
        Invoice::factory()->create(['status' => 'pending']);

        $response = $this->getJson('/api/invoices?status=paid');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $invoice) {
            $this->assertEquals('paid', $invoice['status']);
        }
    }

    public function test_can_filter_invoices_by_client_id(): void
    {
        $client = Client::factory()->create();
        Invoice::factory()->create(['client_id' => $client->id]);
        Invoice::factory()->create(['client_id' => null]);

        $response = $this->getJson("/api/invoices?client_id={$client->id}");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $invoice) {
            $this->assertEquals($client->id, $invoice['client_id']);
        }
    }

    public function test_can_show_invoice(): void
    {
        $invoice = Invoice::factory()->create();

        $response = $this->getJson("/api/invoices/{$invoice->id}");

        $response->assertStatus(200)->assertJsonFragment(['id' => $invoice->id]);
    }

    public function test_can_update_invoice(): void
    {
        $invoice = Invoice::factory()->create(['status' => 'pending']);

        $response = $this->putJson("/api/invoices/{$invoice->id}", ['status' => 'paid']);

        $response->assertStatus(200)->assertJsonFragment(['status' => 'paid']);
        $this->assertDatabaseHas('invoices', ['id' => $invoice->id, 'status' => 'paid']);
    }

    public function test_can_delete_invoice(): void
    {
        $invoice = Invoice::factory()->create();

        $response = $this->deleteJson("/api/invoices/{$invoice->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('invoices', ['id' => $invoice->id]);
    }

    public function test_source_validation(): void
    {
        $response = $this->postJson('/api/invoices', [
            'source' => 'invalid-source',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['source']);
    }
}
