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
        responses: [
            new OA\Response(response: 200, description: "List of estimates"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(): JsonResponse
    {
        $estimates = Estimate::with(['client', 'project', 'creator'])->latest()->get();
        return response()->json($estimates);
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
                    new OA\Property(property: "status", type: "string", enum: ["draft", "sent", "accepted", "rejected"], example: "draft"),
                    new OA\Property(property: "notes", type: "string", nullable: true)
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
            'status'          => 'nullable|string|in:draft,sent,accepted,rejected',
            'notes'           => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        [$estimate] = DB::transaction(function () use ($validated) {
            $estimate = Estimate::create($validated);

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

        return response()->json(
            $estimate->load(['client', 'project', 'creator']),
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
        return response()->json($estimate->load(['client', 'project', 'creator']));
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
                    new OA\Property(property: "status", type: "string", enum: ["draft", "sent", "accepted", "rejected"]),
                    new OA\Property(property: "notes", type: "string", nullable: true)
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
            'status'          => 'nullable|string|in:draft,sent,accepted,rejected',
            'notes'           => 'nullable|string',
        ]);

        $estimate->update($validated);

        return response()->json($estimate->load(['client', 'project', 'creator']));
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
}
