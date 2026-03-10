<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class NotificationController extends Controller
{
    #[OA\Get(
        path: "/notifications",
        summary: "Get user notifications",
        security: [["bearerAuth" => []]],
        tags: ["Notifications"],
        responses: [
            new OA\Response(
                response: 200,
                description: "User notifications",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "notifications", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "unread_count", type: "integer")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        // Return latest 20 notifications
        $notifications = $request->user()->notifications()->limit(50)->get();
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count()
        ]);
    }

    #[OA\Patch(
        path: "/notifications/{id}/read",
        summary: "Mark notification as read",
        security: [["bearerAuth" => []]],
        tags: ["Notifications"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Notification marked as read"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Notification not found")
        ]
    )]
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        
        return response()->json(['message' => 'Notification marked as read']);
    }

    #[OA\Post(
        path: "/notifications/read-all",
        summary: "Mark all notifications as read",
        security: [["bearerAuth" => []]],
        tags: ["Notifications"],
        responses: [
            new OA\Response(response: 200, description: "All notifications marked as read"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        
        return response()->json(['message' => 'All notifications marked as read']);
    }

    #[OA\Delete(
        path: "/notifications/{id}",
        summary: "Delete a notification",
        security: [["bearerAuth" => []]],
        tags: ["Notifications"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "string")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Notification deleted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Notification not found")
        ]
    )]
    public function destroy(Request $request, $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();
        
        return response()->json(['message' => 'Notification deleted']);
    }
}
