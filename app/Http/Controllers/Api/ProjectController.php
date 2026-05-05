<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ProvisionalPoMailable;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
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
        $user = auth()->user();
        $version = Cache::rememberForever('projects_version', fn() => time());
        $cacheKey = "projects_user_{$user->id}_{$user->role}_v{$version}";

        $projects = Cache::remember($cacheKey, 3600, function() use ($user) {
            $query = Project::query()
                ->select([
                    'id', 'name', 'status', 'is_archived', 'department_id', 
                    'client_id', 'project_group_id', 'deadline', 
                    'is_internal_project', 'project_code'
                ])
                ->with([
                    'department:id,name',
                    'group:id,name,department_id',
                    'client:id,name',
                    'stages' => function ($query) {
                        $query->select(['id', 'title', 'project_id', 'color', 'type', 'order'])
                              ->where('type', 'project');
                    },
                    'collaborators' => function ($query) {
                        $query->select('users.id', 'users.name', 'users.email', 'users.department_id', 'users.role');
                    }
                ])
                ->withExists(['tasks as has_overdue_tasks' => function ($query) {
                    $query->where('due_date', '<', now())
                        ->where('user_status', '!=', 'complete')
                        ->whereHas('projectStage', function ($q) {
                            $q->whereNotIn('title', ['completed', 'complete', 'archive']);
                        });
                }]);

            if (in_array($user->role, ['user', 'account_manager'])) {
                $query->where(function ($q) use ($user) {
                    $q->whereHas('tasks', function ($taskQuery) use ($user) {
                        $taskQuery->where('assignee_id', $user->id)
                            ->orWhereHas('assignedUsers', function ($sq) use ($user) {
                                $sq->where('users.id', $user->id);
                            });
                    })
                    ->orWhereHas('collaborators', function ($collabQuery) use ($user) {
                        $collabQuery->where('users.id', $user->id);
                    });
                });

                // For these roles, we only count the tasks that are relevant to them
                $query->withCount(['tasks' => function ($taskQuery) use ($user) {
                    $taskQuery->where('assignee_id', $user->id)
                        ->orWhereHas('assignedUsers', function ($sq) use ($user) {
                            $sq->where('users.id', $user->id);
                        });
                }]);
            } else {
                $query->withCount('tasks');
            }

            return $query->get();
        });

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
                    new OA\Property(property: "estimated_hours", type: "number", example: 40),
                    new OA\Property(property: "status", type: "string", example: "active"),
                    new OA\Property(property: "is_internal_project", type: "boolean", example: false),
                    new OA\Property(property: "po_number", type: "string", example: "PO-123"),
                    new OA\Property(property: "deadline", type: "string", format: "date", example: "2024-12-31"),
                    new OA\Property(property: "project_group_id", type: "integer", example: 1),
                    new OA\Property(property: "client_id", type: "integer", example: 1, nullable: true)
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
                        new OA\Property(property: "client", type: "object"),
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
            'client_id' => 'nullable|exists:clients,id',
            'estimate_id' => 'nullable|exists:estimates,id',
            'estimated_hours' => 'nullable|integer',
            'status' => 'nullable|string|in:active,on-hold,completed,cancelled,suggested,blocked',
            'po_number' => 'nullable|string|max:255',
            'deadline' => 'nullable|date',
            'po_document' => 'nullable|file|max:10240', // Max 10MB
            'invoice_number' => 'nullable|string|max:255',
            'invoice_document' => 'nullable|file|max:10240',
            'provisional_po_expires_at' => 'nullable|date',
            'is_physical_invoice' => 'nullable|boolean',
            'courier_tracking_number' => 'nullable|string|max:255',
            'is_internal_project' => 'nullable|boolean',
        ]);

        if ($request->hasFile('po_document')) {
            $path = $request->file('po_document')->store('purchase-orders', 's3');
            $validated['po_document'] = $path;
            $validated['is_locked_by_po'] = false;
        } elseif ($request->filled('po_number')) {
            $validated['is_locked_by_po'] = false;
        }

        if ($request->hasFile('invoice_document')) {
            $path = $request->file('invoice_document')->store('invoices', 's3');
            $validated['invoice_document'] = $path;
        }

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

        // Email client when provisional PO is raised
        if ($request->hasFile('po_document') && $project->client_id) {
            try {
                $project->load('client.contacts', 'collaborators');
                $clientEmail = $this->resolveClientEmail($project);
                if ($clientEmail) {
                    Mail::to($clientEmail)->queue(new ProvisionalPoMailable($project));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send provisional PO email: ' . $e->getMessage());
            }
        }

        return response()->json($project->load(['department', 'group', 'client', 'stages' => function ($query) {
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
                        new OA\Property(property: "client", type: "object"),
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
        $user = auth()->user();
        $version = Cache::rememberForever('projects_version', fn() => time());
        $cacheKey = "project_{$project->id}_user_{$user->id}_{$user->role}_v{$version}";

        $projectData = Cache::remember($cacheKey, 3600, function() use ($user, $project) {
            // Authorization check for user and account_manager roles
            if (in_array($user->role, ['user', 'account_manager'])) {
                $isAssigned = $project->tasks()->where(function($q) use ($user) {
                    $q->where('assignee_id', $user->id)
                      ->orWhereHas('assignedUsers', function($sq) use ($user) {
                          $sq->where('users.id', $user->id);
                      });
                })->exists() || $project->collaborators()->where('users.id', $user->id)->exists();

                if (!$isAssigned) {
                    return ['unauthorized' => true];
                }
            }

            $project->load(['department', 'group', 'client', 'stages' => function ($query) {
                $query->where('type', 'project');
            }, 'collaborators' => function ($query) {
                $query->select('users.id', 'users.name', 'users.email', 'users.department_id', 'users.role');
            }]);

            // Filter tasks relationship for user and account_manager
            if (in_array($user->role, ['user', 'account_manager'])) {
                $project->load(['tasks' => function ($query) use ($user) {
                    $query->where('assignee_id', $user->id)
                        ->orWhereHas('assignedUsers', function ($sq) use ($user) {
                            $sq->where('users.id', $user->id);
                        });
                }]);
            } else {
                $project->load('tasks');
            }

            return $project;
        });

        if (is_array($projectData) && isset($projectData['unauthorized'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($projectData);
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
            'client_id' => 'nullable|exists:clients,id',
            'estimate_id' => 'nullable|exists:estimates,id',
            'estimated_hours' => 'nullable|integer',
            'status' => 'nullable|string|in:active,on-hold,completed,cancelled,suggested,blocked',
            'po_number' => 'nullable|string|max:255',
            'po_document' => 'nullable|file|max:10240',
            'invoice_number' => 'nullable|string|max:255',
            'invoice_document' => 'nullable|file|max:10240',
            'provisional_po_expires_at' => 'nullable|date',
            'is_physical_invoice' => 'nullable|boolean',
            'courier_tracking_number' => 'nullable|string|max:255',
            'courier_delivery_status' => 'nullable|string|max:255',
            'is_internal_project' => 'nullable|boolean',
            'budget_allocated' => 'nullable|numeric|min:0',
        ]);

        $wasArchived = $project->is_archived;
        $hadPoDocument = (bool) $project->po_document;
        $oldStatus = $project->status;

        if ($request->hasFile('po_document')) {
            $path = $request->file('po_document')->store('purchase-orders', 's3');
            $validated['po_document'] = $path;
            $validated['is_locked_by_po'] = false;
        } elseif ($request->filled('po_number')) {
            $validated['is_locked_by_po'] = false;
        }

        if ($request->hasFile('invoice_document')) {
            // For Digital Marketing projects, require campaign report approval first
            if ($project->department?->name === 'Digital Marketing' && !$project->isCampaignReportApproved()) {
                return response()->json([
                    'message' => 'Campaign report must be approved before uploading invoice for Digital Marketing projects.'
                ], 403);
            }

            $path = $request->file('invoice_document')->store('invoices', 's3');
            $validated['invoice_document'] = $path;

            // Send email notification to client only if NOT a physical invoice
            $isPhysical = $request->input('is_physical_invoice') ?? $project->is_physical_invoice;
            if (!$isPhysical && $project->client && $project->client->email) {
                \Illuminate\Support\Facades\Mail::to($project->client->email)
                    ->send(new \App\Mail\InvoiceUploadedMailable($project));
            }
        }

        $project->update($validated);

        // Dispatch status cascade event if status changed
        if (isset($validated['status']) && $validated['status'] !== $oldStatus) {
            \App\Events\ProjectStatusChanged::dispatch($project, $oldStatus, $validated['status']);
        }

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

        // Email client when provisional PO is raised for the first time via update
        if ($request->hasFile('po_document') && !$hadPoDocument && $project->client_id) {
            try {
                $project->load('client.contacts', 'collaborators');
                $clientEmail = $this->resolveClientEmail($project);
                if ($clientEmail) {
                    Mail::to($clientEmail)->queue(new ProvisionalPoMailable($project));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send provisional PO email: ' . $e->getMessage());
            }
        }

        return response()->json($project->load(['department', 'group', 'client', 'stages' => function ($query) {
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
        
        $projectsQuery = Project::whereJsonContains('phone_numbers', $groupId)
            ->with(['department', 'stages' => function ($query) {
                $query->where('type', 'project');
            }]);

        if (in_array($user->role, ['user', 'account_manager'])) {
            $projectsQuery->where(function ($q) use ($user) {
                $q->whereHas('tasks', function ($taskQuery) use ($user) {
                    $taskQuery->where('assignee_id', $user->id)
                        ->orWhereHas('assignedUsers', function ($sq) use ($user) {
                            $sq->where('users.id', $user->id);
                        });
                })
                ->orWhereHas('collaborators', function ($collabQuery) use ($user) {
                    $collabQuery->where('users.id', $user->id);
                });
            });

            $projectsQuery->with(['tasks' => function ($taskQuery) use ($user) {
                $taskQuery->where('assignee_id', $user->id)
                    ->orWhereHas('assignedUsers', function ($sq) use ($user) {
                        $sq->where('users.id', $user->id);
                    });
            }]);
        } else {
            $projectsQuery->with('tasks');
        }

        $projects = $projectsQuery->get();

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
        $user = $request->user();

        $projectsQuery = Project::whereJsonContains('emails', $email)
            ->with(['department', 'stages' => function ($query) {
                $query->where('type', 'project');
            }]);

        if ($user && in_array($user->role, ['user', 'account_manager'])) {
            $projectsQuery->where(function ($q) use ($user) {
                $q->whereHas('tasks', function ($taskQuery) use ($user) {
                    $taskQuery->where('assignee_id', $user->id)
                        ->orWhereHas('assignedUsers', function ($sq) use ($user) {
                            $sq->where('users.id', $user->id);
                        });
                })
                ->orWhereHas('collaborators', function ($collabQuery) use ($user) {
                    $collabQuery->where('users.id', $user->id);
                });
            });

            $projectsQuery->with(['tasks' => function ($taskQuery) use ($user) {
                $taskQuery->where('assignee_id', $user->id)
                    ->orWhereHas('assignedUsers', function ($sq) use ($user) {
                        $sq->where('users.id', $user->id);
                    });
            }]);
        } else {
            $projectsQuery->with('tasks');
        }

        $projects = $projectsQuery->get();
		return response()->json($projects);
	}

    /**
     * Add collaborators to a project.
     */
    public function addCollaborators(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $invitedBy = $request->user()->id;

        foreach ($validated['user_ids'] as $userId) {
            // Only add if not already a collaborator
            if (!$project->collaborators()->where('user_id', $userId)->exists()) {
                $project->collaborators()->attach($userId, ['invited_by' => $invitedBy]);
            }
        }

        return response()->json([
            'message' => 'Collaborators added successfully',
            'collaborators' => $project->collaborators()->select('users.id', 'users.name', 'users.email', 'users.department_id')->get(),
        ]);
    }

    /**
     * Remove a collaborator from a project.
     */
    public function removeCollaborator(Project $project, User $user): JsonResponse
    {
        $project->collaborators()->detach($user->id);

        return response()->json([
            'message' => 'Collaborator removed successfully',
            'collaborators' => $project->collaborators()->select('users.id', 'users.name', 'users.email', 'users.department_id')->get(),
        ]);
    }

    /**
     * Get collaborators for a project.
     */
    public function getCollaborators(Project $project): JsonResponse
    {
        return response()->json(
            $project->collaborators()->select('users.id', 'users.name', 'users.email', 'users.department_id')->get()
        );
    }

    /**
     * Grant a grace period for a project that is missing a PO.
     * Only users with admin or finance roles may approve a grace period.
     */
    public function grantGracePeriod(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can grant grace periods.'], 403);
        }

        $validated = $request->validate([
            'expires_at' => 'required|date|after:today',
            'notes'      => 'nullable|string|max:1000',
        ]);

        $project->update([
            'grace_period_expires_at'  => $validated['expires_at'],
            'grace_period_notes'       => $validated['notes'] ?? null,
            'grace_period_approved_by' => $user->id,
        ]);

        return response()->json($project->fresh(['gracePeriodApprover']), 200);
    }

    /**
     * Issue a provisional PO for a project, allowing work to continue while
     * awaiting the official PO document.
     * Only users with admin or hr roles may issue provisional POs.
     */
    public function issueProvisionalPo(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can issue provisional POs.'], 403);
        }

        $validated = $request->validate([
            'po_number'  => 'required|string|max:255',
            'expires_at' => 'required|date|after:today',
        ]);

        $project->update([
            'provisional_po_number'     => $validated['po_number'],
            'provisional_po_expires_at' => $validated['expires_at'],
        ]);

        // Send provisional PO email to the client
        try {
            $project->load('client.contacts', 'collaborators');
            $clientEmail = $this->resolveClientEmail($project);
            if ($clientEmail) {
                Mail::to($clientEmail)->queue(new ProvisionalPoMailable($project));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send provisional PO email: ' . $e->getMessage());
        }

        return response()->json($project->fresh(), 200);
    }

    /**
     * Manually block a project, setting it to a read-only state.
     * Only admin and hr users may block projects.
     */
    public function block(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can block projects.'], 403);
        }

        $project->update([
            'is_manually_blocked' => true,
            'status' => 'blocked',
        ]);

        return response()->json($project->fresh(), 200);
    }

    /**
     * Unblock a manually blocked project.
     * Only admin and hr users may unblock projects.
     */
    public function unblock(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can unblock projects.'], 403);
        }

        // Only update status when the project is currently blocked to avoid
        // overwriting other valid statuses (on-hold, completed, etc.)
        $updates = ['is_manually_blocked' => false];
        if ($project->status === 'blocked') {
            $updates['status'] = 'active';
        }

        $project->update($updates);

        return response()->json($project->fresh(), 200);
    }

    /**
     * Resolve the best client email address for sending provisional PO notifications.
     *
     * Prefers the primary ClientContact email, then the Client's own email.
     */
    protected function resolveClientEmail(Project $project): ?string
    {
        $client = $project->client;

        if (! $client) {
            return null;
        }

        $primaryContact = $client->contacts()->where('is_primary', true)->first();

        if ($primaryContact && $primaryContact->email) {
            return $primaryContact->email;
        }

        return $client->email ?: null;
    }

    /**
     * Upload a campaign report for a Digital Marketing project.
     */
    public function uploadCampaignReport(Request $request, Project $project): JsonResponse
    {
        $request->validate([
            'report' => 'required|file|max:20480', // Max 20MB
        ]);

        if ($request->hasFile('report')) {
            $path = $request->file('report')->store('campaign-reports', 's3');
            
            $project->update([
                'campaign_report_document' => $path,
                'campaign_report_status' => 'pending',
                'campaign_report_approved_by' => null,
                'campaign_report_approved_at' => null,
            ]);

            return response()->json($project->fresh(['department', 'group', 'client', 'stages']), 200);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Approve a campaign report for a Digital Marketing project.
     * Only admins or users in HR department (Harshani) can approve.
     */
    public function approveCampaignReport(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        // Check if user is admin or in HR department
        // Based on previous code, 'hr' is a role. Let's check both role and department name if needed.
        // User said "harshani mean HR dont create new role just give access to hr departemt to handle this"
        $isHR = $user->role === 'hr' || ($user->department && $user->department->name === 'HR');
        $isAdmin = $user->role === 'admin';

        if (!$isAdmin && !$isHR) {
            return response()->json(['message' => 'Only admins or HR department users can approve reports.'], 403);
        }

        if ($project->campaign_report_status !== 'pending') {
            return response()->json(['message' => 'Report is not in pending status.'], 400);
        }

        $project->update([
            'campaign_report_status' => 'approved',
            'campaign_report_approved_by' => $user->id,
            'campaign_report_approved_at' => now(),
        ]);

        return response()->json($project->fresh(['department', 'group', 'client', 'stages']), 200);
    }

    /**
     * List all purchase orders assigned to a project.
     */
    public function listPurchaseOrders(Project $project): JsonResponse
    {
        return response()->json(
            $project->purchaseOrders()->orderBy('created_at', 'desc')->get()
        );
    }

    /**
     * Bulk-assign one or more purchase orders to a project.
     * Also unlocks the project's PO lock if it was awaiting a PO.
     */
    public function bulkAssignPurchaseOrders(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can assign purchase orders.'], 403);
        }

        $validated = $request->validate([
            'purchase_orders'              => 'required|array|min:1',
            'purchase_orders.*.po_number'  => 'required|string|max:255',
            'purchase_orders.*.xero_po_id' => 'nullable|string|max:255',
            'purchase_orders.*.amount'     => 'nullable|numeric|min:0',
            'purchase_orders.*.currency'   => 'nullable|string|max:10',
            'purchase_orders.*.status'     => 'nullable|string|max:100',
            'purchase_orders.*.notes'      => 'nullable|string',
        ]);

        $created = [];
        foreach ($validated['purchase_orders'] as $poData) {
            $created[] = $project->purchaseOrders()->create($poData);
        }

        if ($project->is_locked_by_po) {
            $project->update(['is_locked_by_po' => false]);
        }

        return response()->json([
            'purchase_orders' => $created,
            'project' => $project->fresh(['department', 'group', 'client', 'stages', 'purchaseOrders']),
        ], 201);
    }

    /**
     * Remove a single purchase order from a project.
     */
    public function removePurchaseOrder(Request $request, Project $project, \App\Models\ProjectPurchaseOrder $purchaseOrder): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can remove purchase orders.'], 403);
        }

        if ($purchaseOrder->project_id !== $project->id) {
            return response()->json(['message' => 'Purchase order does not belong to this project.'], 404);
        }

        $purchaseOrder->delete();

        // Re-lock if no POs remain and no legacy PO document
        if (!$project->purchaseOrders()->exists() && !$project->po_number) {
            $project->update(['is_locked_by_po' => true]);
        }

        return response()->json(null, 204);
    }
}
