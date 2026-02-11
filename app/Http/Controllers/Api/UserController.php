<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
            'preferences' => 'sometimes|nullable|array',
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

    #[OA\Post(
        path: "/users/{user}/avatar",
        summary: "Upload user avatar",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: "avatar", type: "string", format: "binary")
                    ]
                )
            )
        ),
        tags: ["Users"],
        parameters: [
            new OA\Parameter(
                name: "user",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Avatar uploaded"),
            new OA\Response(response: 400, description: "Invalid file"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "User not found")
        ]
    )]
	public function uploadAvatar(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB max
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                // Handle both S3 and local paths
                if ($this->isS3Url($user->avatar)) {
                    // Extract S3 path from URL
                    $s3Path = $this->extractS3Path($user->avatar);
                    if ($s3Path && Storage::disk('s3')->exists($s3Path)) {
                        Storage::disk('s3')->delete($s3Path);
                    }
                } else {
                    $oldPath = str_replace('/storage/', '', $user->avatar);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
            }

            $path = $request->file('avatar')->store('avatars', 's3');
            $url = Storage::disk('s3')->url($path);
            
            $user->update(['avatar' => $url]);
            
            return response()->json(['avatar_url' => $url]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Check if a URL is an S3 URL
     */
    private function isS3Url(string $url): bool
    {
        $s3Domain = config('filesystems.disks.s3.url');
        $s3Bucket = config('filesystems.disks.s3.bucket');

        return str_contains($url, 's3.amazonaws.com') ||
               str_contains($url, '.digitaloceanspaces.com') ||
               ($s3Domain && str_contains($url, $s3Domain)) ||
               ($s3Bucket && str_contains($url, $s3Bucket));
    }

    /**
     * Extract S3 path from URL
     */
    private function extractS3Path(string $url): ?string
    {
        $parsed = parse_url($url);
        $path = $parsed['path'] ?? '';
        
        // Remove leading slash
        $path = ltrim($path, '/');
        
        // If the bucket name is in the path, remove it
        $bucket = config('filesystems.disks.s3.bucket');
        if ($bucket && str_starts_with($path, $bucket . '/')) {
            $path = substr($path, strlen($bucket) + 1);
        }
        
        return $path ?: null;
    }
}
