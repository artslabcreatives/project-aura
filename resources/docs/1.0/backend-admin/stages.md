# Backend Admin - Stages

The backend admin is the Filament panel at `/admin`. It is intended for system administration, data correction, feature settings, and operational support. Normal day-to-day work should happen in the main Aura frontend when possible.

![Backend admin Stages](/docs/screenshots/filament/stages.png)

## Step By Step

1. Open Stages from the backend sidebar.
2. Review project, order, type, responsible users, and review-stage flags.
3. Create/edit stages carefully because they define project workflow.
4. Check linked review and approved target stages before saving.
5. Return to the frontend board and confirm column order and task behavior.

## Safety Checks

1. Verify the record is the correct one before saving.
2. Prefer frontend workflows for ordinary business actions.
3. After backend edits, verify the main application still shows the expected result.

## Related Pages

- [Backend admin overview](/{{route}}/{{version}}/backend-admin/overview)
- [Developer architecture](/{{route}}/{{version}}/developer/architecture)
