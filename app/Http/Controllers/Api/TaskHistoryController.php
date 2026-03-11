<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskHistory;
use Illuminate\Http\Request;

class TaskHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
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
