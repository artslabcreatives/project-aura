<?php

namespace Tests\Unit;

use App\Models\Client;
use App\Models\Estimate;
use App\Models\User;
use App\Services\InvoicePdfService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class InvoicePdfServiceTest extends TestCase
{
    use DatabaseTransactions;

    private InvoicePdfService $pdfService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pdfService = app(InvoicePdfService::class);
    }

    public function test_build_data_from_local_estimate_includes_reference_and_keeps_additional_info_empty(): void
    {
        $user = User::factory()->create();
        $client = Client::create([
            'company_name' => 'Acme Corp',
            'email' => 'acme@example.com',
            'created_by' => $user->id,
        ]);

        $estimate = Estimate::create([
            'title' => 'Test Estimate Reference',
            'created_by' => $user->id,
            'client_id' => $client->id,
            'reference' => 'PO 4562379790',
            'subtotal' => 1000.0,
            'tax_amount' => 180.0,
            'total' => 1180.0,
            'tax_rate' => 18.0,
        ]);

        $data = $this->pdfService->buildDataFromLocalEstimate($estimate);

        $this->assertSame('PO 4562379790', $data['reference']);
        $this->assertSame('', $data['additional_info']);
    }

    public function test_build_data_from_xero_invoice_includes_reference_and_keeps_additional_info_empty(): void
    {
        $xeroInvoice = [
            'InvoiceNumber' => 'INV-0099',
            'DateString' => '2026-06-16',
            'Reference' => 'PO 4562379790',
            'SubTotal' => 1000.00,
            'TotalTax' => 180.00,
            'Total' => 1180.00,
            'Contact' => [
                'Name' => 'Xero Client Ltd',
                'TaxNumber' => '12345',
            ],
            'LineItems' => [],
        ];

        $data = $this->pdfService->buildDataFromXeroInvoice($xeroInvoice);

        $this->assertSame('PO 4562379790', $data['reference']);
        $this->assertSame('', $data['additional_info']);
    }

    public function test_build_data_with_overrides_respects_custom_reference(): void
    {
        $xeroInvoice = [
            'InvoiceNumber' => 'INV-0099',
            'DateString' => '2026-06-16',
            'Reference' => 'PO 4562379790',
            'SubTotal' => 1000.00,
            'TotalTax' => 180.00,
            'Total' => 1180.00,
            'Contact' => [
                'Name' => 'Xero Client Ltd',
            ],
            'LineItems' => [],
        ];

        $overrides = [
            'reference' => 'OVERRIDDEN_PO',
            'additional_info' => 'Custom info',
        ];

        $data = $this->pdfService->buildDataFromXeroInvoice($xeroInvoice, $overrides);

        $this->assertSame('OVERRIDDEN_PO', $data['reference']);
        $this->assertSame('Custom info', $data['additional_info']);
    }
}
