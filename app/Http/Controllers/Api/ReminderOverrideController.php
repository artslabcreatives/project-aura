<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Reminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ReminderOverrideController extends Controller
{
    #[OA\Patch(
        path: "/reminders/{reminder}/override",
        summary: "Override reminder schedule",
        description: "Override the date and/or frequency of a reminder with an audit trail",
        security: [["bearerAuth" => []]],
        tags: ["Reminders"],
        parameters: [
            new OA\Parameter(name: "reminder", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "reminder_at", type: "string", format: "date-time"),
                    new OA\Property(property: "reminder_frequency_days", type: "integer", nullable: true, minimum: 1),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Updated reminder"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
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

    #[OA\Delete(
        path: "/reminders/{reminder}/override",
        summary: "Revert reminder override",
        description: "Removes an override and returns the reminder to its original schedule",
        security: [["bearerAuth" => []]],
        tags: ["Reminders"],
        parameters: [
            new OA\Parameter(name: "reminder", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Reminder with override removed"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
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
