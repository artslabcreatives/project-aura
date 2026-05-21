# Developer - Local Setup

## Step By Step

1. Install PHP 8.2 or newer, Composer, Node.js, npm, and MySQL-compatible database access.
2. Copy or update `.env` with the staging/local database, cache, queue, mail, and Reverb values.
3. Run `composer install` when PHP dependencies change.
4. Run `npm install` when frontend dependencies change.
5. Run `php artisan migrate` only after confirming the target database and backup state.
6. Run `npm run build` for production/staging assets or `npm run dev` for local Vite development.
7. Use `php artisan serve --host=127.0.0.1 --port=8090` for a quick local web server.
8. Visit the app URL and sign in with an active user.

## Verification

1. `php artisan about` should report the expected Laravel version and drivers.
2. The main frontend should load from `resources/views/app.blade.php` through the built Vite assets.
3. API calls should authenticate with Sanctum bearer tokens from `/api/login`.
