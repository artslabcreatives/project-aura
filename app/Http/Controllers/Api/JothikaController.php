<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\JothikaService;
use App\Models\ProjectExpense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Jothika Integration', description: 'Jothika reimbursement system integration')]
class JothikaController extends Controller
{
    protected JothikaService $jothikaService;

    public function __construct(JothikaService $jothikaService)
    {
        $this->jothikaService = $jothikaService;
    }

    #[OA\Post(
        path: '/api/jothika/token',
        summary: 'Store Jothika API token for current user',
        tags: ['Jothika Integration'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['token'],
                properties: [
                    new OA\Property(property: 'token', type: 'string', description: 'Jothika API token'),
                    new OA\Property(property: 'expires_at', type: 'string', format: 'date-time', description: 'Token expiration time (optional)'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token stored successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'has_token', type: 'boolean'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function storeToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'expires_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        
        $this->jothikaService->storeToken(
            $user,
            $request->token,
            $request->expires_at
        );

        return response()->json([
            'message' => 'Jothika token stored successfully',
            'has_token' => true,
        ]);
    }

    #[OA\Get(
        path: '/api/jothika/token/status',
        summary: 'Check if current user has a valid Jothika token',
        tags: ['Jothika Integration'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token status',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'has_token', type: 'boolean'),
                        new OA\Property(property: 'is_valid', type: 'boolean'),
                    ]
                )
            ),
        ]
    )]
    public function tokenStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $hasToken = $this->jothikaService->hasValidToken($user);

        return response()->json([
            'has_token' => $hasToken,
            'is_valid' => $hasToken,
        ]);
    }

    #[OA\Delete(
        path: '/api/jothika/token',
        summary: 'Revoke/disconnect Jothika token for current user',
        tags: ['Jothika Integration'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token revoked successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string'),
                    ]
                )
            ),
        ]
    )]
    public function revokeToken(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->jothikaService->revokeToken($user);

        return response()->json([
            'message' => 'Jothika connection removed successfully',
        ]);
    }

    #[OA\Post(
        path: '/api/jothika/reimbursement/create-from-expense',
        summary: 'Create reimbursement in Jothika from project expense',
        tags: ['Jothika Integration'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['expense_id', 'project_id'],
                properties: [
                    new OA\Property(property: 'expense_id', type: 'integer', description: 'Project expense ID'),
                    new OA\Property(property: 'project_id', type: 'integer', description: 'Project ID'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Reimbursement created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'jothika_id', type: 'integer'),
                        new OA\Property(property: 'status', type: 'string'),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Expense not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function createReimbursementFromExpense(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'expense_id' => 'required|integer|exists:project_expenses,id',
            'project_id' => 'required|integer|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        
        $expense = ProjectExpense::with('project')
            ->where('id', $request->expense_id)
            ->where('project_id', $request->project_id)
            ->first();

        if (!$expense) {
            return response()->json([
                'message' => 'Expense not found',
            ], 404);
        }

        // Build reimbursement data from expense
        $reimbursementData = $this->jothikaService->buildReimbursementData([
            'amount' => $expense->amount,
            'currency' => $expense->currency,
            'description' => $expense->description ?: $expense->type,
            'expense_date' => $expense->expense_date,
            'client_name' => $expense->project->client_name ?? null,
            'is_cost_of_sales' => true,
            'reference' => "AURA-EXP-{$expense->id}",
        ]);

        try {
            $response = $this->jothikaService->createReimbursement($user, $reimbursementData);

            // Mark expense as reimbursement noted
            $expense->update(['reimbursement_noted' => true]);

            return response()->json([
                'message' => 'Reimbursement created successfully in Jothika',
                'jothika_id' => $response['id'] ?? null,
                'status' => $response['status'] ?? 'pending',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    #[OA\Post(
        path: '/api/jothika/reimbursement',
        summary: 'Create a custom reimbursement in Jothika',
        tags: ['Jothika Integration'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['amount', 'currency', 'description', 'expense_date'],
                properties: [
                    new OA\Property(property: 'amount', type: 'number', format: 'float', description: 'Expense amount'),
                    new OA\Property(property: 'currency', type: 'string', description: 'Currency code (USD, LKR, etc.)'),
                    new OA\Property(property: 'description', type: 'string', description: 'Expense description'),
                    new OA\Property(property: 'expense_date', type: 'string', format: 'date', description: 'Date of expense (YYYY-MM-DD)'),
                    new OA\Property(property: 'client_name', type: 'string', description: 'Client name (optional)'),
                    new OA\Property(property: 'is_cost_of_sales', type: 'boolean', description: 'Is this cost of sales? (default: true)'),
                    new OA\Property(property: 'reference', type: 'string', description: 'Reference ID (optional)'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Reimbursement created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string'),
                        new OA\Property(property: 'jothika_id', type: 'integer'),
                        new OA\Property(property: 'status', type: 'string'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function createReimbursement(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'description' => 'required|string|max:1000',
            'expense_date' => 'required|date',
            'client_name' => 'nullable|string|max:255',
            'is_cost_of_sales' => 'nullable|boolean',
            'reference' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        try {
            $reimbursementData = $this->jothikaService->buildReimbursementData($request->all());
            $response = $this->jothikaService->createReimbursement($user, $reimbursementData);

            return response()->json([
                'message' => 'Reimbursement created successfully in Jothika',
                'jothika_id' => $response['id'] ?? null,
                'status' => $response['status'] ?? 'pending',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
