<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RevisionHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RevisionHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RevisionHistory::with(['task', 'requestedBy']);
        
        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }
        
        $revisions = $query->orderByDesc('requested_at')->get();
        return response()->json($revisions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'comment' => 'required|string',
            'requested_by_id' => 'required|exists:users,id',
        ]);

        $revision = RevisionHistory::create($validated);
        return response()->json($revision->load(['task', 'requestedBy']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RevisionHistory $revisionHistory): JsonResponse
    {
        return response()->json($revisionHistory->load(['task', 'requestedBy']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RevisionHistory $revisionHistory): JsonResponse
    {
        $validated = $request->validate([
            'comment' => 'sometimes|required|string',
            'resolved_at' => 'nullable|date',
        ]);

        $revisionHistory->update($validated);
        return response()->json($revisionHistory);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RevisionHistory $revisionHistory): JsonResponse
    {
        $revisionHistory->delete();
        return response()->json(null, 204);
    }
}
