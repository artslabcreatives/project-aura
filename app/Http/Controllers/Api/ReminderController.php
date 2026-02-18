<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReminderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
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

    /**
     * Store a newly created resource in storage.
     */
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

    /**
     * Display the specified resource.
     */
    public function show(Reminder $reminder)
    {
        $this->authorize('view', $reminder);
        return response()->json($reminder);
    }

    /**
     * Update the specified resource in storage.
     */
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Reminder $reminder)
    {
        if ($reminder->user_id !== $request->user()->id) {
            abort(403);
        }

        $reminder->delete();

        return response()->json(null, 204);
    }
}
