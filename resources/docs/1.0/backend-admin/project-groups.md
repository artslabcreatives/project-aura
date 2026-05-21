# Backend Admin - Project Groups

The backend admin is the Filament panel at `/admin`. It is intended for system administration, data correction, feature settings, and operational support. Normal day-to-day work should happen in the main Aura frontend when possible.

![Backend admin Project Groups](/docs/screenshots/filament/project-groups.png)

## Step By Step

1. Open Project Groups from the backend sidebar.
2. Use groups to organize projects under departments or parent groups.
3. Create or rename a group with a name users will recognize in the sidebar.
4. Avoid deleting groups that still contain projects.
5. Verify sidebar grouping in the frontend after changes.

## Safety Checks

1. Verify the record is the correct one before saving.
2. Prefer frontend workflows for ordinary business actions.
3. After backend edits, verify the main application still shows the expected result.

## Related Pages

- [Backend admin overview](/{{route}}/{{version}}/backend-admin/overview)
- [Developer architecture](/{{route}}/{{version}}/developer/architecture)
