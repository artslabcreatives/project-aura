<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source'         => 'required|in:manual,xero',
            'project_id'     => 'nullable|exists:projects,id',
            'client_id'      => 'nullable|exists:clients,id',
            'invoice_number' => 'nullable|string|max:255',
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

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($invoice->load(['project:id,name', 'client:id,company_name']));
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'source'         => 'sometimes|in:manual,xero',
            'project_id'     => 'nullable|exists:projects,id',
            'client_id'      => 'nullable|exists:clients,id',
            'invoice_number' => 'nullable|string|max:255',
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

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();
        return response()->json(null, 204);
    }
}
