<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: "/users",
        summary: "List all users",
        security: [["bearerAuth" => []]],
        tags: ["Users"],
        parameters: [
            new OA\Parameter(
                name: "department_id",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "integer")
            ),
            new OA\Parameter(
                name: "role",
                in: "query",
                required: false,
                schema: new OA\Schema(type: "string", enum: ["user", "team-lead", "admin", "account-manager"])
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of users",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(type: "object")
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = User::with('department');
        
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        $users = $query->get();
        return response()->json($users);
    }

    #[OA\Post(
        path: "/users",
        summary: "Create a new user",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name", "email"],
                properties: [
                    new OA\Property(property: "name", type: "string", example: "John Doe"),
                    new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
                    new OA\Property(property: "password", type: "string", format: "password", nullable: true),
                    new OA\Property(property: "role", type: "string", enum: ["user", "team-lead", "admin", "account-manager"], example: "user"),
                    new OA\Property(property: "department_id", type: "integer", nullable: true)
                ]
            )
        ),
        tags: ["Users"],
        responses: [
            new OA\Response(response: 201, description: "User created"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|in:user,team-lead,admin,account-manager',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        // Auto-generate password if not provided
        if (empty($validated['password'])) {
            $validated['password'] = Hash::make(bin2hex(random_bytes(16)));
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }
        
        $user = User::create($validated);
        return response()->json($user->load('department'), 201);
    }

    #[OA\Get(
        path: "/users/{id}",
        summary: "Get user by ID",
        security: [["bearerAuth" => []]],
        tags: ["Users"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "User details"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "User not found")
        ]
    )]
    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['department', 'assignedTasks']));
    }

    #[OA\Put(
        path: "/users/{id}",
        summary: "Update user",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string"),
                    new OA\Property(property: "email", type: "string", format: "email"),
                    new OA\Property(property: "password", type: "string", format: "password"),
                    new OA\Property(property: "role", type: "string", enum: ["user", "team-lead", "admin", "account-manager"]),
                    new OA\Property(property: "department_id", type: "integer", nullable: true)
                ]
            )
        ),
        tags: ["Users"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "User updated"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "User not found")
        ]
    )]
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:user,team-lead,admin,account-manager',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);
        return response()->json($user->load('department'));
    }

    #[OA\Delete(
        path: "/users/{id}",
        summary: "Delete user",
        security: [["bearerAuth" => []]],
        tags: ["Users"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 204, description: "User deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "User not found")
        ]
    )]
    public function destroy(User $user): JsonResponse
    {
        $user->delete();
        return response()->json(null, 204);
    }

    #[OA\Get(
        path: "/users/search/exist",
        summary: "Check if user exists by email",
        tags: ["Users"],
        parameters: [
            new OA\Parameter(
                name: "email",
                in: "query",
                required: true,
                schema: new OA\Schema(type: "string", format: "email")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "User existence check",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "exists", type: "boolean")
                    ]
                )
            )
        ]
    )]
	//exist
	public function exist(Request $request): JsonResponse
	{
	    $exists = User::where('email', $request->email)->exists();
	    return response()->json(['exists' => $exists]);
	}
}
