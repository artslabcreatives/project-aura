<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estimate;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class EstimateController extends Controller
{
    #[OA\Get(
        path: "/estimates",
        summary: "List all estimates",
        security: [["bearerAuth" => []]],
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "status", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "client_id", in: "query", required: false, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "List of estimates"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Estimate::with(['client', 'project', 'creator', 'items'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        return response()->json($query->get());
    }

    #[OA\Post(
        path: "/estimates",
        summary: "Create a new estimate and auto-generate a Suggested project",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title"],
                properties: [
                    new OA\Property(property: "title", type: "string", example: "Website Redesign Estimate"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "client_id", type: "integer", nullable: true, example: 1),
                    new OA\Property(property: "estimated_hours", type: "integer", nullable: true, example: 80),
                    new OA\Property(property: "amount", type: "number", format: "float", nullable: true, example: 5000.00),
                    new OA\Property(property: "status", type: "string", enum: ["draft", "sent", "approved", "accepted", "rejected"], example: "draft"),
                    new OA\Property(property: "notes", type: "string", nullable: true),
                    new OA\Property(property: "issue_date", type: "string", format: "date", nullable: true),
                    new OA\Property(property: "valid_until", type: "string", format: "date", nullable: true),
                    new OA\Property(property: "currency", type: "string", example: "USD", nullable: true),
                    new OA\Property(property: "tax_rate", type: "number", format: "float", nullable: true, example: 10),
                    new OA\Property(property: "items", type: "array", nullable: true, items: new OA\Items(
                        properties: [
                            new OA\Property(property: "description", type: "string"),
                            new OA\Property(property: "quantity", type: "number"),
                            new OA\Property(property: "unit_price", type: "number"),
                        ]
                    ))
                ]
            )
        ),
        tags: ["Estimates"],
        responses: [
            new OA\Response(response: 201, description: "Estimate created with auto-generated Suggested project"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'client_id'       => 'nullable|exists:clients,id',
            'estimated_hours' => 'nullable|integer|min:0',
            'amount'          => 'nullable|numeric|min:0',
            'status'          => 'nullable|string|in:draft,sent,approved,accepted,rejected',
            'notes'           => 'nullable|string',
            'issue_date'      => 'nullable|date',
            'valid_until'     => 'nullable|date',
            'currency'        => 'nullable|string|max:3',
            'tax_rate'        => 'nullable|numeric|min:0|max:100',
            'items'           => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity'    => 'required|numeric|min:0',
            'items.*.unit_price'  => 'required|numeric|min:0',
        ]);

        $validated['created_by'] = auth()->id();
        $itemsData = $validated['items'] ?? [];
        unset($validated['items']);

        // Calculate totals from items
        if (!empty($itemsData)) {
            $taxRate = $validated['tax_rate'] ?? 0;
            $totals  = $this->calculateTotals($itemsData, $taxRate);
            $validated = array_merge($validated, $totals);
        }

        [$estimate] = DB::transaction(function () use ($validated, $itemsData) {
            $estimate = Estimate::create($validated);

            // Persist line items
            if (!empty($itemsData)) {
                $this->syncItems($estimate, $itemsData);
            }

            // Auto-generate a Suggested project from the estimate
            $project = Project::create([
                'name'            => $estimate->title,
                'description'     => $estimate->description,
                'client_id'       => $estimate->client_id,
                'estimated_hours' => $estimate->estimated_hours,
                'status'          => 'suggested',
                'estimate_id'     => $estimate->id,
                'created_by'      => $estimate->created_by,
            ]);

            // Link the estimate back to the auto-created project
            $estimate->update(['project_id' => $project->id]);

            return [$estimate];
        });

        // Refresh to ensure all calculated values are loaded
        $estimate->refresh();

        return response()->json(
            $estimate->load(['client', 'project', 'creator', 'items']),
            201
        );
    }

    #[OA\Get(
        path: "/estimates/{id}",
        summary: "Get estimate by ID",
        security: [["bearerAuth" => []]],
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate details"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Estimate not found")
        ]
    )]
    public function show(Estimate $estimate): JsonResponse
    {
        return response()->json($estimate->load(['client', 'project', 'creator', 'items']));
    }

    #[OA\Put(
        path: "/estimates/{id}",
        summary: "Update an estimate",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "client_id", type: "integer", nullable: true),
                    new OA\Property(property: "estimated_hours", type: "integer", nullable: true),
                    new OA\Property(property: "amount", type: "number", format: "float", nullable: true),
                    new OA\Property(property: "status", type: "string", enum: ["draft", "sent", "approved", "accepted", "rejected"]),
                    new OA\Property(property: "notes", type: "string", nullable: true),
                    new OA\Property(property: "issue_date", type: "string", format: "date", nullable: true),
                    new OA\Property(property: "valid_until", type: "string", format: "date", nullable: true),
                    new OA\Property(property: "currency", type: "string", nullable: true),
                    new OA\Property(property: "tax_rate", type: "number", format: "float", nullable: true),
                    new OA\Property(property: "items", type: "array", nullable: true, items: new OA\Items(
                        properties: [
                            new OA\Property(property: "description", type: "string"),
                            new OA\Property(property: "quantity", type: "number"),
                            new OA\Property(property: "unit_price", type: "number"),
                        ]
                    ))
                ]
            )
        ),
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Estimate not found")
        ]
    )]
    public function update(Request $request, Estimate $estimate): JsonResponse
    {
        $validated = $request->validate([
            'title'           => 'sometimes|required|string|max:255',
            'description'     => 'nullable|string',
            'client_id'       => 'nullable|exists:clients,id',
            'estimated_hours' => 'nullable|integer|min:0',
            'amount'          => 'nullable|numeric|min:0',
            'status'          => 'nullable|string|in:draft,sent,approved,accepted,rejected',
            'notes'           => 'nullable|string',
            'issue_date'      => 'nullable|date',
            'valid_until'     => 'nullable|date',
            'currency'        => 'nullable|string|max:3',
            'tax_rate'        => 'nullable|numeric|min:0|max:100',
            'items'           => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.quantity'    => 'required|numeric|min:0',
            'items.*.unit_price'  => 'required|numeric|min:0',
        ]);

        $itemsData = $validated['items'] ?? null;
        $taxRateChanged = isset($validated['tax_rate']) && $validated['tax_rate'] !== $estimate->tax_rate;
        unset($validated['items']);

        // Recalculate totals if items are provided OR if tax_rate changed
        if ($itemsData !== null || $taxRateChanged) {
            $currentItems = $itemsData ?? $estimate->items()->get(['description', 'quantity', 'unit_price'])->toArray();
            $taxRate = $validated['tax_rate'] ?? $estimate->tax_rate ?? 0;
            
            if (!empty($currentItems)) {
                $totals = $this->calculateTotals($currentItems, $taxRate);
                $validated = array_merge($validated, $totals);
            }
        }

        DB::transaction(function () use ($estimate, $validated, $itemsData) {
            $estimate->update($validated);

            if ($itemsData !== null) {
                $this->syncItems($estimate, $itemsData, true);
            }
        });

        // Refresh the model to get updated values including calculated totals
        $estimate->refresh();

        return response()->json($estimate->load(['client', 'project', 'creator', 'items']));
    }

    #[OA\Delete(
        path: "/estimates/{id}",
        summary: "Delete an estimate",
        security: [["bearerAuth" => []]],
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 204, description: "Estimate deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Estimate not found")
        ]
    )]
    public function destroy(Estimate $estimate): JsonResponse
    {
        $estimate->delete();
        return response()->json(null, 204);
    }

    #[OA\Post(
        path: "/estimates/{id}/send",
        summary: "Mark a draft estimate as sent",
        security: [["bearerAuth" => []]],
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate marked as sent"),
            new OA\Response(response: 422, description: "Estimate is not in draft status"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Estimate not found")
        ]
    )]
    public function send(Estimate $estimate): JsonResponse
    {
        if ($estimate->status !== 'draft') {
            return response()->json(['message' => 'Only draft estimates can be sent.'], 422);
        }

        $estimate->update(['status' => 'sent']);

        return response()->json($estimate->load(['client', 'project', 'creator', 'items']));
    }

    #[OA\Post(
        path: "/estimates/{id}/approve",
        summary: "Approve a sent estimate",
        security: [["bearerAuth" => []]],
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate approved"),
            new OA\Response(response: 422, description: "Estimate is not in sent status"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Estimate not found")
        ]
    )]
    public function approve(Estimate $estimate): JsonResponse
    {
        if ($estimate->status !== 'sent') {
            return response()->json(['message' => 'Only sent estimates can be approved.'], 422);
        }

        $estimate->update(['status' => 'approved']);

        return response()->json($estimate->load(['client', 'project', 'creator', 'items']));
    }

    /**
     * Calculate estimate totals from line items and tax rate.
     *
     * @param  array  $itemsData
     * @param  float  $taxRate
     * @return array{subtotal: float, tax_amount: float, total: float}
     */
    private function calculateTotals(array $itemsData, float $taxRate): array
    {
        $subtotal  = collect($itemsData)->sum(fn($item) => $item['quantity'] * $item['unit_price']);
        $taxAmount = round($subtotal * $taxRate / 100, 2);

        return [
            'subtotal'   => $subtotal,
            'tax_amount' => $taxAmount,
            'total'      => $subtotal + $taxAmount,
        ];
    }

    /**
     * Persist line items for an estimate, replacing any existing ones.
     */
    private function syncItems(Estimate $estimate, array $itemsData, bool $deleteExisting = false): void
    {
        if ($deleteExisting) {
            $estimate->items()->delete();
        }

        foreach ($itemsData as $index => $item) {
            $estimate->items()->create([
                'description' => $item['description'],
                'quantity'    => $item['quantity'],
                'unit_price'  => $item['unit_price'],
                'total'       => round($item['quantity'] * $item['unit_price'], 2),
                'sort_order'  => $index,
            ]);
        }
    }
}
