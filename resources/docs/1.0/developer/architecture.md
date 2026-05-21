# Developer - Architecture

## Application Shape

1. Laravel serves API routes from `routes/api.php` and the React shell from `routes/web.php`.
2. The frontend application lives in `resources/js/project-aura-new/src`.
3. Role dashboards are selected in `resources/js/project-aura-new/src/pages/UserDashboard.tsx`.
4. Sidebar navigation and role visibility live in `resources/js/project-aura-new/src/components/AppSidebar.tsx`.
5. Filament backend resources live in `app/Filament`.
6. LaRecipe docs live in `resources/docs/1.0` and are served from `/manuals`.

## Main Frontend Roles

1. `admin` receives the full cross-system frontend panel.
2. `team-lead` receives department and review-focused workflows.
3. `account-manager` receives assigned client/review workflows.
4. `hr` receives strategic project/deadline and people visibility.
5. `user` receives the employee task-focused panel.
