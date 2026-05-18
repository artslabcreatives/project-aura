<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class ProjectExpenseController extends Controller
{
    /**
     * Roles that can approve expenses without needing team-lead approval.
     * team-lead can approve their own team's submissions.
     */
    private const APPROVER_ROLES = ['admin', 'hr', 'team-lead'];

    #[OA\Get(
        path: "/projects/{project}/expenses",
        summary: "List project expenses",
        description: "Returns expenses for a project. Role-based visibility: admins/hr see all, team-leads see all, staff see own + approved.",
        security: [["bearerAuth" => []]],
        tags: ["Project Expenses"],
        parameters: [new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Expense list with budget summary")]
    )]
    public function index(Project $project): JsonResponse
    {
        $user = auth()->user();

        $query = $project->expenses()
            ->with(['submittedBy:id,name,email', 'approvedBy:id,name,email', 'supplier:id,company_name'])
            ->orderByDesc('expense_date');

        if (in_array($user->role, self::APPROVER_ROLES) || $user->role === 'admin' || $user->role === 'hr') {
            // See everything
        } else {
            // Regular users: own submissions OR approved entries
            $query->where(function ($q) use ($user) {
                $q->where('submitted_by', $user->id)
                  ->orWhere('status', 'approved');
            });
        }

        $expenses = $query->get();

        // Append budget summary
        $approvedTotal = $project->expenses()->where('status', 'approved')->sum('amount');
        $budgetAllocated = $project->budget_allocated;
        $budgetRemaining = $budgetAllocated !== null ? ($budgetAllocated - $approvedTotal) : null;

        return response()->json([
            'expenses' => $expenses,
            'budget' => [
                'allocated' => $budgetAllocated,
                'spent'     => round($approvedTotal, 2),
                'remaining' => $budgetRemaining !== null ? round($budgetRemaining, 2) : null,
            ],
        ]);
    }

    /**
     * Create a new expense entry for a project.
     *
     * Admins / HR / team leads are auto-approved.
     * Everyone else submits as "pending" — team leads must approve.
     */
    #[OA\Post(
        path: "/projects/{project}/expenses",
        summary: "Create project expense",
        description: "Submit a new expense for a project. Admins/HR/team-leads are auto-approved.",
        security: [["bearerAuth" => []]],
        tags: ["Project Expenses"],
        parameters: [new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["type", "amount", "expense_date"],
                    properties: [
                        new OA\Property(property: "type", type: "string", enum: ["receipt", "expense", "invoice"]),
                        new OA\Property(property: "amount", type: "number", minimum: 0.01),
                        new OA\Property(property: "currency", type: "string", minLength: 3, maxLength: 3),
                        new OA\Property(property: "description", type: "string"),
                        new OA\Property(property: "expense_date", type: "string", format: "date"),
                        new OA\Property(property: "supplier_id", type: "integer", nullable: true),
                        new OA\Property(property: "is_reimbursable", type: "boolean"),
                        new OA\Property(property: "receipt", type: "string", format: "binary"),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Expense created"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(Request $request, Project $project): JsonResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'type'            => 'required|in:receipt,expense,invoice',
            'amount'          => 'required|numeric|min:0.01',
            'currency'        => 'nullable|string|size:3',
            'description'     => 'nullable|string|max:2000',
            'expense_date'    => 'required|date',
            'supplier_id'     => 'nullable|exists:suppliers,id',
            'is_reimbursable' => 'nullable|boolean',
            'receipt'         => 'nullable|file|max:20480|mimes:jpg,jpeg,png,pdf,webp,heic',
        ]);

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('project-expenses', 's3');
        }

        $isApprover = in_array($user->role, self::APPROVER_ROLES);

        $expense = $project->expenses()->create([
            'supplier_id'     => $validated['supplier_id'] ?? null,
            'submitted_by'    => $user->id,
            'approved_by'     => $isApprover ? $user->id : null,
            'type'            => $validated['type'],
            'amount'          => $validated['amount'],
            'currency'        => $validated['currency'] ?? ($project->currency ?? 'USD'),
            'description'     => $validated['description'] ?? null,
            'expense_date'    => $validated['expense_date'],
            'receipt_file_path' => $receiptPath,
            'status'          => $isApprover ? 'approved' : 'pending',
            'approved_at'     => $isApprover ? now() : null,
            'is_reimbursable' => $validated['is_reimbursable'] ?? false,
        ]);

        $expense->load(['submittedBy:id,name,email', 'approvedBy:id,name,email', 'supplier:id,company_name']);

        return response()->json($expense, 201);
    }

    #[OA\Get(
        path: "/projects/{project}/expenses/{expense}",
        summary: "Get project expense",
        security: [["bearerAuth" => []]],
        tags: ["Project Expenses"],
        parameters: [
            new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "expense", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [new OA\Response(response: 200, description: "Expense details")]
    )]
    public function show(Project $project, ProjectExpense $expense): JsonResponse
    {
        $this->authorizeExpenseAccess($expense);

        $expense->load(['submittedBy:id,name,email', 'approvedBy:id,name,email', 'supplier:id,company_name']);

        return response()->json($expense);
    }

    #[OA\Post(
        path: "/projects/{project}/expenses/{expense}",
        summary: "Update project expense",
        description: "Updates an expense. Use POST with multipart/form-data. Submitter can edit pending; approvers can edit any.",
        security: [["bearerAuth" => []]],
        tags: ["Project Expenses"],
        parameters: [
            new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "expense", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(properties: [
                    new OA\Property(property: "type", type: "string", enum: ["receipt", "expense", "invoice"]),
                    new OA\Property(property: "amount", type: "number"),
                    new OA\Property(property: "receipt", type: "string", format: "binary"),
                ])
            )
        ),
        responses: [new OA\Response(response: 200, description: "Updated expense")]
    )]
    public function update(Request $request, Project $project, ProjectExpense $expense): JsonResponse
    {
        $user = auth()->user();

        $canEdit = in_array($user->role, self::APPROVER_ROLES)
            || ($expense->submitted_by === $user->id && $expense->status === 'pending');

        if (!$canEdit) {
            return response()->json(['message' => 'You cannot edit this expense.'], 403);
        }

        $validated = $request->validate([
            'type'            => 'sometimes|in:receipt,expense,invoice',
            'amount'          => 'sometimes|numeric|min:0.01',
            'currency'        => 'nullable|string|size:3',
            'description'     => 'nullable|string|max:2000',
            'expense_date'    => 'sometimes|date',
            'supplier_id'     => 'nullable|exists:suppliers,id',
            'is_reimbursable' => 'nullable|boolean',
            'reimbursement_noted' => 'nullable|boolean',
            'receipt'         => 'nullable|file|max:20480|mimes:jpg,jpeg,png,pdf,webp,heic',
        ]);

        if ($request->hasFile('receipt')) {
            if ($expense->receipt_file_path) {
                Storage::disk('s3')->delete($expense->receipt_file_path);
            }
            $validated['receipt_file_path'] = $request->file('receipt')->store('project-expenses', 's3');
        }

        unset($validated['receipt']);
        $expense->update($validated);

        $expense->load(['submittedBy:id,name,email', 'approvedBy:id,name,email', 'supplier:id,company_name']);

        return response()->json($expense);
    }

    #[OA\Post(
        path: "/projects/{project}/expenses/{expense}/approve",
        summary: "Approve expense",
        description: "Approves a pending expense (team-lead/hr/admin only)",
        security: [["bearerAuth" => []]],
        tags: ["Project Expenses"],
        parameters: [
            new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "expense", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Expense approved"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function approve(Request $request, Project $project, ProjectExpense $expense): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->role, self::APPROVER_ROLES)) {
            return response()->json(['message' => 'Only team leads, HR, or admins can approve expenses.'], 403);
        }

        if ($expense->status !== 'pending') {
            return response()->json(['message' => 'Only pending expenses can be approved.'], 422);
        }

        $expense->update([
            'status'      => 'approved',
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        $expense->load(['submittedBy:id,name,email', 'approvedBy:id,name,email', 'supplier:id,company_name']);

        return response()->json($expense);
    }

    #[OA\Post(
        path: "/projects/{project}/expenses/{expense}/reject",
        summary: "Reject expense",
        description: "Rejects a pending expense with an optional reason (team-lead/hr/admin only)",
        security: [["bearerAuth" => []]],
        tags: ["Project Expenses"],
        parameters: [
            new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "expense", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(properties: [new OA\Property(property: "reason", type: "string", nullable: true)])
        ),
        responses: [
            new OA\Response(response: 200, description: "Expense rejected"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function reject(Request $request, Project $project, ProjectExpense $expense): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->role, self::APPROVER_ROLES)) {
            return response()->json(['message' => 'Only team leads, HR, or admins can reject expenses.'], 403);
        }

        if ($expense->status !== 'pending') {
            return response()->json(['message' => 'Only pending expenses can be rejected.'], 422);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $expense->update([
            'status'           => 'rejected',
            'rejection_reason' => $validated['reason'] ?? null,
        ]);

        $expense->load(['submittedBy:id,name,email', 'approvedBy:id,name,email', 'supplier:id,company_name']);

        return response()->json($expense);
    }

    #[OA\Delete(
        path: "/projects/{project}/expenses/{expense}",
        summary: "Delete expense",
        description: "Submitter can delete pending; approvers can delete any",
        security: [["bearerAuth" => []]],
        tags: ["Project Expenses"],
        parameters: [
            new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "expense", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [new OA\Response(response: 204, description: "Deleted")]
    )]
    public function destroy(Project $project, ProjectExpense $expense): JsonResponse
    {
        $user = auth()->user();

        $canDelete = in_array($user->role, self::APPROVER_ROLES)
            || ($expense->submitted_by === $user->id && $expense->status === 'pending');

        if (!$canDelete) {
            return response()->json(['message' => 'You cannot delete this expense.'], 403);
        }

        if ($expense->receipt_file_path) {
            Storage::disk('s3')->delete($expense->receipt_file_path);
        }

        $expense->delete();

        return response()->json(null, 204);
    }

    private function authorizeExpenseAccess(ProjectExpense $expense): void
    {
        $user = auth()->user();

        if (in_array($user->role, self::APPROVER_ROLES)) {
            return;
        }

        if ($expense->submitted_by !== $user->id && $expense->status !== 'approved') {
            abort(403, 'Unauthorized');
        }
    }
}
