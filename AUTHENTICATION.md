# Authentication Setup

This application now uses Laravel session-based authentication instead of user switching.

## Setup Instructions

1. Run migrations:
```bash
php artisan migrate
```

2. Create test users:
```bash
php artisan db:seed --class=TestUserSeeder
```

3. Test credentials:
   - **Admin**: admin@example.com / password
   - **Team Lead**: teamlead@example.com / password
   - **User**: user@example.com / password

## Features Implemented

### Authentication
- Session-based authentication using Laravel's built-in Auth system
- Login/logout endpoints at `/api/login` and `/api/logout`
- Protected API routes require authentication
- Frontend login page with email/password form
- Automatic redirect to login if unauthenticated

### User Tracking
- Tasks automatically assigned to authenticated user if no assignee specified
- History entries automatically track the authenticated user
- User information displayed in the header (name and role)
- Logout button in the header

### Fixed Issues
1. ✅ Removed user switching dropdown - users must now log in
2. ✅ User tracking in tasks - authenticated user is automatically used
3. ✅ User tracking in history - authenticated user is automatically recorded
4. ✅ Department assignment in projects - fixed null/undefined handling
5. ✅ History displays user names correctly with fallback for deleted users
6. ⚠️ File uploads - basic implementation added, but frontend still uses base64 encoding

## File Upload Note

The file upload functionality has been partially implemented:
- Backend can handle actual file uploads (multipart/form-data)
- Files are stored in `storage/app/public/task-attachments`
- Frontend currently reads files as base64 data URLs
- Full implementation requires refactoring to upload files after task creation

For now, link attachments work perfectly. Actual file uploads can be completed in a future update.

## API Changes

### Protected Routes
All API routes now require authentication except:
- POST `/api/login`
- POST `/api/logout` (logs out current session)
- GET `/api/user` (returns current authenticated user)

### Automatic User Tracking
The following operations now automatically use the authenticated user:
- Creating history entries (user_id is set from auth)
- Creating tasks without an assignee (assignee_id defaults to auth user)
- All operations are attributed to the logged-in user

## Frontend Changes

### Removed Features
- User switching dropdown
- Manual user selection
- localStorage user persistence

### Added Features
- Login page with email/password
- Logout button
- Authentication state management
- Automatic redirect to login on 401 responses
- Display of current user info in header

## Session Configuration

The application uses Laravel's default session configuration:
- Driver: file (can be changed to redis/database in production)
- Cookie name: laravel_session
- Secure cookies: enabled in production
- SameSite: lax
- HTTP only: true

## CORS Configuration

CORS has been configured to support credentials:
- `supports_credentials: true`
- `withCredentials: true` in frontend API calls
- Cookies are included in all API requests
