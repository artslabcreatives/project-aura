<?php

namespace App\Http\Controllers\Api\Search;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

use App\Models\Task;
use App\Models\Tag;
use App\Models\Project;
use App\Models\TaskComment;
use App\Models\ProjectGroup;
use App\Models\Stage;
use App\Models\TaskAttachment;
use App\Models\HistoryEntry;
use App\Models\Department;
use App\Models\Feedback;
use App\Models\SuggestedTask;
use App\Models\RevisionHistory;

class SearchController extends Controller
{

	#[OA\Get(
        path: "/search/all-with-relations",
        summary: "Search all models with relations and cross-model filters",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                description: "Search query string",
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "filters[project_name]",
                in: "query",
                required: false,
                description: "Filter tasks by project name",
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "filters[tag]",
                in: "query",
                required: false,
                description: "Filter tasks by tag",
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "filters[department_name]",
                in: "query",
                required: false,
                description: "Filter projects by department name",
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Search results with relations",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "tasks", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "projects", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "tags", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "stages", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "project_groups", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "task_comments", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "task_attachments", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "history_entries", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "departments", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "feedback", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "suggested_tasks", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "revision_histories", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
	public function searchAllWithRelations(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $user = auth()->user();
        
        // Check if user is restricted (not admin)
        $isRestricted = $user && $user->role !== 'admin';
        $userDepartmentId = $user ? $user->department_id : null;

        // Tasks with relations and cross-model filters
        $tasks = Task::search($query)->get();
        
        // Filter by Department for restricted users
        if ($isRestricted && $userDepartmentId) {
            $tasks->load('project'); // Ensure project is loaded for filtering
            $tasks = $tasks->filter(function ($task) use ($userDepartmentId) {
                return $task->project && $task->project->department_id == $userDepartmentId;
            });
        }

        if (isset($filters['project_name'])) {
            $tasks = $tasks->filter(function ($task) use ($filters) {
                return $task->project && str_contains(strtolower($task->project->name ?? ''), strtolower($filters['project_name']));
            });
        }
        if (isset($filters['tag'])) {
            $tasks = $tasks->filter(function ($task) use ($filters) {
                return is_array($task->tags) && in_array($filters['tag'], $task->tags);
            });
        }
        // Reload relations to ensure everything is fresh and consistent
        $tasks->load(['project', 'projectStage', 'startStage', 'previousStage', 'assignee', 'attachments', 'comments', 'assignees']);

        // Projects with relations
        $projects = Project::search($query)->get();
        
        // Filter Projects by Department
        if ($isRestricted && $userDepartmentId) {
            $projects = $projects->filter(function ($project) use ($userDepartmentId) {
                return $project->department_id == $userDepartmentId;
            });
        }

        if (isset($filters['department_name'])) {
            $projects = $projects->filter(function ($project) use ($filters) {
                return $project->department && str_contains(strtolower($project->department->name ?? ''), strtolower($filters['department_name']));
            });
        }
        $projects->load(['department', 'group', 'stages', 'tasks', 'suggestedTasks', 'historyEntries', 'creator']);

        // Tags with department
        $tags = Tag::search($query)->get();
        // Tags are usually department specific too ideally, or global
        // If Tags have department_id, filter them
        if ($isRestricted && $userDepartmentId) {
             $tags = $tags->filter(function ($tag) use ($userDepartmentId) {
                 // Check if tag has department_id or is global
                 return empty($tag->department_id) || $tag->department_id == $userDepartmentId;
             });
        }
        $tags->load('department');

        // Stages with project
        $stages = Stage::search($query)->get();
        if ($isRestricted && $userDepartmentId) {
             $stages->load('project');
             $stages = $stages->filter(function ($stage) use ($userDepartmentId) {
                 return $stage->project && $stage->project->department_id == $userDepartmentId;
             });
        }
        $stages->load('project');

        // ProjectGroups with department and children
        $projectGroups = ProjectGroup::search($query)->get();
        if ($isRestricted && $userDepartmentId) {
             $projectGroups = $projectGroups->filter(function ($group) use ($userDepartmentId) {
                 return $group->department_id == $userDepartmentId;
             });
        }
        $projectGroups->load(['department', 'projects', 'parent', 'children']);

        // TaskComments with task and user
        $taskComments = TaskComment::search($query)->get();
        if ($isRestricted && $userDepartmentId) {
             $taskComments->load('task.project');
             $taskComments = $taskComments->filter(function ($comment) use ($userDepartmentId) {
                 return $comment->task && $comment->task->project && $comment->task->project->department_id == $userDepartmentId;
             });
        }
        $taskComments->load(['task', 'user']);

        // TaskAttachments with task
        $taskAttachments = TaskAttachment::search($query)->get();
        if ($isRestricted && $userDepartmentId) {
             $taskAttachments->load('task.project');
             $taskAttachments = $taskAttachments->filter(function ($attachment) use ($userDepartmentId) {
                 return $attachment->task && $attachment->task->project && $attachment->task->project->department_id == $userDepartmentId;
             });
        }
        $taskAttachments->load('task');

        // HistoryEntries with user and project
        $historyEntries = HistoryEntry::search($query)->get();
        // History entries might be trickier, filtering by project seems safest
        if ($isRestricted && $userDepartmentId) {
             $historyEntries->load('project');
             $historyEntries = $historyEntries->filter(function ($entry) use ($userDepartmentId) {
                 return $entry->project && $entry->project->department_id == $userDepartmentId;
             });
        }
        $historyEntries->load(['user', 'project']);

        // Departments with projects
        $departments = Department::search($query)->get();
        // Probably only show their own department?
        if ($isRestricted && $userDepartmentId) {
             $departments = $departments->filter(function ($dept) use ($userDepartmentId) {
                 return $dept->id == $userDepartmentId;
             });
        }
        $departments->load('projects');

        // Feedback with user
        $feedback = Feedback::search($query)->get();
        $feedback->load('user');

        // SuggestedTasks with project
        $suggestedTasks = SuggestedTask::search($query)->get();
        if ($isRestricted && $userDepartmentId) {
             $suggestedTasks->load('project');
             $suggestedTasks = $suggestedTasks->filter(function ($st) use ($userDepartmentId) {
                 return $st->project && $st->project->department_id == $userDepartmentId;
             });
        }
        $suggestedTasks->load('project');

        // RevisionHistories with task and user
        $revisionHistories = RevisionHistory::search($query)->get();
         if ($isRestricted && $userDepartmentId) {
             $revisionHistories->load('task.project');
             $revisionHistories = $revisionHistories->filter(function ($rh) use ($userDepartmentId) {
                 return $rh->task && $rh->task->project && $rh->task->project->department_id == $userDepartmentId;
             });
        }
        $revisionHistories->load(['task', 'requestedBy']);

        $results = [
            'tasks' => $tasks->values(),
            'projects' => $projects->values(),
            'tags' => $tags->values(),
            'stages' => $stages->values(),
            'project_groups' => $projectGroups->values(),
            'task_comments' => $taskComments->values(),
            'task_attachments' => $taskAttachments->values(),
            'history_entries' => $historyEntries->values(),
            'departments' => $departments->values(),
            'feedback' => $feedback->values(),
            'suggested_tasks' => $suggestedTasks->values(),
            'revision_histories' => $revisionHistories->values(),
        ];

        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/all",
        summary: "Search all models and return grouped results",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                description: "Search query string",
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "filters",
                in: "query",
                required: false,
                description: "Optional filters (JSON)",
                schema: new OA\Schema(type: "object")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Grouped search results",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "tasks", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "projects", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "tags", type: "array", items: new OA\Items(type: "object"))
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchAll(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);

        $results = [
            'tasks' => Task::search($query)->get(),
            'tags' => Tag::search($query)->get(),
            'projects' => Project::search($query)->get(),
            'task_comments' => TaskComment::search($query)->get(),
            'project_groups' => ProjectGroup::search($query)->get(),
            'stages' => Stage::search($query)->get(),
            'task_attachments' => TaskAttachment::search($query)->get(),
            'history_entries' => HistoryEntry::search($query)->get(),
            'departments' => Department::search($query)->get(),
            'feedback' => Feedback::search($query)->get(),
            'suggested_tasks' => SuggestedTask::search($query)->get(),
            'revision_histories' => RevisionHistory::search($query)->get(),
        ];

        // TODO: Apply filters and cross-model filtering

        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/tasks",
        summary: "Search tasks with filters",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "filters[is_in_specific_stage]",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "boolean")
            ),
            new OA\Parameter(
                name: "filters[tag]",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchTasks(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Task::search($query)->get();
        // Boolean filter: is_in_specific_stage
        if (isset($filters['is_in_specific_stage'])) {
            $results = $results->where('is_in_specific_stage', (bool)$filters['is_in_specific_stage']);
        }
        // Cross-model filter: tag name
        if (isset($filters['tag'])) {
            $tag = $filters['tag'];
            $results = $results->filter(function ($task) use ($tag) {
                if (is_array($task->tags)) {
                    return in_array($tag, $task->tags);
                }
                return false;
            });
        }
        return response()->json($results->values());
    }

    #[OA\Get(
        path: "/search/tags",
        summary: "Search tags",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchTags(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Tag::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/projects",
        summary: "Search projects with filters",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "filters[is_archived]",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "boolean")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchProjects(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Project::search($query)->get();
        // Boolean filter: is_archived
        if (isset($filters['is_archived'])) {
            $results = $results->where('is_archived', (bool)$filters['is_archived']);
        }
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/task-comments",
        summary: "Search task comments",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchTaskComments(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = TaskComment::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/project-groups",
        summary: "Search project groups",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchProjectGroups(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = ProjectGroup::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/stages",
        summary: "Search stages with filters",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "filters[is_review_stage]",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "boolean")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchStages(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Stage::search($query)->get();
        // Boolean filter: is_review_stage
        if (isset($filters['is_review_stage'])) {
            $results = $results->where('is_review_stage', (bool)$filters['is_review_stage']);
        }
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/task-attachments",
        summary: "Search task attachments",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchTaskAttachments(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = TaskAttachment::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/history-entries",
        summary: "Search history entries",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchHistoryEntries(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = HistoryEntry::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/departments",
        summary: "Search departments",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchDepartments(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Department::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/feedback",
        summary: "Search feedback",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchFeedback(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Feedback::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/suggested-tasks",
        summary: "Search suggested tasks",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchSuggestedTasks(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = SuggestedTask::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    #[OA\Get(
        path: "/search/revision-histories",
        summary: "Search revision histories",
        security: [["bearerAuth" => []]],
        tags: ["Search"],
        parameters: [
            new OA\Parameter(
                name: "q",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Search results"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function searchRevisionHistories(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = RevisionHistory::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }
}
