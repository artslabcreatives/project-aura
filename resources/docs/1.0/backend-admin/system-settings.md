# Backend Admin - System Settings

The backend admin is the Filament panel at `/admin`. It is intended for system administration, data correction, feature settings, and operational support. Normal day-to-day work should happen in the main Aura frontend when possible.

![Backend admin System Settings](/docs/screenshots/filament/system-settings.png)

## Step By Step

1. Open System Settings from the backend sidebar.
2. Review feature flags such as chatbot or AI scenario controls.
3. Change one setting at a time and save.
4. Log in as an affected role to verify the feature appears or disappears as expected.
5. Document any feature flag change in release notes or operational handover.

## Safety Checks

1. Verify the record is the correct one before saving.
2. Prefer frontend workflows for ordinary business actions.
3. After backend edits, verify the main application still shows the expected result.

## Related Pages

- [Backend admin overview](/{{route}}/{{version}}/backend-admin/overview)
- [Developer architecture](/{{route}}/{{version}}/developer/architecture)
