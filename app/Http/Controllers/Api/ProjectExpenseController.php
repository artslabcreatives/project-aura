<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectExpenseController extends Controller
{
    /**
     * Roles that can approve expenses without needing team-lead approval.
     * team_lead can approve their own team's submissions.
     */
    private const APPROVER_ROLES = ['admin', 'hr', 'team_lead'];

    /**
     * List expenses for a project.
     *
     * - Admins / HR / Finance see all (pending + approved + rejected).
     * - Team leads see all entries for the project.
     * - Regular users see only their own submissions + approved entries from others.
     */
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

    /**
     * Show a single expense entry.
     */
    public function show(Project $project, ProjectExpense $expense): JsonResponse
    {
        $this->authorizeExpenseAccess($expense);

        $expense->load(['submittedBy:id,name,email', 'approvedBy:id,name,email', 'supplier:id,company_name']);

        return response()->json($expense);
    }

    /**
     * Update an expense (only the submitter can edit pending ones; approvers can edit any).
     */
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

    /**
     * Approve a pending expense.
     * Only team leads, HR, and admins may approve.
     */
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

    /**
     * Reject a pending expense with an optional reason.
     * Only team leads, HR, and admins may reject.
     */
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

    /**
     * Delete an expense.
     * Submitter can delete pending entries; approvers can delete any.
     */
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
