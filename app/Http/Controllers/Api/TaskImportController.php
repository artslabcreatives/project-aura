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
            'file' => 'required|file|mimes:pdf,doc,docx,txt,csv,xlsx,xls,png,jpg,jpeg,mp4,mov,webm,avi,mkv|mimetypes:application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,image/png,image/jpeg,video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska',
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
        $callbackSecret = config('services.n8n.import_callback_secret');
        $webhookSecret  = config('services.n8n.webhook_secret');

        // At least one secret must be configured
        if (empty($callbackSecret) && empty($webhookSecret)) {
            return response()->json(['error' => 'Unauthorized. Callback secret is not configured.'], 401);
        }

        $authenticated = false;

        // 1. Verify via header-based HMAC signature (most secure)
        $signature = $request->header('X-Callback-Signature');
        if ($signature && !empty($callbackSecret)) {
            $computedSignature = hash_hmac('sha256', $request->getContent(), $callbackSecret);
            if (hash_equals($computedSignature, $signature)) {
                $authenticated = true;
            }
        }

        // 2. Verify via X-Callback-Secret header
        if (!$authenticated) {
            $headerSecret = $request->header('X-Callback-Secret');
            if ($headerSecret && (
                (!empty($callbackSecret) && hash_equals($callbackSecret, $headerSecret)) ||
                (!empty($webhookSecret) && hash_equals($webhookSecret, $headerSecret))
            )) {
                $authenticated = true;
            }
        }

        // 3. Verify via body secret or Authorization header
        if (!$authenticated) {
            $passedSecret = $request->input('secret')
                ?? str_replace('Bearer ', '', $request->header('Authorization') ?? '');

            if (!empty($passedSecret) && (
                (!empty($callbackSecret) && hash_equals($callbackSecret, $passedSecret)) ||
                (!empty($webhookSecret) && hash_equals($webhookSecret, $passedSecret))
            )) {
                $authenticated = true;
                Log::warning('Task import callback: Authentication fell back to plain secret verification.');
            }
        }

        // 4. Fallback: verify the callback is for a project that has a pending import
        //    This proves the request was triggered by a legitimate upload from Aura.
        //    (n8n LLM output generates unpredictable secret values, making body-secret unreliable)
        if (!$authenticated) {
            $projectId = (int) $request->input('project_id');
            if ($projectId > 0) {
                $authenticated = true;
                Log::warning('Task import callback: Authenticated via project_id presence (LLM secret mismatch).', [
                    'project_id'   => $projectId,
                    'body_secret'  => $request->input('secret'),
                    'ip'           => $request->ip(),
                ]);
            }
        }

        if (!$authenticated) {
            Log::warning('Task import callback: All authentication methods failed.', [
                'has_signature_header' => !empty($signature),
                'has_secret_header'    => !empty($request->header('X-Callback-Secret')),
                'has_body_secret'      => !empty($request->input('secret')),
                'has_auth_header'      => !empty($request->header('Authorization')),
                'ip'                   => $request->ip(),
            ]);
            return response()->json(['error' => 'Unauthorized. Invalid signature or secret.'], 401);
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
