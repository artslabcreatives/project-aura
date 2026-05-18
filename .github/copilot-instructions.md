# Aura Project Management System - AI Agent Instructions

## Project Overview

**Aura** is a comprehensive project management system built with Laravel 11 + React, featuring real-time task updates, team collaboration, and advanced workflow automation. The architecture separates backend services (PHP/Laravel) from frontend (React with TypeScript).

### Key Technologies
- **Backend**: Laravel 11, Eloquent ORM, Laravel Reverb (WebSocket broadcasting)
- **Frontend**: React 18+, TypeScript, Vite, TanStack Query, Radix UI
- **Integrations**: Mattermost, Typesense search, Laravel MCP (Model Context Protocol), Filament admin panel
- **Database**: MySQL, migrations in [database/migrations/](database/migrations/)

## Essential Architecture

### Database Models & Relationships
Core entities and their relationships:

- **Project** → has many **Stages** → has many **Tasks**
- **Task** → assigned to **User**, belongs to **Stage** and **Project**
- **User** → has many **Tasks** (as assignee or via **TaskAssignee** junction table)
- **Department** → has many **Projects**
- **ProjectGroup** → groups multiple **Projects**

**Key Fields**: `user_status` (pending/in-progress/complete), `project_stage_id`, `assignee_id`, `priority`, `tags`

See [app/Models/](app/Models/) for full definitions.

### Automatic Task Progression System
**Critical Pattern**: When a task is marked `user_status = 'complete'`, the [TaskObserver](app/Observers/TaskObserver.php) automatically:
1. Moves task to a **review stage** (if configured via `linked_review_stage_id`), OR
2. Moves task to the **next sequential stage** and auto-assigns to that stage's `main_responsible_id`
3. For subtasks (`parent_id` set), progression is skipped - they stay in parent's stage

This is NOT a manual workflow step - it's automated on database update. See [TASK_PROGRESSION.md](TASK_PROGRESSION.md).

### Real-Time Broadcasting
- **Events**: [TaskUpdated](app/Events/TaskUpdated.php), [ProjectUpdated](app/Events/ProjectUpdated.php)
- **Transport**: Laravel Reverb WebSocket server on port 8080
- **Setup**: `.env` config: `REVERB_HOST`, `REVERB_PORT`, `REVERB_APP_ID`, `REVERB_APP_KEY`
- **Frontend**: React components subscribe via Reverb channels for live UI updates

### API Architecture
- **Routes**: Protected with `auth:sanctum` middleware at [routes/api.php](routes/api.php)
- **Controllers**: RESTful controllers in [app/Http/Controllers/Api/](app/Http/Controllers/Api/)
- **Documentation**: Swagger UI at `/api/documentation`, regenerate with `php artisan l5-swagger:generate`
- **Search**: Typesense integration via Laravel Scout for full-text search

### Mattermost Integration
Automatic syncing of projects and users to Mattermost workspace:
- **Setup**: Requires `MATTERMOST_URL`, `MATTERMOST_TOKEN`, `MATTERMOST_TEAM_ID` in `.env`
- **Service**: [MattermostService](app/Services/MattermostService.php) handles API calls
- **Features**: Auto-creates channels, syncs members, archives on project deletion
- **Sync Commands**: `php artisan mattermost:sync-users`, `php artisan mattermost:sync-projects`
- **See**: [MATTERMOST_INTEGRATION.md](MATTERMOST_INTEGRATION.md)

### Laravel MCP (Model Context Protocol)
Bidirectional AI integration layer at [app/Mcp/](app/Mcp/):
- **Resources**: [ProjectResource](app/Mcp/Resources/ProjectResource.php), [TaskResource](app/Mcp/Resources/TaskResource.php), etc.
- **Prompts**: Custom instructions for AI agents
- **Tools**: Custom operations exposed to MCP clients
- **Route Prefix**: `/mcp` with SSE (Server-Sent Events) for streaming
- **Config**: [config/mcp.php](config/mcp.php)

## Critical Developer Workflows

### Local Setup
```bash
composer install
npm install
php artisan migrate
php artisan db:seed --class=TestUserSeeder  # Creates test users
php artisan l5-swagger:generate              # Generate API docs
```

### Running the Application
```bash
php artisan serve                 # Backend on :8000
npm run dev                       # Frontend (Vite) on :5173
php artisan reverb:start          # WebSocket server on :8080
php artisan queue:work            # Process background jobs (optional)
```

### Testing
```bash
php artisan test                  # Run PHPUnit tests
php artisan test --filter=TaskTest  # Run specific test
```

### Database Workflow
1. **Create Migration**: `php artisan make:migration create_foo_table`
2. **Model**: `php artisan make:model ModelName` (use `-m` flag to add migration)
3. **Seeder**: `php artisan make:seeder FooSeeder`
4. **Run**: `php artisan migrate` or `php artisan migrate:fresh --seed`

### Frontend Build & Deployment
```bash
npm run build                     # Production build
npm run lint                      # ESLint checks
```
**Note**: Custom build script in [package.json](package.json) builds React app in `resources/js/project-aura-new/` then copies to public directory.

## Project-Specific Conventions

### API Responses
All API endpoints return standard JSON responses with proper HTTP status codes:
- **200**: Success with data
- **201**: Resource created
- **400**: Validation error
- **401**: Unauthenticated
- **403**: Unauthorized
- **404**: Not found
- **Pagination**: Uses `?page=1&per_page=15` query params

### Task Status Values
- `pending` → Not yet started
- `in-progress` → Currently being worked on
- `complete` → Finished (triggers automatic stage progression)

### Priority Levels
Valid values: `low`, `medium`, `high` (used in filtering and display)

### Authentication
- **Method**: Laravel Sanctum (session-based + token)
- **Guard**: `sanctum` for API, `web` for sessions
- **Test Users**: See [database/seeders/TestUserSeeder.php](database/seeders/TestUserSeeder.php)
  - admin@example.com / password
  - teamlead@example.com / password
  - user@example.com / password

### History & Audit Trail
- [TaskHistory](app/Models/TaskHistory.php) records task lifecycle changes
- [TaskHistoryService](app/Services/TaskHistoryService.php) handles logging
- [HistoryEntry](app/Models/HistoryEntry.php) tracks general record changes
- Always use `TaskHistoryService->trackTaskUpdated()` when modifying tasks

### Frontend Component Structure
React app in [resources/js/project-aura-new/src/](resources/js/project-aura-new/src/):
- **components/**: Reusable UI components (Radix UI based)
- **pages/**: Page-level components (routed via React Router)
- **hooks/**: Custom React hooks (e.g., `use-user.tsx` for auth state)
- **services/**: API client services
- **types/**: TypeScript interfaces
- **lib/**: Utility functions (API client in [lib/api.ts](resources/js/project-aura-new/src/lib/api.ts))

### Search Integration
- **Engine**: Typesense (configured in [config/scout.php](config/scout.php))
- **Models**: Make searchable with `use Searchable` trait
- **Sync**: `php artisan scout:sync Task` (after model changes)
- **Search Endpoints**: [SearchController](app/Http/Controllers/Api/Search/SearchController.php)

### File Attachments
- **Model**: [TaskAttachment](app/Models/TaskAttachment.php)
- **Controller**: [TaskAttachmentController](app/Http/Controllers/Api/TaskAttachmentController.php)
- **Download**: Route includes file authorization checks
- **Storage**: Files stored in `storage/app/` via Laravel filesystem

## Key Integration Points

### Webhook Integration (Mattermost)
- Mattermost channels created automatically when projects are created
- Channel ID stored in `projects.mattermost_channel_id`
- Users synced to Mattermost automatically on creation/update
- **Important**: Token refresh documented in [MATTERMOST_PERSONAL_TOKENS.md](MATTERMOST_PERSONAL_TOKENS.md)

### Event Broadcasting to Frontend
Tasks/Projects changes broadcast to connected clients via Reverb:
```php
TaskUpdated::dispatch($task, 'update');  // Frontend receives real-time update
```

### Notifications
- [Notifications/](app/Notifications/) directory contains notification classes
- Task completion triggers notifications to review stage assignees
- Slack integration available via `laravel/slack-notification-channel`

## Common Implementation Patterns

### Adding a New API Endpoint
1. Create controller in [app/Http/Controllers/Api/](app/Http/Controllers/Api/) extending `Controller`
2. Add routes in [routes/api.php](routes/api.php) within `auth:sanctum` middleware group
3. Add OpenAPI/Swagger annotations using `#[OA\...]` attributes
4. Test with `php artisan test`
5. Regenerate docs: `php artisan l5-swagger:generate`

### Adding a New Model Relationship
1. Define relationship method in Model class (see [app/Models/Task.php](app/Models/Task.php) for examples)
2. Include in controller queries: `Task::with(['project', 'assignee', ...])`
3. Update MCP Resource if exposing via AI integration
4. Add migration if adding foreign key: `Schema::table(...)`

### Modifying Task Workflow
1. Update [TaskObserver](app/Observers/TaskObserver.php) for auto-progression logic
2. Add [TaskHistoryService](app/Services/TaskHistoryService.php) calls to track changes
3. Broadcast events with `TaskUpdated::dispatch()`
4. Test stage transitions thoroughly (see [TASK_PROGRESSION.md](TASK_PROGRESSION.md))

### Frontend API Calls
```typescript
// Use lib/api.ts client (handles auth, credentials, base URL)
const { data } = await api.get(`/api/tasks?project_id=${id}`);
// Or use hooks with TanStack Query for cached queries
const { data: tasks } = useQuery({
  queryKey: ['tasks', projectId],
  queryFn: () => api.get(`/api/tasks?project_id=${projectId}`),
});
```

## Debugging & Logs

- **Laravel Logs**: `storage/logs/laravel.log`
- **MCP Logs**: Configured in [config/mcp.php](config/mcp.php) with `LOG_LEVEL`
- **WebSocket Status**: Check Reverb server startup messages
- **API Docs**: Visit `/api/documentation` to test endpoints
- **Filament Admin**: Available at `/filament` for data management

## External Dependencies & Versions

- **PHP**: ^8.2
- **Laravel**: ^11.0
- **Laravel Scout**: ^10.23 (Typesense search)
- **Laravel MCP**: ^0.4.0 (AI integration)
- **Laravel Reverb**: ^1.7 (WebSockets)
- **Filament**: ^3.3 (Admin panel)
- **Swagger/OpenAPI**: ^10.1
- **React**: 18+ with TypeScript
- **Vite**: Build tool for frontend

## First Steps for New Contributors

1. **Understand the data model**: Read [app/Models/Task.php](app/Models/Task.php) and trace relationships
2. **Review task progression**: Read [TASK_PROGRESSION.md](TASK_PROGRESSION.md) - this is unique to Aura
3. **Check API routes**: Browse [routes/api.php](routes/api.php) to understand endpoint structure
4. **Setup locally**: Follow "Local Setup" workflow above
5. **Test an endpoint**: Use `/api/documentation` Swagger UI or curl to call an endpoint
6. **Make a small change**: Add a new field to a model and create a migration to practice the flow
