<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskHistory;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TaskHistoryController extends Controller
{
    #[OA\Get(
        path: "/tasks/{task}/history",
        summary: "Get task history",
        description: "Returns paginated history log for a specific task",
        security: [["bearerAuth" => []]],
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(name: "task", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Paginated task history entries"),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(\App\Models\Task $task)
    {
        $histories = $task->taskHistories()
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($histories);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskHistory $taskHistory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TaskHistory $taskHistory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TaskHistory $taskHistory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskHistory $taskHistory)
    {
        //
    }
}
