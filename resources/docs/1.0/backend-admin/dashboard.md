# Backend Admin - Dashboard

The backend admin is the Filament panel at `/admin`. It is intended for system administration, data correction, feature settings, and operational support. Normal day-to-day work should happen in the main Aura frontend when possible.

![Backend admin Dashboard](/docs/screenshots/filament/dashboard.png)

## Step By Step

1. Open `/admin` after signing in to the Filament backend.
2. Review dashboard widgets for high-level system state.
3. Use the sidebar to move to resources such as Users, Projects, Tasks, and Settings.
4. Do not edit records from the backend unless the frontend workflow is insufficient or administrative correction is required.
5. After using the backend, return to the main app and verify the frontend still reflects the expected state.

## Safety Checks

1. Verify the record is the correct one before saving.
2. Prefer frontend workflows for ordinary business actions.
3. After backend edits, verify the main application still shows the expected result.

## Related Pages

- [Backend admin overview](/{{route}}/{{version}}/backend-admin/overview)
- [Developer architecture](/{{route}}/{{version}}/developer/architecture)
