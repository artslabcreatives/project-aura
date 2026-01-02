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

    /**
     * Get suggested tasks for the project.
     */
    public function suggestedTasks(Project $project): JsonResponse
    {
        return response()->json($project->suggestedTasks);
    }

	/**
	 * Create a new suggested task for the project.
	 */
	public function createSuggestedTasks(Request $request, Project $project): JsonResponse
	{
		$validated = $request->validate([
			'title' => 'required|string|max:255',
			'description' => 'nullable|string',
			'project_stage_id' => 'nullable|exists:stages,id',
			'assignee_id' => 'nullable|exists:users,id',
			'original_assignee_id' => 'nullable|exists:users,id',
		]);
		$suggestedTask = $project->tasks()->create($validated);
		return response()->json($suggestedTask, 201);
	}

    /**
     * Search projects by WhatsApp Group ID.
     */
    public function searchByWhatsapp(Request $request): JsonResponse
    {
        $request->validate([
            'group_id' => 'required|string',
        ]);

        $groupId = $request->input('group_id');

        // Search in the phone_numbers JSON column
        // Assuming phone_numbers is an array of strings or objects. 
        // If it's a simple array of strings: JSON_CONTAINS(phone_numbers, '"groupId"')
        // But user said "phone_numbers json has the whatsapp group id". 
        // It might be a key-value pair or just one of the values.
        // Let's assume it's one of the values in the array for now, or we can use whereJsonContains.
        
        $projects = Project::whereJsonContains('phone_numbers', $groupId)
            ->with(['department', 'stages', 'tasks'])
            ->get();

        return response()->json($projects);
    }

	//get tasks
}
