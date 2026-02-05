# Task Completion Analytics

This document describes the comprehensive task completion analytics system implemented in the Aura project management system.

## Overview

The analytics system provides detailed insights into task completion patterns across different time periods (week, month, quarter, year) with the ability to compare against previous periods. All analytics endpoints are accessible via API and fully documented in Swagger.

## Key Features

- **Time-based Analytics**: Track task completion by week, month, quarter, or year
- **Period Comparison**: Compare current period against previous period with percentage changes
- **Multi-dimensional Breakdowns**: Analyze completions by project, stage, user, and priority
- **Completion Rates**: Calculate completion rates for tasks created in a period
- **Completion Time Analysis**: Track average and median time to complete tasks
- **Comprehensive Dashboard**: Single endpoint providing all key metrics

## API Endpoints

All endpoints require authentication via `auth:sanctum` middleware.

### 1. Completion Analytics
**GET** `/api/analytics/completion`

Get detailed task completion analytics for a specific time period.

**Query Parameters:**
- `period` (required): `week`, `month`, `quarter`, or `year`
- `start_date` (optional): Custom start date (YYYY-MM-DD)
- `end_date` (optional): Custom end date (YYYY-MM-DD)
- `project_id` (optional): Filter by specific project
- `stage_id` (optional): Filter by specific stage
- `user_id` (optional): Filter by specific assignee
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)

**Response:**
```json
{
  "period": "month",
  "start_date": "2026-02-01 00:00:00",
  "end_date": "2026-02-05 15:30:00",
  "total_completed": 42,
  "breakdown": {
    "2026-01": 15,
    "2026-02": 27
  },
  "by_project": [
    {
      "project_id": 1,
      "project_name": "Website Redesign",
      "count": 20
    }
  ],
  "by_stage": [
    {
      "stage_id": 3,
      "stage_name": "Development",
      "count": 15
    }
  ],
  "by_user": [
    {
      "user_id": 5,
      "user_name": "John Doe",
      "count": 18
    }
  ],
  "by_priority": {
    "high": 10,
    "medium": 20,
    "low": 12
  }
}
```

### 2. Comparison Analytics
**GET** `/api/analytics/comparison`

Compare current period with previous period to identify trends.

**Query Parameters:**
- `period` (required): `week`, `month`, `quarter`, or `year`
- `project_id`, `stage_id`, `user_id`, `priority` (optional): Filters

**Response:**
```json
{
  "current_period": {
    "period": "month",
    "start_date": "2026-02-01 00:00:00",
    "end_date": "2026-02-05 15:30:00",
    "total_completed": 42,
    "breakdown": {...},
    "by_project": [...],
    "by_stage": [...],
    "by_user": [...],
    "by_priority": {...}
  },
  "previous_period": {
    "period": "month",
    "start_date": "2026-01-01 00:00:00",
    "end_date": "2026-01-31 23:59:59",
    "total_completed": 31,
    ...
  },
  "comparison": {
    "absolute_change": 11,
    "percentage_change": 35.48,
    "trend": "up"
  }
}
```

**Trend Values:**
- `up`: More completions in current period
- `down`: Fewer completions in current period
- `stable`: Same number of completions

### 3. Completion Rate
**GET** `/api/analytics/completion-rate`

Calculate the completion rate of tasks created within a time period.

**Query Parameters:**
- `period` (required): `week`, `month`, `quarter`, or `year`
- `project_id`, `stage_id`, `user_id` (optional): Filters

**Response:**
```json
{
  "period": "month",
  "start_date": "2026-02-01 00:00:00",
  "end_date": "2026-02-05 15:30:00",
  "total_tasks": 100,
  "completed_tasks": 75,
  "completion_rate": 75.0,
  "pending_tasks": 25
}
```

### 4. Average Completion Time
**GET** `/api/analytics/completion-time`

Analyze average and median time to complete tasks.

**Query Parameters:**
- `period` (required): `week`, `month`, `quarter`, or `year`
- `project_id`, `stage_id`, `user_id` (optional): Filters

**Response:**
```json
{
  "period": "month",
  "average_hours": 48.5,
  "average_days": 2.02,
  "median_hours": 36.0,
  "median_days": 1.5,
  "min_hours": 2.0,
  "max_hours": 168.0,
  "total_tasks": 75
}
```

### 5. Comprehensive Dashboard
**GET** `/api/analytics/dashboard`

Get all analytics data in a single request for dashboard views.

**Query Parameters:**
- `period` (required): `week`, `month`, `quarter`, or `year`
- `project_id` (optional): Filter by project

**Response:**
```json
{
  "completion_analytics": {...},
  "completion_rate": {...},
  "completion_time": {...},
  "comparison": {...}
}
```

## Data Tracking

### Task Completion Timestamp
The system automatically tracks task completion using the `completed_at` timestamp field:

- **Field**: `tasks.completed_at` (nullable datetime)
- **Auto-set**: When `user_status` changes to `'complete'`
- **Observer**: [TaskObserver](app/Observers/TaskObserver.php) handles automatic timestamping
- **Migration**: Defined in `database/migrations/2025_11_27_100335_create_tasks_table.php`

### Automatic Tracking
The [TaskObserver](app/Observers/TaskObserver.php) `updating()` method automatically:
1. Sets `completed_at` timestamp when task status becomes `'complete'`
2. Handles stage progression (review stages or next sequential stage)
3. Maintains completion timestamp even when task moves stages

## Service Architecture

### TaskAnalyticsService
Location: [app/Services/TaskAnalyticsService.php](app/Services/TaskAnalyticsService.php)

Core methods:
- `getCompletionAnalytics()`: Main analytics aggregation
- `getComparisonAnalytics()`: Period-over-period comparison
- `getCompletionRateAnalytics()`: Completion rate calculation
- `getAverageCompletionTime()`: Time-to-complete statistics

Private helper methods:
- `getBreakdownByPeriod()`: Time-series grouping
- `getBreakdownByProject()`: Project-wise aggregation
- `getBreakdownByStage()`: Stage-wise aggregation
- `getBreakdownByUser()`: User-wise aggregation
- `getBreakdownByPriority()`: Priority-wise aggregation
- `getDefaultStartDate()`: Period start date calculator
- `getDateFormatForPeriod()`: SQL date format generator
- `calculateMedian()`: Median value calculator

## Usage Examples

### Example 1: Monthly Completion Analytics
```bash
curl -X GET "https://api.example.com/api/analytics/completion?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 2: Weekly Comparison for Specific Project
```bash
curl -X GET "https://api.example.com/api/analytics/comparison?period=week&project_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 3: Quarterly Completion Rate by User
```bash
curl -X GET "https://api.example.com/api/analytics/completion-rate?period=quarter&user_id=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 4: Full Dashboard Data
```bash
curl -X GET "https://api.example.com/api/analytics/dashboard?period=month&project_id=3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration

### React/TypeScript Example
```typescript
import { api } from '@/lib/api';

// Get monthly analytics
const getMonthlyAnalytics = async (projectId?: number) => {
  const params = new URLSearchParams({ period: 'month' });
  if (projectId) params.append('project_id', projectId.toString());
  
  const response = await api.get(`/api/analytics/completion?${params}`);
  return response.data;
};

// Get comparison data
const getComparison = async (period: 'week' | 'month' | 'quarter' | 'year') => {
  const response = await api.get(`/api/analytics/comparison?period=${period}`);
  return response.data;
};

// Using with TanStack Query
import { useQuery } from '@tanstack/react-query';

const AnalyticsDashboard = ({ projectId }: { projectId?: number }) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard', 'month', projectId],
    queryFn: () => api.get(`/api/analytics/dashboard?period=month${projectId ? `&project_id=${projectId}` : ''}`),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Completed Tasks: {analytics.completion_analytics.total_completed}</h2>
      <p>Completion Rate: {analytics.completion_rate.completion_rate}%</p>
      <p>Trend: {analytics.comparison.comparison.trend}</p>
    </div>
  );
};
```

## Database Queries

The analytics system uses efficient SQL queries with proper indexing:

### Key Indexes
- `tasks.completed_at` - For date range queries
- `tasks.project_id` - For project filtering
- `tasks.project_stage_id` - For stage filtering
- `tasks.assignee_id` - For user filtering
- `tasks.priority` - For priority filtering

### Query Optimization
- Uses query cloning to avoid N+1 queries
- Joins only necessary tables (projects, stages, users)
- Groups by relevant dimensions
- Limits result sets with proper ordering

## Performance Considerations

1. **Caching**: Consider caching analytics results for frequently accessed periods
2. **Batch Processing**: For large datasets, consider background job processing
3. **Pagination**: Breakdown arrays (by_project, by_stage, etc.) are not paginated - consider limits for large organizations
4. **Date Ranges**: Custom date ranges allow flexibility but default period ranges are optimized

## Testing

Test analytics endpoints with:
```bash
php artisan test --filter=AnalyticsTest
```

Create test data:
```bash
php artisan db:seed --class=TestTaskSeeder
```

## Swagger Documentation

Access full API documentation at:
```
http://your-domain/api/documentation
```

The Swagger UI provides interactive testing for all analytics endpoints.

Regenerate documentation after changes:
```bash
php artisan l5-swagger:generate
```

## Future Enhancements

Potential additions to the analytics system:
- Export analytics to CSV/Excel
- Scheduled email reports
- Custom date ranges in dashboard
- Predictive analytics (completion forecasting)
- Team performance benchmarking
- Burndown charts
- Velocity tracking
- SLA compliance tracking
