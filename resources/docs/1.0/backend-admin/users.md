# Backend Admin - Users

The backend admin is the Filament panel at `/admin`. It is intended for system administration, data correction, feature settings, and operational support. Normal day-to-day work should happen in the main Aura frontend when possible.

![Backend admin Users](/docs/screenshots/filament/users.png)

## Step By Step

1. Open Users from the Filament sidebar.
2. Search for the user by name or email before creating a new account.
3. Use Create user for new staff and Edit for role, department, active state, capacity, and related account fields.
4. When changing a role, verify the user can access only the intended frontend pages.
5. Save and confirm the row reflects the new value.

## Safety Checks

1. Verify the record is the correct one before saving.
2. Prefer frontend workflows for ordinary business actions.
3. After backend edits, verify the main application still shows the expected result.

## Related Pages

- [Backend admin overview](/{{route}}/{{version}}/backend-admin/overview)
- [Developer architecture](/{{route}}/{{version}}/developer/architecture)
