# Swagger Annotations Quick Reference

## Basic Imports

```php
use OpenApi\Attributes as OA;
```

## HTTP Methods

### GET Request
```php
#[OA\Get(
    path: "/endpoint",
    summary: "Description",
    tags: ["Category"],
    responses: [...]
)]
```

### POST Request
```php
#[OA\Post(
    path: "/endpoint",
    summary: "Description",
    tags: ["Category"],
    requestBody: new OA\RequestBody(...),
    responses: [...]
)]
```

### PUT/PATCH Request
```php
#[OA\Put(
    path: "/endpoint/{id}",
    summary: "Description",
    tags: ["Category"],
    parameters: [...],
    requestBody: new OA\RequestBody(...),
    responses: [...]
)]
```

### DELETE Request
```php
#[OA\Delete(
    path: "/endpoint/{id}",
    summary: "Description",
    tags: ["Category"],
    parameters: [...],
    responses: [...]
)]
```

## Authentication

Add to any protected endpoint:
```php
security: [["bearerAuth" => []]]
```

## Request Body (POST/PUT)

```php
requestBody: new OA\RequestBody(
    required: true,
    content: new OA\JsonContent(
        required: ["field1", "field2"],
        properties: [
            new OA\Property(
                property: "field1",
                type: "string",
                example: "value"
            ),
            new OA\Property(
                property: "field2",
                type: "integer",
                example: 123
            ),
        ]
    )
)
```

## Parameters

### Path Parameter
```php
parameters: [
    new OA\Parameter(
        name: "id",
        in: "path",
        required: true,
        description: "Resource ID",
        schema: new OA\Schema(type: "integer")
    )
]
```

### Query Parameter
```php
parameters: [
    new OA\Parameter(
        name: "page",
        in: "query",
        required: false,
        description: "Page number",
        schema: new OA\Schema(type: "integer", default: 1)
    )
]
```

## Property Types

```php
// String
new OA\Property(property: "name", type: "string", example: "John")

// Integer
new OA\Property(property: "age", type: "integer", example: 30)

// Boolean
new OA\Property(property: "active", type: "boolean", example: true)

// Float
new OA\Property(property: "price", type: "number", format: "float", example: 99.99)

// Email
new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com")

// Date
new OA\Property(property: "date", type: "string", format: "date", example: "2024-01-23")

// DateTime
new OA\Property(property: "created_at", type: "string", format: "date-time", example: "2024-01-23T12:00:00Z")

// Array of strings
new OA\Property(
    property: "tags",
    type: "array",
    items: new OA\Items(type: "string"),
    example: ["tag1", "tag2"]
)

// Array of objects
new OA\Property(
    property: "items",
    type: "array",
    items: new OA\Items(
        properties: [
            new OA\Property(property: "id", type: "integer"),
            new OA\Property(property: "name", type: "string")
        ]
    )
)

// Nested object
new OA\Property(
    property: "user",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer"),
        new OA\Property(property: "name", type: "string")
    ]
)

// Enum
new OA\Property(
    property: "status",
    type: "string",
    enum: ["pending", "approved", "rejected"],
    example: "pending"
)

// Nullable
new OA\Property(property: "description", type: "string", nullable: true)
```

## Responses

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

### Created Response
```php
new OA\Response(
    response: 201,
    description: "Resource created",
    content: new OA\JsonContent(...)
)
```

### No Content
```php
new OA\Response(
    response: 204,
    description: "No content"
)
```

### Error Responses
```php
new OA\Response(response: 400, description: "Bad request")
new OA\Response(response: 401, description: "Unauthorized")
new OA\Response(response: 403, description: "Forbidden")
new OA\Response(response: 404, description: "Not found")
new OA\Response(response: 422, description: "Validation error")
new OA\Response(response: 500, description: "Server error")
```

## Complete Example

```php
#[OA\Post(
    path: "/tasks",
    summary: "Create a new task",
    security: [["bearerAuth" => []]],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ["title", "project_id"],
            properties: [
                new OA\Property(
                    property: "title",
                    type: "string",
                    example: "Design homepage"
                ),
                new OA\Property(
                    property: "description",
                    type: "string",
                    nullable: true,
                    example: "Create wireframes and mockups"
                ),
                new OA\Property(
                    property: "project_id",
                    type: "integer",
                    example: 1
                ),
                new OA\Property(
                    property: "priority",
                    type: "string",
                    enum: ["low", "medium", "high"],
                    example: "high"
                ),
                new OA\Property(
                    property: "due_date",
                    type: "string",
                    format: "date",
                    example: "2024-02-01"
                ),
                new OA\Property(
                    property: "tags",
                    type: "array",
                    items: new OA\Items(type: "string"),
                    example: ["design", "urgent"]
                )
            ]
        )
    ),
    tags: ["Tasks"],
    responses: [
        new OA\Response(
            response: 201,
            description: "Task created successfully",
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "id", type: "integer", example: 1),
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "description", type: "string", nullable: true),
                    new OA\Property(property: "status", type: "string", example: "pending"),
                    new OA\Property(
                        property: "project",
                        type: "object",
                        properties: [
                            new OA\Property(property: "id", type: "integer"),
                            new OA\Property(property: "name", type: "string")
                        ]
                    ),
                    new OA\Property(
                        property: "created_at",
                        type: "string",
                        format: "date-time"
                    )
                ]
            )
        ),
        new OA\Response(response: 401, description: "Unauthorized"),
        new OA\Response(response: 422, description: "Validation error")
    ]
)]
public function store(Request $request): JsonResponse
{
    // Your code
}
```

## Tags (Categories)

Group related endpoints:
```php
tags: ["Authentication"]
tags: ["Projects"]
tags: ["Tasks"]
tags: ["Users"]
```

## Generate Documentation

After adding/updating annotations:
```bash
php artisan l5-swagger:generate
```

## View Documentation

```
http://localhost/api/documentation
```
