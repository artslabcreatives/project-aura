<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class FeedbackController extends Controller
{
    #[OA\Get(
        path: "/feedback",
        summary: "List all feedback",
        security: [["bearerAuth" => []]],
        tags: ["Feedback"],
        responses: [
            new OA\Response(response: 200, description: "List of feedback"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function index()
    {
        //
    }

    #[OA\Post(
        path: "/feedback",
        summary: "Submit feedback or bug report",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["description"],
                    properties: [
                        new OA\Property(property: "description", type: "string", example: "App crashes when..."),
                        new OA\Property(property: "screenshot", type: "string", format: "binary", nullable: true),
                        new OA\Property(property: "device_info", type: "string", format: "json", nullable: true),
                        new OA\Property(property: "type", type: "string", enum: ["bug_report", "feature_request", "general"], example: "bug_report")
                    ]
                )
            )
        ),
        tags: ["Feedback"],
        responses: [
            new OA\Response(response: 201, description: "Feedback submitted"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'screenshot' => 'nullable|file|image|max:10240', // Max 10MB
            'device_info' => 'nullable|json',
            'type' => 'nullable|string|in:bug_report,feature_request,general',
        ]);

        $feedbackData = [
            'user_id' => $request->user()->id,
            'description' => $validated['description'],
            'device_info' => isset($validated['device_info']) ? json_decode($validated['device_info'], true) : null,
            'type' => $validated['type'] ?? 'bug_report',
            'status' => 'pending',
        ];

        if ($request->hasFile('screenshot')) {
            $path = $request->file('screenshot')->store('feedback-screenshots', 'public');
            $feedbackData['screenshot_path'] = $path;
        }

        $feedback = \App\Models\Feedback::create($feedbackData);

        return response()->json($feedback, 201);
    }
}
