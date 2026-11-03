<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class InvoiceController extends Controller
{
    #[OA\Get(
        path: "/invoices",
        summary: "List invoices",
        description: "Returns paginated invoices with optional filters",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        parameters: [
            new OA\Parameter(name: "source", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["manual", "xero"])),
            new OA\Parameter(name: "project_id", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "client_id", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "status", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "per_page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 20)),
        ],
        responses: [
            new OA\Response(response: 200, description: "Paginated invoice list"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    #[OA\Get(
        path: "/invoices/stats",
        summary: "Get invoice statistics",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        responses: [new OA\Response(response: 200, description: "Invoice statistics")]
    )]
    public function stats(): JsonResponse
    {
        $paid = Invoice::where('status', 'paid')->count();
        $authorised = Invoice::where('status', 'authorised')->count();
        $draft = Invoice::where('status', 'draft')->count();
        $voided = Invoice::whereIn('status', ['voided', 'deleted'])->count();
        $total = Invoice::count();
        $totalAmount = (float) Invoice::whereNotIn('status', ['voided', 'deleted'])->sum('amount');

        return response()->json([
            'paid' => $paid,
            'authorised' => $authorised,
            'draft' => $draft,
            'voided' => $voided,
            'total' => $total,
            'total_amount' => $totalAmount,
        ]);
    }

    #[OA\Get(
        path: "/invoices",
        summary: "List invoices",
        description: "Returns paginated invoices with optional filters",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        parameters: [
            new OA\Parameter(name: "source", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["manual", "xero"])),
            new OA\Parameter(name: "project_id", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "client_id", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "status", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "search", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "per_page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 20)),
        ],
        responses: [
            new OA\Response(response: 200, description: "Paginated invoice list"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['project:id,name', 'client:id,company_name']);

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('status')) {
            if ($request->status === 'voided') {
                $query->whereIn('status', ['voided', 'deleted']);
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('currency', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($cq) use ($search) {
                      $cq->where('company_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('project', function ($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->per_page ? (int)$request->per_page : 15;
        $invoices = $query->orderByRaw('COALESCE(issued_at, created_at) DESC')->paginate($perPage);

        return response()->json($invoices);
    }

    #[OA\Post(
        path: "/invoices",
        summary: "Create invoice",
        description: "Creates a new invoice. Supports file upload for invoice_document (multipart/form-data).",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["source"],
                    properties: [
                        new OA\Property(property: "source", type: "string", enum: ["manual", "xero"]),
                        new OA\Property(property: "project_id", type: "integer", nullable: true),
                        new OA\Property(property: "client_id", type: "integer", nullable: true),
                        new OA\Property(property: "invoice_number", type: "string"),
                        new OA\Property(property: "invoice_type", type: "string"),
                        new OA\Property(property: "invoice_document", type: "string", format: "binary"),
                        new OA\Property(property: "status", type: "string"),
                        new OA\Property(property: "amount", type: "number"),
                        new OA\Property(property: "currency", type: "string"),
                        new OA\Property(property: "issued_at", type: "string", format: "date"),
                        new OA\Property(property: "due_date", type: "string", format: "date"),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Invoice created"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source'         => 'required|in:manual,xero',
            'project_id'     => 'nullable|exists:projects,id',
            'client_id'      => 'nullable|exists:clients,id',
            'invoice_number' => 'nullable|string|max:255',
            'invoice_type'   => 'nullable|string|max:255',
            'invoice_document' => 'nullable|file|max:10240',
            'is_physical_invoice' => 'nullable|boolean',
            'courier_tracking_number' => 'nullable|string|max:255',
            'status'         => 'nullable|string|max:100',
            'amount'         => 'nullable|numeric|min:0',
            'currency'       => 'nullable|string|max:10',
            'issued_at'      => 'nullable|date',
            'due_date'       => 'nullable|date',
            'xero_invoice_id'=> 'nullable|string|unique:invoices,xero_invoice_id',
            'xero_status'    => 'nullable|string|max:100',
            'description'    => 'nullable|string',
        ]);

        if ($request->hasFile('invoice_document')) {
            $path = $request->file('invoice_document')->store('invoices', 's3');
            $validated['invoice_document'] = $path;
        }

        $invoice = Invoice::create($validated);

        return response()->json($invoice->load(['project:id,name', 'client:id,company_name']), 201);
    }

    #[OA\Get(
        path: "/invoices/{invoice}",
        summary: "Get invoice",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        parameters: [new OA\Parameter(name: "invoice", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Invoice details")]
    )]
    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['project:id,name', 'client:id,company_name,email,phone,address']);
        $response = $invoice->toArray();

        // If it is a Xero invoice, fetch line items and tax breakdown from Xero
        if ($invoice->xero_invoice_id) {
            try {
                $xeroService = app(\App\Services\XeroService::class);
                if ($xeroService->isConnected()) {
                    $xeroDetail = $xeroService->getInvoiceDetail($invoice->xero_invoice_id);
                    $response['xero_detail'] = $xeroDetail;
                    $response['items'] = collect($xeroDetail['LineItems'] ?? [])->map(function ($item, $idx) {
                        $qty = (float) ($item['Quantity'] ?? 1);
                        $price = (float) ($item['UnitAmount'] ?? 0);
                        $lineAmt = (float) ($item['LineAmount'] ?? ($qty * $price));
                        return [
                            'id' => $idx + 1,
                            'description' => $item['Description'] ?? '',
                            'quantity' => $qty,
                            'unit_price' => $price,
                            'total' => round($lineAmt, 2),
                            'tax_amount' => (float) ($item['TaxAmount'] ?? 0),
                        ];
                    })->values()->all();
                    $response['subtotal'] = (float) ($xeroDetail['SubTotal'] ?? $invoice->amount);
                    $response['total_tax'] = (float) ($xeroDetail['TotalTax'] ?? 0);
                    $response['total'] = (float) ($xeroDetail['Total'] ?? $invoice->amount);

                    if (empty($response['client']) && !empty($xeroDetail['Contact'])) {
                        $contact = $xeroDetail['Contact'];
                        $phones = $contact['Phones'] ?? [];
                        $phoneNum = null;
                        foreach ($phones as $p) {
                            if (!empty($p['PhoneNumber'])) {
                                $phoneNum = trim(($p['PhoneAreaCode'] ?? '') . ' ' . $p['PhoneNumber']);
                                break;
                            }
                        }
                        $response['client'] = [
                            'id' => null,
                            'company_name' => $contact['Name'] ?? 'Unknown Client',
                            'email' => $contact['EmailAddress'] ?? null,
                            'phone' => $phoneNum,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Could not load Xero invoice detail for show: ' . $e->getMessage());
            }
        }

        // Fallback items if no items loaded
        if (empty($response['items'])) {
            $amount = (float) ($invoice->amount ?? 0);
            $response['items'] = [
                [
                    'id' => 1,
                    'description' => $invoice->description ?: ($invoice->invoice_number ?: 'Invoice item'),
                    'quantity' => 1,
                    'unit_price' => $amount,
                    'total' => $amount,
                    'tax_amount' => 0,
                ]
            ];
            $response['subtotal'] = $amount;
            $response['total_tax'] = 0;
            $response['total'] = $amount;
        }

        return response()->json($response);
    }

    #[OA\Get(
        path: "/invoices/{invoice}/download-pdf",
        summary: "Download tax invoice PDF",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        parameters: [new OA\Parameter(name: "invoice", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "PDF stream")]
    )]
    public function downloadPdf(Request $request, Invoice $invoice)
    {
        $template = \App\Models\InvoiceTemplate::getDefault();
        if (!$template) {
            return response()->json(['message' => 'No active PDF invoice template found.'], 404);
        }

        if (!$template->pdf_path || !file_exists($template->absolute_pdf_path)) {
            return response()->json(['message' => 'Template PDF file not found.'], 404);
        }

        $pdfService = app(\App\Services\InvoicePdfService::class);
        $xeroService = app(\App\Services\XeroService::class);

        $overrides = [];
        if ($request->has('payment_mode')) {
            $overrides['payment_mode'] = $request->query('payment_mode');
        }
        if ($request->has('additional_info')) {
            $overrides['additional_info'] = $request->query('additional_info');
        }
        if ($request->has('reference')) {
            $overrides['reference'] = $request->query('reference');
        }
        if ($request->has('due_days')) {
            $overrides['due_days'] = $request->query('due_days');
        }
        if ($request->has('discount_type')) {
            $overrides['discount_type'] = $request->query('discount_type');
        }
        if ($request->has('discount_value')) {
            $overrides['discount_value'] = $request->query('discount_value');
        }

        $data = null;
        // If it is a Xero invoice and Xero is connected, fetch fresh details from Xero
        if ($invoice->xero_invoice_id && $xeroService->isConnected()) {
            try {
                $xeroInvoice = $xeroService->getInvoiceDetail($invoice->xero_invoice_id);
                $data = $pdfService->buildDataFromXeroInvoice($xeroInvoice, $overrides);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to fetch Xero invoice detail for PDF, falling back to local: ' . $e->getMessage());
            }
        }

        if (!$data) {
            $data = $pdfService->buildDataFromLocalInvoice($invoice->load(['client', 'project']), $overrides);
        }

        $pdfContent = $pdfService->generate($template, $data);
        $filename   = 'Tax_Invoice_' . ($invoice->invoice_number ?? $invoice->id) . '.pdf';

        return response()->streamDownload(function () use ($pdfContent) {
            echo $pdfContent;
        }, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    #[OA\Post(
        path: "/invoices/{invoice}",
        summary: "Update invoice",
        description: "Updates an invoice. Use multipart/form-data when uploading a new document.",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        parameters: [new OA\Parameter(name: "invoice", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(properties: [
                    new OA\Property(property: "source", type: "string", enum: ["manual", "xero"]),
                    new OA\Property(property: "status", type: "string"),
                    new OA\Property(property: "amount", type: "number"),
                    new OA\Property(property: "invoice_document", type: "string", format: "binary"),
                ])
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Updated invoice"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'source'         => 'sometimes|in:manual,xero',
            'project_id'     => 'nullable|exists:projects,id',
            'client_id'      => 'nullable|exists:clients,id',
            'invoice_number' => 'nullable|string|max:255',
            'invoice_type'   => 'nullable|string|max:255',
            'invoice_document' => 'nullable|file|max:10240',
            'is_physical_invoice' => 'nullable|boolean',
            'courier_tracking_number' => 'nullable|string|max:255',
            'status'         => 'nullable|string|max:100',
            'amount'         => 'nullable|numeric|min:0',
            'currency'       => 'nullable|string|max:10',
            'issued_at'      => 'nullable|date',
            'due_date'       => 'nullable|date',
            'xero_invoice_id'=> 'nullable|string|unique:invoices,xero_invoice_id,' . $invoice->id,
            'xero_status'    => 'nullable|string|max:100',
            'description'    => 'nullable|string',
        ]);

        if ($request->hasFile('invoice_document')) {
            $path = $request->file('invoice_document')->store('invoices', 's3');
            $validated['invoice_document'] = $path;
        }

        $invoice->update($validated);

        return response()->json($invoice->load(['project:id,name', 'client:id,company_name']));
    }

    #[OA\Delete(
        path: "/invoices/{invoice}",
        summary: "Delete invoice",
        security: [["bearerAuth" => []]],
        tags: ["Invoices"],
        parameters: [new OA\Parameter(name: "invoice", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 204, description: "Deleted")]
    )]
    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();
        return response()->json(null, 204);
    }
}
