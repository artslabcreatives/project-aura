<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Reminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReminderOverrideController extends Controller
{
    public function override(Request $request, Reminder $reminder): JsonResponse
    {
        $validated = $request->validate([
            'reminder_at'             => 'sometimes|required|date',
            'reminder_frequency_days' => 'sometimes|nullable|integer|min:1',
        ]);

        $user = $request->user();
        $now = now();
        $fields = [];

        if (isset($validated['reminder_at'])) {
            $this->writeAuditLog($user->id, $reminder, 'reminder_at', $reminder->reminder_at, $validated['reminder_at']);
            $fields['reminder_at'] = $validated['reminder_at'];
        }

        if (array_key_exists('reminder_frequency_days', $validated)) {
            $this->writeAuditLog($user->id, $reminder, 'reminder_frequency_days', $reminder->reminder_frequency_days, $validated['reminder_frequency_days']);
            $fields['reminder_frequency_days'] = $validated['reminder_frequency_days'];
        }

        $reminder->update(array_merge($fields, [
            'is_overridden'  => true,
            'overridden_by'  => $user->id,
            'overridden_at'  => $now,
        ]));

        return response()->json($reminder->fresh(['user', 'overriddenBy']));
    }

    public function revert(Reminder $reminder): JsonResponse
    {
        $user = auth()->user();

        $this->writeAuditLog($user->id, $reminder, 'is_overridden', true, false);

        $reminder->update([
            'is_overridden'           => false,
            'overridden_by'           => null,
            'overridden_at'           => null,
            'reminder_frequency_days' => null,
        ]);

        return response()->json($reminder->fresh(['user']));
    }

    private function writeAuditLog(int $userId, Reminder $reminder, string $field, $old, $new): void
    {
        AuditLog::create([
            'user_id'      => $userId,
            'entity_type'  => Reminder::class,
            'entity_id'    => $reminder->id,
            'action'       => 'reminder_override',
            'field_changed'=> $field,
            'old_value'    => $old !== null ? (string) $old : null,
            'new_value'    => $new !== null ? (string) $new : null,
        ]);
    }
}
