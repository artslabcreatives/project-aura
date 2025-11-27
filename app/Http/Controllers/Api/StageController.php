<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Stage::with(['project', 'mainResponsible', 'backupResponsible1', 'backupResponsible2']);
        
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        
        $stages = $query->orderBy('order')->get();
        return response()->json($stages);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'color' => 'sometimes|string|max:255',
            'order' => 'sometimes|integer',
            'type' => 'sometimes|in:user,project',
            'project_id' => 'nullable|exists:projects,id',
            'main_responsible_id' => 'nullable|exists:users,id',
            'backup_responsible_id_1' => 'nullable|exists:users,id',
            'backup_responsible_id_2' => 'nullable|exists:users,id',
            'is_review_stage' => 'sometimes|boolean',
            'linked_review_stage_id' => 'nullable|exists:stages,id',
            'approved_target_stage_id' => 'nullable|exists:stages,id',
        ]);

        $stage = Stage::create($validated);
        return response()->json($stage->load(['project', 'mainResponsible']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Stage $stage): JsonResponse
    {
        return response()->json($stage->load(['project', 'mainResponsible', 'backupResponsible1', 'backupResponsible2', 'tasks']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Stage $stage): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'color' => 'sometimes|string|max:255',
            'order' => 'sometimes|integer',
            'type' => 'sometimes|in:user,project',
            'project_id' => 'nullable|exists:projects,id',
            'main_responsible_id' => 'nullable|exists:users,id',
            'backup_responsible_id_1' => 'nullable|exists:users,id',
            'backup_responsible_id_2' => 'nullable|exists:users,id',
            'is_review_stage' => 'sometimes|boolean',
            'linked_review_stage_id' => 'nullable|exists:stages,id',
            'approved_target_stage_id' => 'nullable|exists:stages,id',
        ]);

        $stage->update($validated);
        return response()->json($stage->load(['project', 'mainResponsible']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stage $stage): JsonResponse
    {
        $stage->delete();
        return response()->json(null, 204);
    }
}
