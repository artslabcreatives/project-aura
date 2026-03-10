<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TaskAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Analytics',
    description: 'Task completion analytics and reporting endpoints'
)]
class AnalyticsController extends Controller
{
    protected TaskAnalyticsService $analyticsService;

    public function __construct(TaskAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get task completion analytics for a specific period
     */
    #[OA\Get(
        path: '/api/analytics/completion',
        summary: 'Get task completion analytics',
        tags: ['Analytics'],
        parameters: [
            new OA\Parameter(
                name: 'period',
                description: 'Time period for analytics',
                in: 'query',
                required: true,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['week', 'month', 'quarter', 'year']
                )
            ),
            new OA\Parameter(
                name: 'start_date',
                description: 'Start date (optional, defaults to period start)',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', format: 'date')
            ),
            new OA\Parameter(
                name: 'end_date',
                description: 'End date (optional, defaults to now)',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', format: 'date')
            ),
            new OA\Parameter(
                name: 'project_id',
                description: 'Filter by project ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'stage_id',
                description: 'Filter by stage ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'user_id',
                description: 'Filter by assignee user ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'priority',
                description: 'Filter by priority',
                in: 'query',
                required: false,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['low', 'medium', 'high']
                )
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'period', type: 'string', example: 'month'),
                        new OA\Property(property: 'start_date', type: 'string', format: 'date-time'),
                        new OA\Property(property: 'end_date', type: 'string', format: 'date-time'),
                        new OA\Property(property: 'total_completed', type: 'integer', example: 42),
                        new OA\Property(
                            property: 'breakdown',
                            type: 'object',
                            example: ['2026-01' => 15, '2026-02' => 27]
                        ),
                        new OA\Property(
                            property: 'by_project',
                            type: 'array',
                            items: new OA\Items(
                                type: 'object',
                                properties: [
                                    new OA\Property(property: 'project_id', type: 'integer'),
                                    new OA\Property(property: 'project_name', type: 'string'),
                                    new OA\Property(property: 'count', type: 'integer'),
                                ]
                            )
                        ),
                        new OA\Property(
                            property: 'by_stage',
                            type: 'array',
                            items: new OA\Items(
                                type: 'object',
                                properties: [
                                    new OA\Property(property: 'stage_id', type: 'integer'),
                                    new OA\Property(property: 'stage_name', type: 'string'),
                                    new OA\Property(property: 'count', type: 'integer'),
                                ]
                            )
                        ),
                        new OA\Property(
                            property: 'by_user',
                            type: 'array',
                            items: new OA\Items(
                                type: 'object',
                                properties: [
                                    new OA\Property(property: 'user_id', type: 'integer'),
                                    new OA\Property(property: 'user_name', type: 'string'),
                                    new OA\Property(property: 'count', type: 'integer'),
                                ]
                            )
                        ),
                        new OA\Property(
                            property: 'by_priority',
                            type: 'object',
                            example: ['high' => 10, 'medium' => 20, 'low' => 12]
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid period specified'
            ),
        ]
    )]
    public function getCompletionAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:week,month,quarter,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'project_id' => 'nullable|integer|exists:projects,id',
            'stage_id' => 'nullable|integer|exists:stages,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        $period = $request->input('period');
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : null;

        $filters = array_filter([
            'project_id' => $request->input('project_id'),
            'stage_id' => $request->input('stage_id'),
            'user_id' => $request->input('user_id'),
            'priority' => $request->input('priority'),
        ]);

        $analytics = $this->analyticsService->getCompletionAnalytics($period, $startDate, $endDate, $filters);

        return response()->json($analytics);
    }

    /**
     * Get comparison analytics between current and previous period
     */
    #[OA\Get(
        path: '/api/analytics/comparison',
        summary: 'Compare current period with previous period',
        tags: ['Analytics'],
        parameters: [
            new OA\Parameter(
                name: 'period',
                description: 'Time period for comparison',
                in: 'query',
                required: true,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['week', 'month', 'quarter', 'year']
                )
            ),
            new OA\Parameter(
                name: 'project_id',
                description: 'Filter by project ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'stage_id',
                description: 'Filter by stage ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'user_id',
                description: 'Filter by assignee user ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'priority',
                description: 'Filter by priority',
                in: 'query',
                required: false,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['low', 'medium', 'high']
                )
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(
                            property: 'current_period',
                            type: 'object',
                            description: 'Analytics for current period'
                        ),
                        new OA\Property(
                            property: 'previous_period',
                            type: 'object',
                            description: 'Analytics for previous period'
                        ),
                        new OA\Property(
                            property: 'comparison',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'absolute_change', type: 'integer', example: 15),
                                new OA\Property(property: 'percentage_change', type: 'number', format: 'float', example: 35.71),
                                new OA\Property(property: 'trend', type: 'string', enum: ['up', 'down', 'stable'], example: 'up'),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid period specified'
            ),
        ]
    )]
    public function getComparisonAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:week,month,quarter,year',
            'project_id' => 'nullable|integer|exists:projects,id',
            'stage_id' => 'nullable|integer|exists:stages,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        $period = $request->input('period');

        $filters = array_filter([
            'project_id' => $request->input('project_id'),
            'stage_id' => $request->input('stage_id'),
            'user_id' => $request->input('user_id'),
            'priority' => $request->input('priority'),
        ]);

        $analytics = $this->analyticsService->getComparisonAnalytics($period, $filters);

        return response()->json($analytics);
    }

    /**
     * Get completion rate analytics
     */
    #[OA\Get(
        path: '/api/analytics/completion-rate',
        summary: 'Get task completion rate statistics',
        tags: ['Analytics'],
        parameters: [
            new OA\Parameter(
                name: 'period',
                description: 'Time period for analytics',
                in: 'query',
                required: true,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['week', 'month', 'quarter', 'year']
                )
            ),
            new OA\Parameter(
                name: 'project_id',
                description: 'Filter by project ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'stage_id',
                description: 'Filter by stage ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'user_id',
                description: 'Filter by assignee user ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'period', type: 'string', example: 'month'),
                        new OA\Property(property: 'start_date', type: 'string', format: 'date-time'),
                        new OA\Property(property: 'end_date', type: 'string', format: 'date-time'),
                        new OA\Property(property: 'total_tasks', type: 'integer', example: 100),
                        new OA\Property(property: 'completed_tasks', type: 'integer', example: 75),
                        new OA\Property(property: 'completion_rate', type: 'number', format: 'float', example: 75.0),
                        new OA\Property(property: 'pending_tasks', type: 'integer', example: 25),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid period specified'
            ),
        ]
    )]
    public function getCompletionRate(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:week,month,quarter,year',
            'project_id' => 'nullable|integer|exists:projects,id',
            'stage_id' => 'nullable|integer|exists:stages,id',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        $period = $request->input('period');

        $filters = array_filter([
            'project_id' => $request->input('project_id'),
            'stage_id' => $request->input('stage_id'),
            'user_id' => $request->input('user_id'),
        ]);

        $analytics = $this->analyticsService->getCompletionRateAnalytics($period, $filters);

        return response()->json($analytics);
    }

    /**
     * Get average completion time analytics
     */
    #[OA\Get(
        path: '/api/analytics/completion-time',
        summary: 'Get average task completion time statistics',
        tags: ['Analytics'],
        parameters: [
            new OA\Parameter(
                name: 'period',
                description: 'Time period for analytics',
                in: 'query',
                required: true,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['week', 'month', 'quarter', 'year']
                )
            ),
            new OA\Parameter(
                name: 'project_id',
                description: 'Filter by project ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'stage_id',
                description: 'Filter by stage ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'user_id',
                description: 'Filter by assignee user ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'period', type: 'string', example: 'month'),
                        new OA\Property(property: 'average_hours', type: 'number', format: 'float', example: 48.5),
                        new OA\Property(property: 'average_days', type: 'number', format: 'float', example: 2.02),
                        new OA\Property(property: 'median_hours', type: 'number', format: 'float', example: 36.0),
                        new OA\Property(property: 'median_days', type: 'number', format: 'float', example: 1.5),
                        new OA\Property(property: 'min_hours', type: 'number', format: 'float', example: 2.0),
                        new OA\Property(property: 'max_hours', type: 'number', format: 'float', example: 168.0),
                        new OA\Property(property: 'total_tasks', type: 'integer', example: 75),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid period specified'
            ),
        ]
    )]
    public function getAverageCompletionTime(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:week,month,quarter,year',
            'project_id' => 'nullable|integer|exists:projects,id',
            'stage_id' => 'nullable|integer|exists:stages,id',
            'user_id' => 'nullable|integer|exists:users,id',
        ]);

        $period = $request->input('period');

        $filters = array_filter([
            'project_id' => $request->input('project_id'),
            'stage_id' => $request->input('stage_id'),
            'user_id' => $request->input('user_id'),
        ]);

        $analytics = $this->analyticsService->getAverageCompletionTime($period, $filters);

        return response()->json($analytics);
    }

    /**
     * Get comprehensive analytics dashboard data
     */
    #[OA\Get(
        path: '/api/analytics/dashboard',
        summary: 'Get comprehensive dashboard analytics',
        tags: ['Analytics'],
        parameters: [
            new OA\Parameter(
                name: 'period',
                description: 'Time period for analytics',
                in: 'query',
                required: true,
                schema: new OA\Schema(
                    type: 'string',
                    enum: ['week', 'month', 'quarter', 'year']
                )
            ),
            new OA\Parameter(
                name: 'project_id',
                description: 'Filter by project ID',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'completion_analytics', type: 'object'),
                        new OA\Property(property: 'completion_rate', type: 'object'),
                        new OA\Property(property: 'completion_time', type: 'object'),
                        new OA\Property(property: 'comparison', type: 'object'),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Invalid period specified'
            ),
        ]
    )]
    public function getDashboard(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'required|in:week,month,quarter,year',
            'project_id' => 'nullable|integer|exists:projects,id',
        ]);

        $period = $request->input('period');
        $filters = array_filter([
            'project_id' => $request->input('project_id'),
        ]);

        $completionAnalytics = $this->analyticsService->getCompletionAnalytics($period, null, null, $filters);
        $completionRate = $this->analyticsService->getCompletionRateAnalytics($period, $filters);
        $completionTime = $this->analyticsService->getAverageCompletionTime($period, $filters);
        $comparison = $this->analyticsService->getComparisonAnalytics($period, $filters);

        return response()->json([
            'completion_analytics' => $completionAnalytics,
            'completion_rate' => $completionRate,
            'completion_time' => $completionTime,
            'comparison' => $comparison,
        ]);
    }
}
