# Developer - API Surface

## Core Areas

1. Authentication: `/api/login`, `/api/logout`, `/api/user`, password reset, set password, and two-factor endpoints.
2. Organization: users, departments, project groups, stage groups, and tags.
3. Project work: projects, stages, tasks, task attachments, project collaborators, purchase orders, and reports.
4. Finance/client work: clients, contacts, suppliers, estimates, invoices, expenses, Xero, and Zoho mail.
5. Productivity: reminders, notifications, search, analytics, task efficiency, documents, and AI chatbot routes.

## Developer Checks

1. Keep API changes backward-compatible with existing React service modules.
2. Update request validation and tests when adding fields.
3. Verify role restrictions in both controller logic and frontend route visibility.
4. Regenerate Swagger docs when OpenAPI annotations change.
5. Add a manual page when a new user-facing page or backend resource is introduced.
