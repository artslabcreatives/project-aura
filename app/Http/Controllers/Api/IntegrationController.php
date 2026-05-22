<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\AutomatedReminderSetting;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class IntegrationController extends Controller
{
    #[OA\Get(
        path: "/n8n/grace-periods",
        summary: "Get expiring grace periods (N8N webhook)",
        description: "Returns projects with grace periods expiring soon. Secured via N8N_WEBHOOK_SECRET bearer token.",
        security: [["bearerAuth" => []]],
        tags: ["Integrations"],
        responses: [
            new OA\Response(response: 200, description: "Projects with expiring grace periods"),
            new OA\Response(response: 401, description: "Unauthorized — invalid webhook secret"),
        ]
    )]
    public function expiringGracePeriods(Request $request): JsonResponse
    {
        $secret = config('services.n8n.webhook_secret');

        if (!$secret || $request->bearerToken() !== $secret) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $setting = AutomatedReminderSetting::where('type', 'grace_period_expiry')->first();
        $defaultDaysBefore = $setting && is_array($setting->days_before) ? $setting->days_before : [7, 3, 1];
        $cutoff = Carbon::today()->addDays(max($defaultDaysBefore));

        // ─── Resolve notification recipients ───────────────────────────────────
        // Read the list from SystemSetting (admin-configurable). Each entry has
        // 'email' (required) and 'name' (optional) keys.
        $recipients = \App\Models\SystemSetting::getJson('grace_period_reminder_recipients');

        // Fall back to the env-based defaults when no DB value is set yet.
        if (empty($recipients)) {
            $fallbackEmail = env('AUTOMATED_REMINDER_RECIPIENT_EMAIL', 'admin@artslabcreatives.com');
            $fallbackName  = env('AUTOMATED_REMINDER_RECIPIENT_NAME', 'Admin');
            $recipients    = [['email' => $fallbackEmail, 'name' => $fallbackName]];
        }
        // ───────────────────────────────────────────────────────────────────────

        $projects = Project::query()
            ->where('is_locked_by_po', true)
            ->whereNotNull('grace_period_expires_at')
            ->where(function ($query) use ($cutoff) {
                // Determine the largest cutoff value for general filtering
                $query->whereNotNull('manual_reminder_date')
                      ->where('manual_reminder_date', '<=', Carbon::today())
                      ->orWhere(function ($q) use ($cutoff) {
                          $q->whereNull('manual_reminder_date')
                            ->where('grace_period_expires_at', '<=', $cutoff);
                      });
            })
            ->get();

        $data = [];

        foreach ($projects as $project) {
            $lastSent = $project->last_automated_reminder_sent_at;
            
            // Skip if already sent today
            if ($lastSent && $lastSent->isToday()) {
                continue;
            }

            $shouldSend = false;
            $daysRemaining = Carbon::today()->diffInDays($project->grace_period_expires_at, false);

            if ($project->manual_reminder_date) {
                if ($project->manual_reminder_date <= Carbon::today()) {
                    $shouldSend = true;
                }
            } else {
                $triggerDays = $project->manual_reminder_days ?? $defaultDaysBefore;
                // If daysRemaining is exactly one of the trigger days, send it.
                if (in_array((int)$daysRemaining, $triggerDays)) {
                    $shouldSend = true;
                }
            }

            if ($shouldSend) {
                // Fan out one entry per recipient so n8n can send a separate email to each.
                foreach ($recipients as $recipient) {
                    $data[] = [
                        'project_id'           => $project->id,
                        'project_name'         => $project->name,
                        'project_code'         => $project->project_code,
                        'expires_at'           => $project->grace_period_expires_at->toDateString(),
                        'days_remaining'       => $daysRemaining,
                        'manual_reminder_date' => $project->manual_reminder_date,
                        'manual_reminder_days' => $project->manual_reminder_days,
                        'recipient_email'      => $recipient['email'],
                        'recipient_name'       => $recipient['name'] ?? 'Admin',
                    ];
                }

                // Update last sent time (once per project, not once per recipient)
                $project->last_automated_reminder_sent_at = Carbon::now();
                $project->save();
            }
        }

        return response()->json(['data' => $data]);
    }
}
