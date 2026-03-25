<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationController extends Controller
{
    /**
     * Return projects whose grace period expires within 7 days (or is already overdue).
     * Secured via a shared secret in the N8N_WEBHOOK_SECRET env variable.
     */
    public function expiringGracePeriods(Request $request): JsonResponse
    {
        $secret = config('services.n8n.webhook_secret');

        if (!$secret || $request->bearerToken() !== $secret) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $cutoff = Carbon::today()->addDays(7);

        $projects = Project::query()
            ->where('is_locked_by_po', true)
            ->whereNotNull('grace_period_expires_at')
            ->where('grace_period_expires_at', '<=', $cutoff)
            ->with('gracePeriodApprover:id,name,email')
            ->get();

        $data = $projects->map(function (Project $project) {
            $daysRemaining = Carbon::today()->diffInDays($project->grace_period_expires_at, false);

            return [
                'project_id'      => $project->id,
                'project_name'    => $project->name,
                'project_code'    => $project->project_code,
                'expires_at'      => $project->grace_period_expires_at->toDateString(),
                'days_remaining'  => $daysRemaining,
                'recipient_email' => 'shashithrashmikapiyathilaka@gmail.com',
                'recipient_name' => 'admin',
            ];
        });

        return response()->json(['data' => $data]);
    }
}
