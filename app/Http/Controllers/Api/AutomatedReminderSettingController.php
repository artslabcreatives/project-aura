<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutomatedReminderSetting;
use App\Models\Project;
use App\Models\HistoryEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class AutomatedReminderSettingController extends Controller
{
    #[OA\Get(
        path: "/automated-reminder-settings",
        summary: "Get automated reminder settings",
        description: "Returns all automated reminder settings and projects with overrides",
        security: [["bearerAuth" => []]],
        tags: ["Automated Reminders"],
        responses: [
            new OA\Response(response: 200, description: "Settings and project overrides"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(): JsonResponse
    {
        $settings = AutomatedReminderSetting::all();
        $projects = Project::where('is_locked_by_po', true)
            ->whereNotNull('grace_period_expires_at')
            ->select('id', 'name', 'project_code', 'grace_period_expires_at', 'manual_reminder_date', 'manual_reminder_frequency_days')
            ->get();

        return response()->json([
            'settings' => $settings,
            'projects_with_overrides' => $projects,
        ]);
    }

    #[OA\Patch(
        path: "/automated-reminder-settings/{setting}",
        summary: "Update reminder setting",
        description: "Update days_before schedule and/or active status for a reminder type (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Automated Reminders"],
        parameters: [
            new OA\Parameter(name: "setting", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "days_before", type: "array", items: new OA\Items(type: "integer")),
                    new OA\Property(property: "is_active", type: "boolean"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Updated setting"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function updateSetting(Request $request, AutomatedReminderSetting $setting): JsonResponse
    {
        $this->authorizeRole(['admin', 'hr']);

        $validated = $request->validate([
            'days_before' => 'sometimes|required|array',
            'days_before.*' => 'integer|min:0',
            'is_active' => 'sometimes|required|boolean',
        ]);

        $oldValues = $setting->only(array_keys($validated));
        $setting->update($validated);

        HistoryEntry::create([
            'user_id' => $request->user()->id,
            'action' => 'updated_automated_reminder_setting',
            'entity_id' => $setting->id,
            'entity_type' => AutomatedReminderSetting::class,
            'details' => [
                'type' => $setting->type,
                'old' => $oldValues,
                'new' => $validated,
            ],
        ]);

        return response()->json($setting);
    }

    #[OA\Patch(
        path: "/projects/{project}/reminder-override",
        summary: "Override project reminder settings",
        description: "Set a manual reminder date/frequency for a specific project (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Automated Reminders"],
        parameters: [
            new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "manual_reminder_date", type: "string", format: "date", nullable: true),
                    new OA\Property(property: "manual_reminder_days", type: "array", nullable: true, items: new OA\Items(type: "integer")),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Updated project"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function updateProjectOverride(Request $request, Project $project): JsonResponse
    {
        $this->authorizeRole(['admin', 'hr']);

        $validated = $request->validate([
            'manual_reminder_date' => 'nullable|date',
            'manual_reminder_days' => 'nullable|array',
            'manual_reminder_days.*' => 'integer|min:0',
        ]);

        $oldValues = [
            'manual_reminder_date' => $project->manual_reminder_date,
            'manual_reminder_frequency_days' => $project->manual_reminder_frequency_days,
        ];

        $project->update($validated);

        HistoryEntry::create([
            'user_id' => $request->user()->id,
            'action' => 'updated_project_reminder_override',
            'project_id' => $project->id,
            'entity_id' => $project->id,
            'entity_type' => Project::class,
            'details' => [
                'old' => $oldValues,
                'new' => $validated,
            ],
        ]);

        return response()->json($project);
    }

    private function authorizeRole(array $roles)
    {
        if (!in_array(auth()->user()->role, $roles)) {
            abort(403, 'Unauthorized');
        }
    }

    #[OA\Get(
        path: "/automated-reminder-settings/audit-logs",
        summary: "Get reminder audit logs",
        description: "Returns audit history of reminder setting changes",
        security: [["bearerAuth" => []]],
        tags: ["Automated Reminders"],
        responses: [
            new OA\Response(response: 200, description: "Audit log entries"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function auditLogs(): JsonResponse
    {
        $logs = HistoryEntry::whereIn('action', ['updated_automated_reminder_setting', 'updated_project_reminder_override'])
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}
