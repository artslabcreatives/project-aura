# Automatic Task Progression System

## Overview
This document explains the automatic task progression feature that moves tasks to the next stage and assigns them to the appropriate user when marked as complete.

## How It Works

When a user marks a task as "complete", the system automatically:

1. **Identifies the target stage** based on:
   - If the current stage has a `linked_review_stage_id`, the task moves to that review stage
   - Otherwise, the task moves to the next stage in sequential order (based on the `order` field)

2. **Handles Review Stages** (when moving to a review stage):
   - Keeps the task status as "complete"
   - Preserves the current assignee for review context
   - Stores the `previous_stage_id` (where the task came from)
   - Stores the `original_assignee_id` (who completed the task)
   - Sets the `completed_at` timestamp

3. **Handles Regular Stages** (when moving to a non-review stage):
   - Resets the task status to "pending"
   - Auto-assigns the task to the `main_responsible_id` of the target stage
   - If no main responsible is set, the task is unassigned
   - Sets the `completed_at` timestamp

## Backend Implementation

### TaskObserver
Location: `/app/Observers/TaskObserver.php`

The observer listens to Task model updates and triggers automatic stage progression when:
- The `user_status` field changes to "complete"
- The task has a current stage assigned

### Registration
Location: `/app/Providers/AppServiceProvider.php`

The observer is registered in the `boot()` method:
```php
Task::observe(TaskObserver::class);
```

## Frontend Changes

The frontend has been simplified to remove the manual stage progression logic. Now it:
- Simply updates the task status to "complete" when the user marks it as done
- The backend observer handles all stage progression and assignment logic automatically
- Tasks marked as complete are removed from the user's view after 10 seconds

## Database Fields Used

- `user_status`: The current status (pending, in-progress, complete)
- `project_stage_id`: The current stage of the task
- `assignee_id`: Who the task is assigned to
- `previous_stage_id`: For review stages, stores where the task came from
- `original_assignee_id`: For review stages, stores who originally completed the task
- `completed_at`: Timestamp when the task was marked complete

## Stage Configuration

Stages have the following relevant fields:
- `order`: Sequential order of stages
- `main_responsible_id`: Default assignee for tasks in this stage
- `is_review_stage`: Whether this is a review stage
- `linked_review_stage_id`: If set, tasks move here instead of the next sequential stage
- `approved_target_stage_id`: For review stages, where approved tasks go

## Benefits

1. **Automatic Workflow**: Tasks flow automatically through the project stages
2. **Proper Assignment**: Each task is automatically assigned to the right person
3. **Review Tracking**: Review stages preserve context about who completed the work
4. **Consistent Behavior**: Backend handles the logic, ensuring consistency across all clients
5. **Audit Trail**: Timestamps and previous stage tracking provide a complete history

## Testing

To test the automatic progression:
1. Create a project with multiple stages and set `main_responsible_id` for each
2. Create a task in the first stage
3. Mark the task as "complete"
4. Verify that:
   - The task moves to the next stage (or review stage if configured)
   - The task is assigned to the main responsible person of that stage
   - The status is reset to "pending" (for regular stages)
   - The `completed_at` timestamp is set

## Logging

The observer logs important events for debugging:
- Task moves to review stages
- Task moves to next regular stages
- Assignment changes
- Any errors during the process

Check the Laravel logs at `storage/logs/laravel.log` for details.
