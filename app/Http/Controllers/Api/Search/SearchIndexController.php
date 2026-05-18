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

class SearchIndexController extends Controller
{

    #[OA\Post(
        path: "/search/index/tasks",
        summary: "Trigger reindex of all tasks for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Task index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexTasks()
    {
        Task::makeAllSearchable();
        return response()->json(['message' => 'Task index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/tags",
        summary: "Trigger reindex of all tags for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Tag index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexTags()
    {
        Tag::makeAllSearchable();
        return response()->json(['message' => 'Tag index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/projects",
        summary: "Trigger reindex of all projects for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Project index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexProjects()
    {
        Project::makeAllSearchable();
        return response()->json(['message' => 'Project index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/task-comments",
        summary: "Trigger reindex of all task comments for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "TaskComment index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexTaskComments()
    {
        TaskComment::makeAllSearchable();
        return response()->json(['message' => 'TaskComment index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/project-groups",
        summary: "Trigger reindex of all project groups for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "ProjectGroup index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexProjectGroups()
    {
        ProjectGroup::makeAllSearchable();
        return response()->json(['message' => 'ProjectGroup index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/stages",
        summary: "Trigger reindex of all stages for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Stage index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexStages()
    {
        Stage::makeAllSearchable();
        return response()->json(['message' => 'Stage index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/task-attachments",
        summary: "Trigger reindex of all task attachments for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "TaskAttachment index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexTaskAttachments()
    {
        TaskAttachment::makeAllSearchable();
        return response()->json(['message' => 'TaskAttachment index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/history-entries",
        summary: "Trigger reindex of all history entries for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "HistoryEntry index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexHistoryEntries()
    {
        HistoryEntry::makeAllSearchable();
        return response()->json(['message' => 'HistoryEntry index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/departments",
        summary: "Trigger reindex of all departments for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Department index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexDepartments()
    {
        Department::makeAllSearchable();
        return response()->json(['message' => 'Department index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/feedback",
        summary: "Trigger reindex of all feedback for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Feedback index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexFeedback()
    {
        Feedback::makeAllSearchable();
        return response()->json(['message' => 'Feedback index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/suggested-tasks",
        summary: "Trigger reindex of all suggested tasks for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "SuggestedTask index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexSuggestedTasks()
    {
        SuggestedTask::makeAllSearchable();
        return response()->json(['message' => 'SuggestedTask index triggered.']);
    }

    #[OA\Post(
        path: "/search/index/revision-histories",
        summary: "Trigger reindex of all revision histories for search",
        security: [["bearerAuth" => []]],
        tags: ["Search Index"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Index triggered",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "RevisionHistory index triggered.")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function indexRevisionHistories()
    {
        RevisionHistory::makeAllSearchable();
        return response()->json(['message' => 'RevisionHistory index triggered.']);
    }
}
