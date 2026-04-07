<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectReport;
use App\Models\ReportActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * List reports based on user role and permissions.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ProjectReport::with(['user', 'project', 'activities.user', 'teamLead', 'hrUser']);

        if ($user->role === 'hr' || $user->role === 'admin') {
            // HR/Admin can see all reports
        } elseif ($user->role === 'team-lead') {
            // Team Lead can see their own reports AND reports from their department
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('user', function ($uq) use ($user) {
                      $uq->where('department_id', $user->department_id);
                  });
            });
        } else {
            // Staff can only see their own reports
            $query->where('user_id', $user->id);
        }

        // Optional filtering by project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        return response()->json($query->orderBy('updated_at', 'desc')->get());
    }

    /**
     * Store a new report submission.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'report_file' => 'required|file|max:20480', // 20MB
        ]);

        $user = $request->user();
        
        // Handle file upload
        $path = $request->file('report_file')->store('project-reports', 's3');

        $report = ProjectReport::create([
            'project_id' => $validated['project_id'],
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_url' => $path,
            'status' => 'submitted', // Auto-submit on upload as per "enters an approval workflow"
        ]);

        // Log the submission
        $this->logActivity($report, $user, 'status_change', 'draft', 'submitted', 'Report submitted for approval.');

        return response()->json($report->load('user', 'project'), 201);
    }

    /**
     * Show report details.
     */
    public function show(ProjectReport $report): JsonResponse
    {
        $this->authorizeAccess($report);
        return response()->json($report->load(['user', 'project', 'activities.user', 'teamLead', 'hrUser']));
    }

    /**
     * Update/Edit a report.
     */
    public function update(Request $request, ProjectReport $report): JsonResponse
    {
        $user = $request->user();
        
        // Only owner can edit
        if ($report->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // STAFF can edit ONLY before HR final approval
        if ($report->status === 'approved') {
            return response()->json(['message' => 'Cannot edit a report after final HR approval.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'report_file' => 'nullable|file|max:20480',
        ]);

        $oldStatus = $report->status;
        $newStatus = 'submitted'; // Default to submitted if edited

        // If a report is edited after Team Lead approval, it must restart the approval process.
        $needsRestart = $report->status === 'tl_approved';

        if ($request->hasFile('report_file')) {
            $path = $request->file('report_file')->store('project-reports', 's3');
            $report->file_url = $path;
        }

        $report->fill([
            'title' => $validated['title'] ?? $report->title,
            'description' => $validated['description'] ?? $report->description,
            'status' => $newStatus,
            'tl_approved_at' => null, // Reset approval state
            'tl_user_id' => null,
        ]);

        $report->save();

        $comment = $needsRestart 
            ? 'Report edited after Team Lead approval. Restarting approval process.' 
            : 'Report updated.';

        $this->logActivity($report, $user, 'status_change', $oldStatus, $newStatus, $comment);

        return response()->json($report->load('user', 'project'));
    }

    /**
     * Team Lead Approval
     */
    public function tlApprove(Request $request, ProjectReport $report): JsonResponse
    {
        $user = $request->user();
        
        if ($user->role !== 'team-lead' && $user->role !== 'admin') {
            return response()->json(['message' => 'Only Team Leads can perform this action.'], 403);
        }

        // Validate TL department matches Staff department (unless admin)
        if ($user->role !== 'admin' && $user->department_id !== $report->user->department_id) {
            return response()->json(['message' => 'You can only approve reports for your own department.'], 403);
        }

        if ($report->status !== 'submitted' && $report->status !== 'rejected') {
            return response()->json(['message' => 'Report is not in a valid state for Team Lead approval.'], 400);
        }

        $oldStatus = $report->status;
        $report->update([
            'status' => 'tl_approved',
            'tl_approved_at' => now(),
            'tl_user_id' => $user->id,
        ]);

        $this->logActivity($report, $user, 'status_change', $oldStatus, 'tl_approved', $request->comment ?? 'Approved by Team Lead.');

        return response()->json($report->load('user', 'project'));
    }

    /**
     * HR Approval
     */
    public function hrApprove(Request $request, ProjectReport $report): JsonResponse
    {
        $user = $request->user();
        
        if ($user->role !== 'hr' && $user->role !== 'admin') {
            return response()->json(['message' => 'Only HR or Admins can perform final approval.'], 403);
        }

        // A report must first be approved by the Team Lead before going to HR.
        if ($report->status !== 'tl_approved') {
            return response()->json(['message' => 'Report must be approved by Team Lead before HR approval.'], 400);
        }

        $oldStatus = $report->status;
        $report->update([
            'status' => 'approved',
            'hr_approved_at' => now(),
            'hr_user_id' => $user->id,
        ]);

        $this->logActivity($report, $user, 'status_change', $oldStatus, 'approved', $request->comment ?? 'Final approval by HR.');

        return response()->json($report->load('user', 'project'));
    }

    /**
     * Reject report (TL or HR)
     */
    public function reject(Request $request, ProjectReport $report): JsonResponse
    {
        $user = $request->user();
        $request->validate(['comment' => 'required|string']);

        if (!in_array($user->role, ['team-lead', 'hr', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $oldStatus = $report->status;
        $report->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            // Clear approvals on rejection to force restart if needed
            'tl_approved_at' => null,
            'tl_user_id' => null,
        ]);

        $this->logActivity($report, $user, 'status_change', $oldStatus, 'rejected', $request->comment);

        return response()->json($report->load('user', 'project'));
    }

    /**
     * Add comment to a report
     */
    public function addComment(Request $request, ProjectReport $report): JsonResponse
    {
        $this->authorizeAccess($report);
        $request->validate(['comment' => 'required|string']);

        $activity = $this->logActivity($report, $request->user(), 'comment', null, null, $request->comment);

        return response()->json($activity->load('user'));
    }

    /**
     * Log report activity
     */
    protected function logActivity($report, $user, $type, $from, $to, $comment)
    {
        return ReportActivity::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'activity_type' => $type,
            'from_status' => $from,
            'to_status' => $to,
            'comment' => $comment,
        ]);
    }

    /**
     * Simple access check
     */
    protected function authorizeAccess(ProjectReport $report)
    {
        $user = auth()->user();
        if ($user->role === 'hr' || $user->role === 'admin') return;
        
        if ($user->role === 'team-lead') {
            if ($report->user_id === $user->id || $report->user->department_id === $user->department_id) return;
        }

        if ($report->user_id === $user->id) return;

        abort(403, 'Unauthorized');
    }
}
