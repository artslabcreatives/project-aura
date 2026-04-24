<?php

namespace App\Mcp\Tools;

use App\Models\Estimate;
use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class AttachEstimatePOTool extends Tool
{
    protected string $name = 'attach_estimate_po';

    protected string $description = 'Attach a PO number to the project linked to a given estimate. Call this ONLY after search_estimates has returned results and you have identified the correct estimate_id. Requires: estimate_id (integer, from search_estimates result), po_number (string, e.g. "4563172446"). Optional: provisional (boolean, default false) — set true only if the user says it is a provisional PO. Do NOT include po_document unless you have a real file path or URL.';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'estimate_id' => $schema->integer()
                ->description('The ID of the estimate to check')
                ->required(),
            'po_number' => $schema->string()
                ->description('The purchase order number to attach')
                ->required(),
            'po_document' => $schema->string()
                ->description('Optional: Path or URL to the PO document file'),
            'provisional' => $schema->boolean()
                ->description('Optional: Whether this is a provisional PO (defaults to false)'),
        ];
    }

    public function handle(Request $request): Response
    {
        Log::channel('daily')->info('[MCP Tool] attach_estimate_po called', [
            'arguments' => $request->all(),
        ]);

        // Validate input
        $validated = $request->validate([
            'estimate_id' => 'required|integer|exists:estimates,id',
            'po_number' => 'required|string|max:255',
            'po_document' => 'nullable|string',
            'provisional' => 'nullable|boolean',
        ]);

        // Find the estimate
        $estimate = Estimate::with(['project', 'client'])->find($validated['estimate_id']);

        if (!$estimate) {
            return Response::text(json_encode([
                'success' => false,
                'error' => 'Estimate not found',
            ]));
        }

        // Check 1: Does the estimate have amounts?
        $hasAmount = false;
        $amountValue = 0;

        if ($estimate->total && $estimate->total > 0) {
            $hasAmount = true;
            $amountValue = $estimate->total;
        } elseif ($estimate->amount && $estimate->amount > 0) {
            $hasAmount = true;
            $amountValue = $estimate->amount;
        } elseif ($estimate->subtotal && $estimate->subtotal > 0) {
            $hasAmount = true;
            $amountValue = $estimate->subtotal;
        }

        if (!$hasAmount) {
            return Response::text(json_encode([
                'success' => false,
                'error' => 'Estimate does not have a valid amount',
                'estimate_id' => $estimate->id,
                'estimate_title' => $estimate->title,
                'amount' => null,
            ]));
        }

        // Check 2: Do we have a PO number?
        $poNumber = $validated['po_number'];
        if (empty($poNumber)) {
            return Response::text(json_encode([
                'success' => false,
                'error' => 'PO number is required',
                'estimate_id' => $estimate->id,
                'estimate_title' => $estimate->title,
                'amount' => $amountValue,
            ]));
        }

        // Check 3: Does the estimate have an associated project?
        $project = null;

        if ($estimate->project_id) {
            $project = $estimate->project;
        } else {
            // If no project is linked, we cannot attach the PO
            return Response::text(json_encode([
                'success' => false,
                'error' => 'Estimate is not linked to a project',
                'estimate_id' => $estimate->id,
                'estimate_title' => $estimate->title,
                'amount' => $amountValue,
                'po_number' => $poNumber,
            ]));
        }

        // Step 4: Attach the PO to the project
        $isProvisional = $validated['provisional'] ?? false;

        $updateData = [];
        
        if ($isProvisional) {
            // Set as provisional PO
            $updateData['provisional_po_number'] = $poNumber;
            // Optionally set provisional expiry (e.g., 30 days from now)
            if (!$project->provisional_po_expires_at) {
                $updateData['provisional_po_expires_at'] = now()->addDays(30);
            }
        } else {
            // Set as permanent PO
            $updateData['po_number'] = $poNumber;
            $updateData['is_locked_by_po'] = true;
        }

        // Handle PO document if provided
        if (!empty($validated['po_document'])) {
            // Validate that the document exists or is a valid path
            if (Storage::exists($validated['po_document'])) {
                $updateData['po_document'] = $validated['po_document'];
            } elseif (filter_var($validated['po_document'], FILTER_VALIDATE_URL)) {
                // If it's a URL, store it as-is
                $updateData['po_document'] = $validated['po_document'];
            } else {
                // Document path/URL is invalid
                return Response::text(json_encode([
                    'success' => false,
                    'error' => 'PO document path is invalid or file does not exist',
                    'estimate_id' => $estimate->id,
                    'project_id' => $project->id,
                    'po_number' => $poNumber,
                ]));
            }
        }

        // Update the project
        $project->update($updateData);
        $project->refresh();

        // Return success response
        return Response::text(json_encode([
            'success' => true,
            'message' => 'PO successfully attached to project',
            'estimate' => [
                'id' => $estimate->id,
                'title' => $estimate->title,
                'amount' => $amountValue,
                'status' => $estimate->status,
                'client' => $estimate->client ? $estimate->client->name : null,
            ],
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'po_number' => $project->po_number,
                'provisional_po_number' => $project->provisional_po_number,
                'po_document' => $project->po_document,
                'is_locked_by_po' => $project->is_locked_by_po,
            ],
            'po_type' => $isProvisional ? 'provisional' : 'permanent',
        ]));
    }
}
