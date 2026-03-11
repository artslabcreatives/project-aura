<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        return response()->json(\App\Models\Feedback::with('user')->latest()->get());
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
                        new OA\Property(property: "screenshot", type: "string", format: "binary", nullable: true, description: "Legacy single screenshot"),
                        new OA\Property(property: "images[]", type: "array", items: new OA\Items(type: "string", format: "binary"), nullable: true, description: "Multiple images"),
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
        \Illuminate\Support\Facades\Log::info('Feedback submission request:', $request->all());
        
        $validated = $request->validate([
            'description' => 'required|string',
            'screenshot' => 'nullable|file|max:10240', // Max 10MB
            'images' => 'nullable|array',
            'images.*' => 'nullable|file|max:10240',
            'device_info' => 'nullable|json',
            'type' => 'nullable|string|in:bug_report,feature_request,general',
        ]);

        $feedbackData = [
            'user_id' => $request->user()->id,
            'description' => $validated['description'],
            'device_info' => isset($validated['device_info']) ? json_decode($validated['device_info'], true) : null,
            'type' => $validated['type'] ?? 'bug_report',
            'status' => 'pending',
            'images' => [],
        ];

        if ($request->hasFile('screenshot')) {
            $path = $request->file('screenshot')->store('feedback-screenshots', 's3');
            $feedbackData['screenshot_path'] = Storage::disk('s3')->url($path);
            $feedbackData['images'][] = Storage::disk('s3')->url($path);
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('feedback-screenshots', 's3');
                $feedbackData['images'][] = Storage::disk('s3')->url($path);
            }
        }

        $feedback = \App\Models\Feedback::create($feedbackData);

        $this->sendToWebhook($feedback);

        return response()->json($feedback, 201);
    }

    protected function sendToWebhook(\App\Models\Feedback $feedback)
    {
        try {
            $webhookUrl = env('BUG_REPORT_WEBHOOK_URL');
            $webhookSecret = env('BUG_REPORT_WEBHOOK_SECRET');

            if (!$webhookUrl) {
                return;
            }

            $user = $feedback->user;
            
            $payload = [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'description' => $feedback->description,
                'type' => $feedback->type,
                'url' => request()->header('referer'),
                'device_info' => $feedback->device_info,
                'created_at' => $feedback->created_at->toDateTimeString(),
            ];

            // proper header authentication name is system-admin and the value is ...
            \Illuminate\Support\Facades\Http::withHeaders([
                'system-admin' => $webhookSecret,
            ])->post($webhookUrl, $payload);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send bug report webhook', [
                'error' => $e->getMessage(),
                'feedback_id' => $feedback->id
            ]);
        }
    }
}
