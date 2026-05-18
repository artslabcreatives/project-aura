<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskTimeLog;
use App\Services\ProfitabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProfitabilityController extends Controller
{
    protected ProfitabilityService $profitabilityService;

    public function __construct(ProfitabilityService $profitabilityService)
    {
        $this->profitabilityService = $profitabilityService;
    }

    #[OA\Get(
        path: "/projects/{project}/profitability",
        summary: "Get project profitability",
        security: [["bearerAuth" => []]],
        tags: ["Profitability"],
        parameters: [
            new OA\Parameter(
                name: "project",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Project profitability data"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Project not found")
        ]
    )]
    public function getProjectProfitability(Project $project): JsonResponse
    {
        $profitability = $this->profitabilityService->calculateProjectProfitability($project);
        $breakdown = $this->profitabilityService->getTaskProfitabilityBreakdown($project);

        return response()->json([
            'project_id' => $project->id,
            'project_name' => $project->name,
            'profitability' => $profitability,
            'task_breakdown' => $breakdown,
        ]);
    }

    #[OA\Get(
        path: "/clients/{client}/profitability",
        summary: "Get client profitability across all projects",
        security: [["bearerAuth" => []]],
        tags: ["Profitability"],
        parameters: [
            new OA\Parameter(
                name: "client",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Client profitability data"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getClientProfitability(int $clientId): JsonResponse
    {
        $profitability = $this->profitabilityService->getClientProfitability($clientId);

        return response()->json($profitability);
    }

    #[OA\Post(
        path: "/tasks/{task}/time-log",
        summary: "Log time for a task",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "started_at", type: "string", format: "date-time", example: "2026-04-03T10:00:00Z"),
                    new OA\Property(property: "ended_at", type: "string", format: "date-time", example: "2026-04-03T12:00:00Z", nullable: true),
                    new OA\Property(property: "notes", type: "string", example: "Worked on implementation", nullable: true)
                ]
            )
        ),
        tags: ["Profitability"],
        parameters: [
            new OA\Parameter(
                name: "task",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 201, description: "Time log created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Task not found")
        ]
    )]
    public function logTaskTime(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'started_at' => 'required|date',
            'ended_at' => 'nullable|date|after:started_at',
            'notes' => 'nullable|string',
        ]);

        $timeLog = TaskTimeLog::create([
            'task_id' => $task->id,
            'user_id' => auth()->id(),
            'started_at' => $validated['started_at'],
            'ended_at' => $validated['ended_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update task hours if time log is completed
        if ($timeLog->ended_at) {
            $this->profitabilityService->updateTaskHours($task);
        }

        return response()->json($timeLog, 201);
    }

    #[OA\Patch(
        path: "/tasks/{task}/time-log/{timeLog}",
        summary: "End a time log for a task",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "ended_at", type: "string", format: "date-time", example: "2026-04-03T12:00:00Z"),
                    new OA\Property(property: "notes", type: "string", example: "Completed the implementation", nullable: true)
                ]
            )
        ),
        tags: ["Profitability"],
        parameters: [
            new OA\Parameter(
                name: "task",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "timeLog",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Time log updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Time log not found")
        ]
    )]
    public function endTimeLog(Request $request, Task $task, TaskTimeLog $timeLog): JsonResponse
    {
        // Ensure the time log belongs to the task
        if ($timeLog->task_id !== $task->id) {
            return response()->json(['message' => 'Time log does not belong to this task'], 404);
        }

        $validated = $request->validate([
            'ended_at' => 'required|date|after:' . $timeLog->started_at,
            'notes' => 'nullable|string',
        ]);

        $timeLog->update($validated);

        // Update task hours
        $this->profitabilityService->updateTaskHours($task);

        return response()->json($timeLog);
    }

    #[OA\Get(
        path: "/tasks/{task}/time-logs",
        summary: "Get all time logs for a task",
        security: [["bearerAuth" => []]],
        tags: ["Profitability"],
        parameters: [
            new OA\Parameter(
                name: "task",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "List of time logs"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getTaskTimeLogs(Task $task): JsonResponse
    {
        $timeLogs = $task->timeLogs()->with('user:id,name,email')->get();

        return response()->json($timeLogs);
    }

    #[OA\Get(
        path: "/user/active-timers",
        summary: "Get all active timers for the current user",
        security: [["bearerAuth" => []]],
        tags: ["Profitability"],
        responses: [
            new OA\Response(response: 200, description: "List of active time logs with task info"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getActiveTimers(): JsonResponse
    {
        $timeLogs = TaskTimeLog::with(['task:id,title,project_id', 'task.project:id,name'])
            ->where('user_id', auth()->id())
            ->whereNull('ended_at')
            ->get();

        return response()->json($timeLogs);
    }
}
