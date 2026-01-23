<?php

namespace App\Http\Controllers\Api\Search;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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

	/**
     * Search all models, include relations, and support cross-model filters.
     */
    public function searchAllWithRelations(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);

        // Tasks with relations and cross-model filters
        $tasks = Task::search($query)->get();
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
        $tasks->load(['project', 'projectStage', 'startStage', 'previousStage', 'assignee', 'attachments', 'comments', 'assignees']);

        // Projects with relations
        $projects = Project::search($query)->get();
        if (isset($filters['department_name'])) {
            $projects = $projects->filter(function ($project) use ($filters) {
                return $project->department && str_contains(strtolower($project->department->name ?? ''), strtolower($filters['department_name']));
            });
        }
        $projects->load(['department', 'group', 'stages', 'tasks', 'suggestedTasks', 'historyEntries', 'creator']);

        // Tags with department
        $tags = Tag::search($query)->get();
        $tags->load('department');

        // Stages with project
        $stages = Stage::search($query)->get();
        $stages->load('project');

        // ProjectGroups with department and children
        $projectGroups = ProjectGroup::search($query)->get();
        $projectGroups->load(['department', 'projects', 'parent', 'children']);

        // TaskComments with task and user
        $taskComments = TaskComment::search($query)->get();
        $taskComments->load(['task', 'user']);

        // TaskAttachments with task
        $taskAttachments = TaskAttachment::search($query)->get();
        $taskAttachments->load('task');

        // HistoryEntries with user and project
        $historyEntries = HistoryEntry::search($query)->get();
        $historyEntries->load(['user', 'project']);

        // Departments with projects
        $departments = Department::search($query)->get();
        $departments->load('projects');

        // Feedback with user
        $feedback = Feedback::search($query)->get();
        $feedback->load('user');

        // SuggestedTasks with project
        $suggestedTasks = SuggestedTask::search($query)->get();
        $suggestedTasks->load('project');

        // RevisionHistories with task and user
        $revisionHistories = RevisionHistory::search($query)->get();
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

    /**
     * Search all models and return grouped results.
     */
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

    // Individual search endpoints for each model
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

    public function searchTags(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Tag::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

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

    public function searchTaskComments(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = TaskComment::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    public function searchProjectGroups(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = ProjectGroup::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

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

    public function searchTaskAttachments(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = TaskAttachment::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    public function searchHistoryEntries(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = HistoryEntry::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    public function searchDepartments(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Department::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    public function searchFeedback(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = Feedback::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    public function searchSuggestedTasks(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = SuggestedTask::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }

    public function searchRevisionHistories(Request $request)
    {
        $query = $request->input('q');
        $filters = $request->input('filters', []);
        $results = RevisionHistory::search($query)->get();
        // TODO: Apply filters
        return response()->json($results);
    }
}
