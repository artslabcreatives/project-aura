<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HistoryEntry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HistoryEntryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = HistoryEntry::with(['user', 'project']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }
        
        if ($request->has('entity_id')) {
            $query->where('entity_id', $request->entity_id);
        }
        
        $entries = $query->orderByDesc('timestamp')->get();
        return response()->json($entries);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'action' => 'required|string|max:255',
            'entity_id' => 'required|integer',
            'entity_type' => 'required|in:task,stage,project',
            'project_id' => 'required|exists:projects,id',
            'details' => 'nullable|array',
        ]);

        $entry = HistoryEntry::create($validated);
        return response()->json($entry->load(['user', 'project']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(HistoryEntry $historyEntry): JsonResponse
    {
        return response()->json($historyEntry->load(['user', 'project']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HistoryEntry $historyEntry): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'sometimes|required|string|max:255',
            'details' => 'nullable|array',
        ]);

        $historyEntry->update($validated);
        return response()->json($historyEntry);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HistoryEntry $historyEntry): JsonResponse
    {
        $historyEntry->delete();
        return response()->json(null, 204);
    }
}
