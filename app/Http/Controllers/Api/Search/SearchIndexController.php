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

class SearchIndexController extends Controller
{

    // Manual index trigger endpoints for each model
    public function indexTasks()
    {
        Task::makeAllSearchable();
        return response()->json(['message' => 'Task index triggered.']);
    }

    public function indexTags()
    {
        Tag::makeAllSearchable();
        return response()->json(['message' => 'Tag index triggered.']);
    }

    public function indexProjects()
    {
        Project::makeAllSearchable();
        return response()->json(['message' => 'Project index triggered.']);
    }

    public function indexTaskComments()
    {
        TaskComment::makeAllSearchable();
        return response()->json(['message' => 'TaskComment index triggered.']);
    }

    public function indexProjectGroups()
    {
        ProjectGroup::makeAllSearchable();
        return response()->json(['message' => 'ProjectGroup index triggered.']);
    }

    public function indexStages()
    {
        Stage::makeAllSearchable();
        return response()->json(['message' => 'Stage index triggered.']);
    }

    public function indexTaskAttachments()
    {
        TaskAttachment::makeAllSearchable();
        return response()->json(['message' => 'TaskAttachment index triggered.']);
    }

    public function indexHistoryEntries()
    {
        HistoryEntry::makeAllSearchable();
        return response()->json(['message' => 'HistoryEntry index triggered.']);
    }

    public function indexDepartments()
    {
        Department::makeAllSearchable();
        return response()->json(['message' => 'Department index triggered.']);
    }

    public function indexFeedback()
    {
        Feedback::makeAllSearchable();
        return response()->json(['message' => 'Feedback index triggered.']);
    }

    public function indexSuggestedTasks()
    {
        SuggestedTask::makeAllSearchable();
        return response()->json(['message' => 'SuggestedTask index triggered.']);
    }

    public function indexRevisionHistories()
    {
        RevisionHistory::makeAllSearchable();
        return response()->json(['message' => 'RevisionHistory index triggered.']);
    }
}
