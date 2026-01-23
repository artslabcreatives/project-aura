# Swagger API Documentation Guide

## Installation Complete! ✅

Swagger has been successfully installed and configured for your Laravel application.

## Access the Documentation

You can now access the Swagger UI at:
```
http://your-domain/api/documentation
```

For local development:
```
http://localhost/api/documentation
```

## What's Been Done

1. ✅ Installed `darkaonline/l5-swagger` package
2. ✅ Published configuration to `config/l5-swagger.php`
3. ✅ Added base Swagger annotations to `app/Http/Controllers/Controller.php`
4. ✅ Added example annotations to `app/Http/Controllers/Api/AuthController.php`
5. ✅ Generated initial API documentation

## How to Add Annotations to Your Controllers

### Basic Structure

```php
use OpenApi\Attributes as OA;

class YourController extends Controller
{
    #[OA\Get(
        path: "/your-endpoint",
        summary: "Brief description",
        tags: ["Category"],
        responses: [
            new OA\Response(response: 200, description: "Success"),
        ]
    )]
    public function yourMethod(Request $request)
    {
        // Your code
    }
}
```

### Protected Endpoints (Require Authentication)

Add `security` parameter:

```php
#[OA\Get(
    path: "/protected-endpoint",
    summary: "Get protected resource",
    security: [["bearerAuth" => []]],
    tags: ["Protected"],
    responses: [...]
)]
```

### POST Requests with Request Body

```php
#[OA\Post(
    path: "/create-resource",
    summary: "Create a new resource",
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["name", "email"],
            properties: [
                new OA\Property(property: "name", type: "string", example: "John Doe"),
                new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
                new OA\Property(property: "age", type: "integer", example: 30),
            ]
        )
    ),
    tags: ["Resources"],
    responses: [
        new OA\Response(response: 201, description: "Created"),
        new OA\Response(response: 422, description: "Validation error")
    ]
)]
```

### Path Parameters

```php
#[OA\Get(
    path: "/users/{id}",
    summary: "Get user by ID",
    tags: ["Users"],
    parameters: [
        new OA\Parameter(
            name: "id",
            in: "path",
            required: true,
            schema: new OA\Schema(type: "integer")
        )
    ],
    responses: [...]
)]
```

### Query Parameters

```php
#[OA\Get(
    path: "/users",
    summary: "List users",
    tags: ["Users"],
    parameters: [
        new OA\Parameter(
            name: "page",
            in: "query",
            required: false,
            schema: new OA\Schema(type: "integer", default: 1)
        ),
        new OA\Parameter(
            name: "per_page",
            in: "query",
            required: false,
            schema: new OA\Schema(type: "integer", default: 15)
        )
    ],
    responses: [...]
)]
```

## Your API Routes to Document

Based on your `routes/api.php`, here are the endpoints to document:

### Authentication (Public)
- POST `/api/login` ✅ (Already documented)
- POST `/api/check-email` ✅ (Already documented)
- POST `/api/forgot-password`
- POST `/api/verify-otp`
- POST `/api/reset-password`

### Authentication (Protected)
- POST `/api/logout` ✅ (Already documented)
- GET `/api/user` ✅ (Already documented)

### Projects
- GET `/api/projects`
- POST `/api/projects`
- GET `/api/projects/{id}`
- PUT `/api/projects/{id}`
- DELETE `/api/projects/{id}`
- GET `/api/projects/{project}/suggested-tasks`
- POST `/api/projects/{project}/suggested-tasks`
- GET `/api/projects/search/email`
- GET `/api/projects/search/whatsapp`

### Tasks
- GET `/api/tasks`
- POST `/api/tasks`
- GET `/api/tasks/{id}`
- PUT `/api/tasks/{id}`
- DELETE `/api/tasks/{id}`
- POST `/api/tasks/{task}/complete`
- POST `/api/tasks/{task}/start`

### Other Resources
- Departments (CRUD)
- Stages (CRUD)
- Task Attachments (CRUD)
- Revision Histories (CRUD)
- History Entries (CRUD)
- Users (CRUD)
- Project Groups (CRUD)
- Feedback (CRUD)
- Tags (CRUD)
- Notifications (GET, PATCH, DELETE)

## Regenerate Documentation

After adding or updating annotations, regenerate the documentation:

```bash
php artisan l5-swagger:generate
```

## Common Response Structures

### Success Response
```php
new OA\Response(
    response: 200,
    description: "Successful operation",
    content: new OA\JsonContent(
        properties: [
            new OA\Property(property: "message", type: "string"),
            new OA\Property(property: "data", type: "object")
        ]
    )
)
```

### Error Responses
```php
new OA\Response(response: 400, description: "Bad request"),
new OA\Response(response: 401, description: "Unauthorized"),
new OA\Response(response: 403, description: "Forbidden"),
new OA\Response(response: 404, description: "Not found"),
new OA\Response(response: 422, description: "Validation error"),
new OA\Response(response: 500, description: "Server error")
```

## Configuration

Main configuration file: `config/l5-swagger.php`

Key settings:
- Documentation route: `/api/documentation`
- Scan path: `app/` directory
- Output: `storage/api-docs/api-docs.json`

## Tips

1. **Use Tags**: Group related endpoints together with tags
2. **Be Descriptive**: Write clear summaries and descriptions
3. **Include Examples**: Add example values to help API consumers
4. **Document Errors**: Include all possible error responses
5. **Keep Updated**: Regenerate docs after changes

## Next Steps

1. Add annotations to remaining controllers
2. Test the documentation UI at `/api/documentation`
3. Share the documentation link with your frontend team
4. Consider adding more detailed response schemas for complex objects

## Resources

- [L5-Swagger Documentation](https://github.com/DarkaOnLine/L5-Swagger)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger PHP Annotations](https://zircote.github.io/swagger-php/)
