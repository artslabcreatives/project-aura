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

class TaskImportController extends Controller
{
    /**
     * Receive a document from the frontend and forward it to the n8n webhook.
     *
     * n8n callback payload schema:
     * {
     *   "project_id": 123,
     *   "import_id": "uuid-string",
     *   "secret": "N8N_IMPORT_CALLBACK_SECRET value",
     *   "tasks": [
     *     {
     *       "title": "Task title (required)",
     *       "description": "Optional description text or null",
     *       "due_date": "YYYY-MM-DD or null",
     *       "priority": "low | medium | high | null"
     *     }
     *   ]
     * }
     */
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

    /**
     * Public callback endpoint called by n8n after processing.
     * Stores results in cache (for polling fallback) and broadcasts via Echo.
     */
    public function callback(Request $request)
    {
        $secret = config('services.n8n.import_callback_secret');

        if ($secret && $request->input('secret') !== $secret) {
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

    /**
     * Polling fallback — frontend calls this every few seconds after upload.
     * Returns tasks when ready, or status=pending while still processing.
     */
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
