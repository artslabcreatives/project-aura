# Backend Admin - Background Jobs

The backend admin is the Filament panel at `/admin`. It is intended for system administration, data correction, feature settings, and operational support. Normal day-to-day work should happen in the main Aura frontend when possible.

![Backend admin Background Jobs](/docs/screenshots/filament/background-jobs.png)

## Step By Step

1. Open Background Jobs from the backend sidebar.
2. Review recent job names, statuses, started/completed timestamps, and errors.
3. Use failed job details to decide whether a retry or code fix is needed.
4. Do not clear evidence before a developer has captured error context.
5. After remediation, confirm new jobs complete successfully.

## Safety Checks

1. Verify the record is the correct one before saving.
2. Prefer frontend workflows for ordinary business actions.
3. After backend edits, verify the main application still shows the expected result.

## Related Pages

- [Backend admin overview](/{{route}}/{{version}}/backend-admin/overview)
- [Developer architecture](/{{route}}/{{version}}/developer/architecture)
