<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estimate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class EstimateController extends Controller
{
    #[OA\Get(
        path: "/estimates",
        summary: "List all estimates",
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "status", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["draft", "sent", "approved"])),
            new OA\Parameter(name: "client_id", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "project_id", in: "query", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "search", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(response: 200, description: "List of estimates")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = Estimate::with(['client', 'project', 'creator'])
            ->withCount('items');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    #[OA\Post(
        path: "/estimates",
        summary: "Create a new estimate",
        tags: ["Estimates"],
        responses: [
            new OA\Response(response: 201, description: "Estimate created")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client_id' => 'nullable|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'issue_date' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:issue_date',
            'currency' => 'nullable|string|max:10',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.sort_order' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $estimate = Estimate::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'client_id' => $validated['client_id'] ?? null,
                'project_id' => $validated['project_id'] ?? null,
                'status' => 'draft',
                'issue_date' => $validated['issue_date'] ?? null,
                'valid_until' => $validated['valid_until'] ?? null,
                'currency' => $validated['currency'] ?? 'USD',
                'tax_rate' => $validated['tax_rate'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $index => $itemData) {
                    $total = round($itemData['quantity'] * $itemData['unit_price'], 2);
                    $estimate->items()->create([
                        'description' => $itemData['description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total' => $total,
                        'sort_order' => $itemData['sort_order'] ?? $index,
                    ]);
                }
            }

            $estimate->recalculateTotals();
            $estimate->load(['client', 'project', 'creator', 'items']);

            DB::commit();
            return response()->json($estimate, 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    #[OA\Get(
        path: "/estimates/{id}",
        summary: "Get a specific estimate",
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate details"),
            new OA\Response(response: 404, description: "Not found")
        ]
    )]
    public function show(Estimate $estimate): JsonResponse
    {
        return response()->json($estimate->load(['client', 'project', 'creator', 'items']));
    }

    #[OA\Put(
        path: "/estimates/{id}",
        summary: "Update an estimate",
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate updated"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function update(Request $request, Estimate $estimate): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'client_id' => 'nullable|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'issue_date' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:issue_date',
            'currency' => 'nullable|string|max:10',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.sort_order' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $estimate->update([
                'title' => $validated['title'] ?? $estimate->title,
                'description' => array_key_exists('description', $validated) ? $validated['description'] : $estimate->description,
                'client_id' => array_key_exists('client_id', $validated) ? $validated['client_id'] : $estimate->client_id,
                'project_id' => array_key_exists('project_id', $validated) ? $validated['project_id'] : $estimate->project_id,
                'issue_date' => array_key_exists('issue_date', $validated) ? $validated['issue_date'] : $estimate->issue_date,
                'valid_until' => array_key_exists('valid_until', $validated) ? $validated['valid_until'] : $estimate->valid_until,
                'currency' => $validated['currency'] ?? $estimate->currency,
                'tax_rate' => array_key_exists('tax_rate', $validated) ? $validated['tax_rate'] : $estimate->tax_rate,
                'notes' => array_key_exists('notes', $validated) ? $validated['notes'] : $estimate->notes,
            ]);

            if (array_key_exists('items', $validated)) {
                $estimate->items()->delete();
                foreach ($validated['items'] as $index => $itemData) {
                    $total = round($itemData['quantity'] * $itemData['unit_price'], 2);
                    $estimate->items()->create([
                        'description' => $itemData['description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total' => $total,
                        'sort_order' => $itemData['sort_order'] ?? $index,
                    ]);
                }
            }

            $estimate->recalculateTotals();
            $estimate->load(['client', 'project', 'creator', 'items']);

            DB::commit();
            return response()->json($estimate);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    #[OA\Delete(
        path: "/estimates/{id}",
        summary: "Delete an estimate",
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 204, description: "Deleted"),
            new OA\Response(response: 404, description: "Not found")
        ]
    )]
    public function destroy(Estimate $estimate): JsonResponse
    {
        $estimate->delete();
        return response()->json(null, 204);
    }

    #[OA\Post(
        path: "/estimates/{id}/send",
        summary: "Mark estimate as sent (draft → sent)",
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate marked as sent"),
            new OA\Response(response: 422, description: "Invalid status transition")
        ]
    )]
    public function send(Estimate $estimate): JsonResponse
    {
        if ($estimate->status !== 'draft') {
            return response()->json(['message' => 'Only draft estimates can be marked as sent.'], 422);
        }

        $estimate->update(['status' => 'sent']);
        $estimate->load(['client', 'project', 'creator', 'items']);

        return response()->json($estimate);
    }

    #[OA\Post(
        path: "/estimates/{id}/approve",
        summary: "Mark estimate as approved (sent → approved)",
        tags: ["Estimates"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Estimate approved"),
            new OA\Response(response: 422, description: "Invalid status transition")
        ]
    )]
    public function approve(Estimate $estimate): JsonResponse
    {
        if ($estimate->status !== 'sent') {
            return response()->json(['message' => 'Only sent estimates can be approved.'], 422);
        }

        $estimate->update(['status' => 'approved']);
        $estimate->load(['client', 'project', 'creator', 'items']);

        return response()->json($estimate);
    }
}
