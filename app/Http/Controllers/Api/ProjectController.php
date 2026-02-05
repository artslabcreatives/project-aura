<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProjectController extends Controller
{
    #[OA\Get(
        path: "/projects",
        summary: "List all projects",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of projects",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: "id", type: "integer"),
                            new OA\Property(property: "name", type: "string"),
                            new OA\Property(property: "description", type: "string"),
                            new OA\Property(property: "department", type: "object"),
                            new OA\Property(property: "stages", type: "array", items: new OA\Items(type: "object")),
                            new OA\Property(property: "tasks", type: "array", items: new OA\Items(type: "object"))
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(): JsonResponse
    {
        $projects = Project::with(['department', 'group', 'stages' => function ($query) {
            $query->where('type', 'project');
        }, 'tasks'])->get();
        return response()->json($projects);
    }

    #[OA\Post(
        path: "/projects",
        summary: "Create a new project",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "New Website Project"),
                    new OA\Property(property: "description", type: "string", example: "Build a modern website"),
                    new OA\Property(property: "department_id", type: "integer", example: 1),
                    new OA\Property(property: "emails", type: "array", items: new OA\Items(type: "string", format: "email")),
                    new OA\Property(property: "phone_numbers", type: "array", items: new OA\Items(type: "string")),
                    new OA\Property(property: "project_group_id", type: "integer", example: 1)
                ]
            )
        ),
        tags: ["Projects"],
        responses: [
            new OA\Response(
                response: 201,
                description: "Project created successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "name", type: "string"),
                        new OA\Property(property: "description", type: "string"),
                        new OA\Property(property: "department", type: "object"),
                        new OA\Property(property: "group", type: "object"),
                        new OA\Property(property: "stages", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
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
            'project_group_id' => 'nullable|exists:project_groups,id',
        ]);

        $project = Project::create($validated);

        // Notify Admins
        try {
            $admins = \App\Models\User::where('role', 'admin')->get();
            if ($admins->isNotEmpty()) {
                \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\ProjectCreatedNotification($project));
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Illuminate\Support\Facades\Log::error('Failed to send project notification: ' . $e->getMessage());
        }

        return response()->json($project->load(['department', 'group', 'stages' => function ($query) {
            $query->where('type', 'project');
        }]), 201);
    }

    #[OA\Get(
        path: "/projects/{id}",
        summary: "Get project by ID",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "Project ID",
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Project details",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "name", type: "string"),
                        new OA\Property(property: "description", type: "string"),
                        new OA\Property(property: "department", type: "object"),
                        new OA\Property(property: "group", type: "object"),
                        new OA\Property(property: "stages", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "tasks", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Project not found")
        ]
    )]
    public function show(Project $project): JsonResponse
    {
        return response()->json($project->load(['department', 'group', 'stages' => function ($query) {
            $query->where('type', 'project');
        }, 'tasks']));
    }

    #[OA\Put(
        path: "/projects/{id}",
        summary: "Update project",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "department_id", type: "integer", nullable: true),
                    new OA\Property(property: "emails", type: "array", items: new OA\Items(type: "string", format: "email")),
                    new OA\Property(property: "phone_numbers", type: "array", items: new OA\Items(type: "string")),
                    new OA\Property(property: "project_group_id", type: "integer", nullable: true),
                    new OA\Property(property: "is_archived", type: "boolean")
                ]
            )
        ),
        tags: ["Projects"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Project updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Project not found")
        ]
    )]
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
            'project_group_id' => 'nullable|exists:project_groups,id',
            'is_archived' => 'nullable|boolean',
        ]);

        $wasArchived = $project->is_archived;
        $project->update($validated);
        
        $action = 'update';
        if (isset($validated['is_archived'])) {
            if ($validated['is_archived'] && !$wasArchived) {
                $action = 'archive';
            } elseif (!$validated['is_archived'] && $wasArchived) {
                $action = 'unarchive';
            }
        }

        try {
            \App\Events\ProjectUpdated::dispatch($project, $action);
        } catch (\Exception $e) {
            // Log error but continue
            \Illuminate\Support\Facades\Log::error('Failed to broadcast project update: ' . $e->getMessage());
        }

        return response()->json($project->load(['department', 'group', 'stages' => function ($query) {
            $query->where('type', 'project');
        }]));
    }

    #[OA\Delete(
        path: "/projects/{id}",
        summary: "Delete project",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "Project deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Project not found")
        ]
    )]
    public function destroy(Project $project): JsonResponse
    {
        $project->delete();
        return response()->json(null, 204);
    }

    #[OA\Get(
        path: "/projects/{id}/suggested-tasks",
        summary: "Get suggested tasks for a project",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "List of suggested tasks"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Project not found")
        ]
    )]
    public function suggestedTasks(Project $project): JsonResponse
    {
        return response()->json($project->suggestedTasks);
    }

	#[OA\Post(
        path: "/projects/{id}/suggested-tasks",
        summary: "Create a suggested task for a project",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title"],
                properties: [
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "project_stage_id", type: "integer", nullable: true),
                    new OA\Property(property: "assignee_id", type: "integer", nullable: true)
                ]
            )
        ),
        tags: ["Projects"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 201, description: "Suggested task created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Project not found")
        ]
    )]
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

    #[OA\Get(
        path: "/projects/search/whatsapp",
        summary: "Search projects by WhatsApp group ID",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        parameters: [
            new OA\Parameter(
                name: "group_id",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Projects found"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
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
            ->with(['department', 'stages' => function ($query) {
                $query->where('type', 'project');
            }, 'tasks'])
            ->get();

        return response()->json($projects);
    }

	#[OA\Get(
        path: "/projects/search/email",
        summary: "Search projects by email",
        security: [["bearerAuth" => []]],
        tags: ["Projects"],
        parameters: [
            new OA\Parameter(
                name: "email",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string", format: "email")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Projects found"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
	//get tasks
	//get tasks by email
	public function searchByEmail(Request $request): JsonResponse
	{
		$request->validate([
			'email' => 'required|email',
		]);

		$email = $request->input('email');

		$projects = Project::whereJsonContains('emails', $email)
			->with(['department', 'stages' => function ($query) {
				$query->where('type', 'project');
			}, 'tasks'])
			->get();	
		return response()->json($projects);
	}
}
