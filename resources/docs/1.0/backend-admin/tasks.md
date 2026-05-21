# Backend Admin - Tasks

The backend admin is the Filament panel at `/admin`. It is intended for system administration, data correction, feature settings, and operational support. Normal day-to-day work should happen in the main Aura frontend when possible.

![Backend admin Tasks](/docs/screenshots/filament/tasks.png)

## Step By Step

1. Open Tasks from the backend sidebar.
2. Find the task by title, project, assignee, or status.
3. Use backend edits only to correct data that cannot be repaired through the frontend.
4. Check parent/subtask relationships and due dates before saving.
5. Confirm the task appears in the correct frontend board or task list after saving.

## Safety Checks

1. Verify the record is the correct one before saving.
2. Prefer frontend workflows for ordinary business actions.
3. After backend edits, verify the main application still shows the expected result.

## Related Pages

- [Backend admin overview](/{{route}}/{{version}}/backend-admin/overview)
- [Developer architecture](/{{route}}/{{version}}/developer/architecture)
