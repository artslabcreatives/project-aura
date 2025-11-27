<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $projects = Project::with(['department', 'stages', 'tasks'])->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'emails' => 'nullable|array',
            'emails.*' => 'email',
            'phone_numbers' => 'nullable|array',
            'phone_numbers.*' => 'string',
        ]);

        $project = Project::create($validated);
        return response()->json($project->load(['department', 'stages']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): JsonResponse
    {
        return response()->json($project->load(['department', 'stages', 'tasks']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'emails' => 'nullable|array',
            'emails.*' => 'email',
            'phone_numbers' => 'nullable|array',
            'phone_numbers.*' => 'string',
        ]);

        $project->update($validated);
        return response()->json($project->load(['department', 'stages']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): JsonResponse
    {
        $project->delete();
        return response()->json(null, 204);
    }
}
