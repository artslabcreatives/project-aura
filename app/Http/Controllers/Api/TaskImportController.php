<?php

namespace App\Http\Controllers\Api;

use App\Events\TaskImportReady;
use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class TaskImportController extends Controller
{
    #[OA\Post(
        path: "/projects/{project}/upload-tasks",
        summary: "Upload document for task extraction",
        description: "Submits a document to N8N for AI-powered task extraction",
        security: [["bearerAuth" => []]],
        tags: ["Tasks"],
        parameters: [new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["file"],
                    properties: [new OA\Property(property: "file", type: "string", format: "binary", description: "PDF, Word, text, spreadsheet, or image (max 20MB)")]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Import started with import_id"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function upload(Request $request, Project $project)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,txt,csv,xlsx,xls,png,jpg,jpeg|max:20480',
        ]);

        $webhookUrl = config('services.n8n.task_import_webhook_url');

        if (!$webhookUrl) {
            return response()->json(['error' => 'Task import webhook not configured. Set N8N_TASK_IMPORT_WEBHOOK_URL in .env'], 503);
        }

        $importId       = Str::uuid()->toString();
        $callbackUrl    = url('/api/task-import-callback');
        $callbackSecret = config('services.n8n.import_callback_secret');

        $file = $request->file('file');

        try {
            Http::attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName(),
                ['Content-Type' => $file->getMimeType()]
            )->post($webhookUrl, [
                'project_id'      => $project->id,
                'import_id'       => $importId,
                'callback_url'    => $callbackUrl,
                'callback_secret' => $callbackSecret,
            ]);
        } catch (\Exception $e) {
            Log::error('Task import webhook failed', ['error' => $e->getMessage(), 'project_id' => $project->id]);
            return response()->json(['error' => 'Failed to send file to processing service.'], 502);
        }

        return response()->json([
            'message'   => 'File submitted for processing. Results will arrive automatically.',
            'import_id' => $importId,
        ]);
    }

    #[OA\Post(
        path: "/task-import-callback",
        summary: "N8N task import callback",
        description: "Public endpoint called by N8N with extracted tasks. Secured via bearer secret.",
        tags: ["Tasks"],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(properties: [
                new OA\Property(property: "project_id", type: "integer"),
                new OA\Property(property: "import_id", type: "string"),
                new OA\Property(property: "tasks", type: "array", items: new OA\Items(type: "object")),
            ])
        ),
        responses: [new OA\Response(response: 200, description: "Tasks stored")]
    )]
    public function callback(Request $request)
    {
        $secret = config('services.n8n.import_callback_secret');
        $passedSecret = $request->header('X-Callback-Secret')
            ?? $request->input('secret')
            ?? str_replace('Bearer ', '', $request->header('Authorization') ?? '');

        if (empty($secret) || $passedSecret !== $secret) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $projectId = (int) $request->input('project_id');
        $importId  = $request->input('import_id', Str::uuid()->toString());
        $tasks     = $request->input('tasks', []);

        if (!$projectId) {
            return response()->json(['error' => 'project_id is required'], 422);
        }

        Log::info('TaskImport: callback received', [
            'project_id' => $projectId,
            'import_id'  => $importId,
            'task_count' => count($tasks),
            'tasks'      => $tasks,
        ]);

        $payload = [
            'project_id' => $projectId,
            'import_id'  => $importId,
            'tasks'      => $tasks,
        ];

        // Store in cache so the polling fallback can retrieve it (TTL: 15 min)
        Cache::put("task_import_{$importId}", $payload, now()->addMinutes(15));

        // Also store by project so polling succeeds even when n8n echoes a different import_id
        Cache::put("task_import_project_{$projectId}", $payload, now()->addMinutes(15));

        // Also broadcast via Echo for clients with working WebSocket
        broadcast(new TaskImportReady($projectId, $importId, $tasks));

        return response()->json(['message' => 'Import received and broadcast to project channel.']);
    }

    #[OA\Get(
        path: "/projects/{project}/task-import/{importId}",
        summary: "Poll task import status",
        description: "Polling endpoint for task import results. Returns status=pending or the extracted tasks.",
        security: [["bearerAuth" => []]],
        tags: ["Tasks"],
        parameters: [
            new OA\Parameter(name: "project", in: "path", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "importId", in: "path", required: true, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 200, description: "Import status or extracted tasks")]
    )]
    public function status(Request $request, Project $project, string $importId)
    {
        // Check by import_id first, then fall back to project-scoped key
        // (n8n may echo a different import_id than the one we generated)
        $cached = Cache::get("task_import_{$importId}")
            ?? Cache::get("task_import_project_{$project->id}");

        if (!$cached) {
            return response()->json(['status' => 'pending']);
        }

        // Consume both cache entries so results are delivered only once
        Cache::forget("task_import_{$importId}");
        Cache::forget("task_import_project_{$project->id}");

        return response()->json([
            'status' => 'ready',
            'tasks'  => $cached['tasks'],
        ]);
    }
}
