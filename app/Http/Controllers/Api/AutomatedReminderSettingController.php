<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutomatedReminderSetting;
use App\Models\Project;
use App\Models\HistoryEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AutomatedReminderSettingController extends Controller
{
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

    public function auditLogs(): JsonResponse
    {
        $logs = HistoryEntry::whereIn('action', ['updated_automated_reminder_setting', 'updated_project_reminder_override'])
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}
