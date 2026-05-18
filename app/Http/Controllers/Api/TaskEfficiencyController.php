<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TaskEfficiencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TaskEfficiencyController extends Controller
{
    protected TaskEfficiencyService $efficiencyService;

    public function __construct(TaskEfficiencyService $efficiencyService)
    {
        $this->efficiencyService = $efficiencyService;
    }

    #[OA\Get(
        path: "/projects/{project}/efficiency",
        summary: "Get project task efficiency metrics",
        security: [["bearerAuth" => []]],
        tags: ["Task Efficiency"],
        parameters: [
            new OA\Parameter(
                name: "project",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Project efficiency metrics"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getProjectEfficiency(int $projectId): JsonResponse
    {
        $efficiency = $this->efficiencyService->getProjectEfficiency($projectId);

        return response()->json($efficiency);
    }

    #[OA\Get(
        path: "/users/{user}/efficiency",
        summary: "Get user task efficiency metrics",
        security: [["bearerAuth" => []]],
        tags: ["Task Efficiency"],
        parameters: [
            new OA\Parameter(
                name: "user",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "User efficiency metrics"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getUserEfficiency(int $userId): JsonResponse
    {
        $efficiency = $this->efficiencyService->getUserEfficiency($userId);

        return response()->json($efficiency);
    }

    #[OA\Get(
        path: "/users/{user}/efficiency-trends",
        summary: "Get user efficiency trends over time",
        security: [["bearerAuth" => []]],
        tags: ["Task Efficiency"],
        parameters: [
            new OA\Parameter(
                name: "user",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "days",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer", default: 30)
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "User efficiency trends"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getUserEfficiencyTrends(Request $request, int $userId): JsonResponse
    {
        $days = $request->query('days', 30);
        $trends = $this->efficiencyService->getUserEfficiencyTrends($userId, $days);

        return response()->json($trends);
    }

    #[OA\Get(
        path: "/departments/{department}/efficiency",
        summary: "Get department-wide efficiency metrics",
        security: [["bearerAuth" => []]],
        tags: ["Task Efficiency"],
        parameters: [
            new OA\Parameter(
                name: "department",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Department efficiency metrics"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getDepartmentEfficiency(int $departmentId): JsonResponse
    {
        $efficiency = $this->efficiencyService->getDepartmentEfficiency($departmentId);

        return response()->json($efficiency);
    }
}
