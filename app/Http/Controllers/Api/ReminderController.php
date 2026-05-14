<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use OpenApi\Attributes as OA;

class ReminderController extends Controller
{
    #[OA\Get(
        path: "/reminders",
        summary: "List reminders",
        description: "Returns active (unread) and paginated completed (read) reminders for the authenticated user",
        security: [["bearerAuth" => []]],
        tags: ["Reminders"],
        responses: [
            new OA\Response(response: 200, description: "Active and completed reminders"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        $user_id = $request->user()->id;

        // Active reminders: All unread, ordered by soonest first
        $active = Reminder::where('user_id', $user_id)
            ->where('is_read', false)
            ->orderBy('reminder_at', 'asc')
            ->get();

        // Completed reminders: Read only, ordered by most recent first, paginated 6 per page
        $completed = Reminder::where('user_id', $user_id)
            ->where('is_read', true)
            ->orderBy('reminder_at', 'desc')
            ->paginate(6);

        return response()->json([
            'active' => $active,
            'completed' => $completed
        ]);
    }

    #[OA\Post(
        path: "/reminders",
        summary: "Create reminder",
        security: [["bearerAuth" => []]],
        tags: ["Reminders"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title", "reminder_at"],
                properties: [
                    new OA\Property(property: "title", type: "string", maxLength: 255),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "reminder_at", type: "string", format: "date-time"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Reminder created"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reminder_at' => 'required|date',
            // frontend sends ISO string, Laravel parses it. 
            // If user meant "LKR", they should select LKR time in UI, converted to UTC/ISO.
        ]);

        $reminder = Reminder::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'reminder_at' => Carbon::parse($validated['reminder_at']),
        ]);

        return response()->json($reminder, 201);
    }

    #[OA\Get(
        path: "/reminders/{reminder}",
        summary: "Get reminder",
        security: [["bearerAuth" => []]],
        tags: ["Reminders"],
        parameters: [new OA\Parameter(name: "reminder", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Reminder details"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function show(Reminder $reminder)
    {
        $this->authorize('view', $reminder);
        return response()->json($reminder);
    }

    #[OA\Put(
        path: "/reminders/{reminder}",
        summary: "Update reminder",
        security: [["bearerAuth" => []]],
        tags: ["Reminders"],
        parameters: [new OA\Parameter(name: "reminder", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "title", type: "string", maxLength: 255),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "reminder_at", type: "string", format: "date-time"),
                    new OA\Property(property: "is_read", type: "boolean"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Updated reminder"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function update(Request $request, Reminder $reminder)
    {
        // Policy check needed but for now simple check
        if ($reminder->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'reminder_at' => 'sometimes|required|date',
            'is_read' => 'sometimes|boolean',
        ]);

        if (isset($validated['reminder_at'])) {
            $validated['reminder_at'] = Carbon::parse($validated['reminder_at']);
        }

        $reminder->update($validated);

        return response()->json($reminder);
    }

    #[OA\Delete(
        path: "/reminders/{reminder}",
        summary: "Delete reminder",
        security: [["bearerAuth" => []]],
        tags: ["Reminders"],
        parameters: [new OA\Parameter(name: "reminder", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 204, description: "Deleted"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function destroy(Request $request, Reminder $reminder)
    {
        if ($reminder->user_id !== $request->user()->id) {
            abort(403);
        }

        $reminder->delete();

        return response()->json(null, 204);
    }
}
