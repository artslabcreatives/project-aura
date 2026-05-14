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
            $query->where('status', $request->status);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

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
        return response()->json($invoice->load(['project:id,name', 'client:id,company_name']));
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
