# Analytics API Quick Reference

## Base URL
All endpoints require `auth:sanctum` authentication and are prefixed with `/api`

## Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/analytics/completion` | GET | Get completion analytics with breakdowns |
| `/analytics/comparison` | GET | Compare current vs previous period |
| `/analytics/completion-rate` | GET | Calculate completion rate percentage |
| `/analytics/completion-time` | GET | Average and median completion times |
| `/analytics/dashboard` | GET | All analytics in one response |

## Common Parameters

### Required
- `period`: `week` | `month` | `quarter` | `year`

### Optional Filters
- `project_id`: Filter by specific project
- `stage_id`: Filter by specific stage  
- `user_id`: Filter by specific assignee
- `priority`: `low` | `medium` | `high`
- `start_date`: Custom start date (YYYY-MM-DD)
- `end_date`: Custom end date (YYYY-MM-DD)

## Quick Examples

### Monthly completion analytics
```bash
GET /api/analytics/completion?period=month
```

### Weekly comparison
```bash
GET /api/analytics/comparison?period=week
```

### Project-specific dashboard
```bash
GET /api/analytics/dashboard?period=month&project_id=5
```

### Custom date range with filters
```bash
GET /api/analytics/completion?period=month&start_date=2026-01-01&end_date=2026-01-31&priority=high
```

## Response Data Structure

### Completion Analytics Response
```json
{
  "period": "month",
  "start_date": "2026-02-01 00:00:00",
  "end_date": "2026-02-05 15:30:00",
  "total_completed": 42,
  "breakdown": { "2026-02": 42 },
  "by_project": [{"project_id": 1, "project_name": "...", "count": 20}],
  "by_stage": [{"stage_id": 3, "stage_name": "...", "count": 15}],
  "by_user": [{"user_id": 5, "user_name": "...", "count": 18}],
  "by_priority": {"high": 10, "medium": 20, "low": 12}
}
```

### Comparison Response
```json
{
  "current_period": { /* completion analytics */ },
  "previous_period": { /* completion analytics */ },
  "comparison": {
    "absolute_change": 11,
    "percentage_change": 35.48,
    "trend": "up" // or "down" or "stable"
  }
}
```

### Completion Rate Response
```json
{
  "period": "month",
  "total_tasks": 100,
  "completed_tasks": 75,
  "completion_rate": 75.0,
  "pending_tasks": 25
}
```

### Completion Time Response
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

## Period Definitions

- **week**: Current week (Monday to Sunday)
- **month**: Current month (1st to last day)
- **quarter**: Current quarter (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
- **year**: Current year (Jan 1 to Dec 31)

## Testing with curl

```bash
# Get auth token first
TOKEN=$(curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.token')

# Use token for analytics
curl -X GET "http://localhost:8000/api/analytics/dashboard?period=month" \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

## Frontend Integration (React)

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useAnalytics = (period: 'week' | 'month' | 'quarter' | 'year', projectId?: number) => {
  return useQuery({
    queryKey: ['analytics', 'dashboard', period, projectId],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (projectId) params.append('project_id', projectId.toString());
      const response = await api.get(`/api/analytics/dashboard?${params}`);
      return response.data;
    },
  });
};

// Usage in component
const { data, isLoading } = useAnalytics('month', 5);
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 422 Validation Error
```json
{
  "message": "The period field is required.",
  "errors": {
    "period": ["The period field is required."]
  }
}
```

## Swagger Documentation

Full interactive API documentation available at:
```
http://your-domain/api/documentation
```

Navigate to the "Analytics" section to test endpoints directly from the browser.
