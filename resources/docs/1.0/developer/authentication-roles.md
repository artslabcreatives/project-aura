# Developer - Authentication And Roles

## Auth Flow

1. The login form posts to `POST /api/login`.
2. The API returns a Sanctum bearer token when credentials are valid.
3. The React client stores the token in `localStorage.auth_token`.
4. Authenticated requests call `GET /api/user` to hydrate the current user.
5. Protected frontend routes check `currentUser.role` before rendering.

## Role Maintenance

1. User roles are stored in the `users.role` column.
2. Current frontend roles are `admin`, `team-lead`, `account-manager`, `hr`, and `user`.
3. Department visibility depends on `users.department_id` and project department relationships.
4. When changing a role, verify both the sidebar and direct routes.
5. If route access looks stale, clear browser storage and fetch `/api/user` again.
