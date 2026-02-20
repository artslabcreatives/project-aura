<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\MattermostService;
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
        $plaintextPassword = $validated['password'] ?? bin2hex(random_bytes(16)) . '!Aa1';
        
        $validated['password'] = Hash::make($plaintextPassword);
        
        $user = User::create($validated);
        
        // Sync password with Mattermost
        try {
            $mattermostService = app(MattermostService::class);
            $mattermostService->syncUserPassword($user, $plaintextPassword);
        } catch (\Exception $e) {
            \Log::error('Failed to sync user password with Mattermost during creation', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
        
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

        // Handle password update
        if (isset($validated['password'])) {
            $plaintextPassword = $validated['password'];
            $validated['password'] = Hash::make($plaintextPassword);
            
            // Sync password with Mattermost
            try {
                $mattermostService = app(MattermostService::class);
                $mattermostService->syncUserPassword($user, $plaintextPassword);
            } catch (\Exception $e) {
                \Log::error('Failed to sync user password with Mattermost during update', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
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
        summary: "Upload user avatar to Mattermost",
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
            new OA\Response(response: 200, description: "Avatar uploaded to Mattermost"),
            new OA\Response(response: 400, description: "Invalid file or Mattermost error"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "User not found")
        ]
    )]
	public function uploadAvatar(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB max
        ]);

        if (!$request->hasFile('avatar')) {
            return response()->json(['message' => 'No file uploaded'], 400);
        }

        try {
            $mattermostService = app(MattermostService::class);
            
            // Upload to Mattermost
            $success = $mattermostService->setUserProfileImage($user, $request->file('avatar'));
            
            if (!$success) {
                return response()->json([
                    'message' => 'Failed to upload avatar to Mattermost'
                ], 400);
            }

            // Get the Mattermost image URL
            $imageUrl = $mattermostService->getUserProfileImageUrl($user);
            
            // Update user's avatar field with Mattermost URL
            $user->update(['avatar' => $imageUrl]);
            
            return response()->json([
                'avatar_url' => $imageUrl,
                'message' => 'Avatar uploaded successfully to Mattermost'
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to upload avatar to Mattermost', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'message' => 'An error occurred while uploading avatar'
            ], 500);
        }
    }

    #[OA\Get(
        path: "/users/{user}/avatar",
        summary: "Get user's profile image from Mattermost",
        security: [["bearerAuth" => []]],
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
            new OA\Response(
                response: 200, 
                description: "User's profile image",
                content: new OA\MediaType(
                    mediaType: "image/jpeg"
                )
            ),
            new OA\Response(response: 404, description: "User not found or no image")
        ]
    )]
    public function getAvatar(User $user)
    {
        try {
            $mattermostService = app(MattermostService::class);
            
            // Get image binary data from Mattermost
            $imageData = $mattermostService->downloadUserProfileImage($user);
            
            if (!$imageData) {
                return response()->json(['message' => 'Profile image not found'], 404);
            }

            // Return the image with appropriate headers
            return response($imageData)
                ->header('Content-Type', 'image/jpeg')
                ->header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        } catch (\Exception $e) {
            \Log::error('Failed to get avatar from Mattermost', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json(['message' => 'Failed to retrieve profile image'], 500);
        }
    }

    /**
     * Check if a URL is an S3 URL
     * @deprecated - Kept for backward compatibility
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
     * @deprecated - Kept for backward compatibility
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
