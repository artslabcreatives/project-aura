<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\AiProviderRateLimitException;
use App\Http\Controllers\Controller;
use App\Services\AIChatbotService;
use App\Services\AIChatbotOperationsService;
use App\Services\MattermostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

class AIChatbotController extends Controller
{
    public function __construct(
        private AIChatbotService $service,
        private AIChatbotOperationsService $operations,
    ) {}

    #[OA\Get(
        path: "/ai-chatbot/sessions",
        summary: "List AI chatbot sessions",
        description: "Returns active and completed chatbot sessions for the authenticated user",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        responses: [new OA\Response(response: 200, description: "Sessions list")]
    )]
    public function sessions(Request $request): JsonResponse
    {
        $sessions = DB::table('ai_chatbot_sessions')
            ->where('created_by', auth()->id())
            ->whereIn('status', ['active', 'completed'])
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'status', 'created_at', 'updated_at']);

        return response()->json($sessions);
    }

    #[OA\Post(
        path: "/ai-chatbot/sessions",
        summary: "Create AI chatbot session",
        description: "Creates a new scenario discovery session and triggers initial AI analysis of the database",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        responses: [
            new OA\Response(response: 201, description: "Session created with initial AI analysis"),
            new OA\Response(response: 500, description: "AI analysis error"),
        ]
    )]
    public function createSession(Request $request): JsonResponse
    {
        $userId = auth()->id();
        $mode = $request->input('mode', 'operations');
        $sessionId = null;

        try {
            if ($mode !== 'scenario') {
                $context = $this->service->buildContextSnapshot();
                $sessionId = DB::table('ai_chatbot_sessions')->insertGetId([
                    'title' => 'AI Work Agent — ' . now()->format('M j, Y g:i A'),
                    'status' => 'active',
                    'mode' => 'operations',
                    'context_snapshot' => json_encode($context),
                    'memory_summary' => null,
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $assistantMessage = "I'm ready. Drop in a PDF, image, text file, or audio/video note and tell me what to do. I can create tasks, update statuses, assign people, and record comments within your Aura scope.";

                DB::table('ai_chatbot_messages')->insert([
                    'session_id' => $sessionId,
                    'role' => 'assistant',
                    'content' => $assistantMessage,
                    'metadata' => json_encode(['mode' => 'operations']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return response()->json([
                    'id' => $sessionId,
                    'title' => 'AI Work Agent — ' . now()->format('M j, Y g:i A'),
                    'status' => 'active',
                    'mode' => 'operations',
                    'memory_summary' => null,
                    'messages' => [
                        ['role' => 'assistant', 'content' => $assistantMessage, 'created_at' => now()],
                    ],
                    'stats' => $context['stats'],
                ], 201);
            }

            // Build context snapshot from the live database
            $context = $this->service->buildContextSnapshot();

            // Persist session with context
            $sessionId = DB::table('ai_chatbot_sessions')->insertGetId([
                'title' => 'Scenario Discovery — ' . now()->format('M j, Y g:i A'),
                'status' => 'active',
                'mode' => 'scenario',
                'context_snapshot' => json_encode($context),
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Generate Claude's initial analysis (this takes a few seconds)
            $assistantMessage = $this->service->generateInitialAnalysis($context);

            // Store the bootstrap message pair
            DB::table('ai_chatbot_messages')->insert([
                [
                    'session_id' => $sessionId,
                    'role' => 'user',
                    'content' => 'Please analyze the database and begin the scenario discovery session.',
                    'metadata' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'session_id' => $sessionId,
                    'role' => 'assistant',
                    'content' => $assistantMessage,
                    'metadata' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            return response()->json([
                'id' => $sessionId,
                'title' => 'Scenario Discovery — ' . now()->format('M j, Y g:i A'),
                'status' => 'active',
                'mode' => 'scenario',
                'messages' => [
                    ['role' => 'assistant', 'content' => $assistantMessage, 'created_at' => now()],
                ],
                'stats' => $context['stats'],
            ], 201);
        } catch (AiProviderRateLimitException $e) {
            if ($sessionId) {
                DB::table('ai_chatbot_sessions')->where('id', $sessionId)->delete();
            }

            Log::warning('[AIChatbot] createSession rate limited');

            $payload = [
                'error' => $e->getMessage(),
                'code' => 'ai_rate_limited',
            ];

            if ($e->retryAfterSeconds() !== null) {
                $payload['retry_after_seconds'] = $e->retryAfterSeconds();
            }

            return response()->json($payload, 429);
        } catch (\Exception $e) {
            Log::error('[AIChatbot] createSession error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to start the AI session. Please try again.'], 500);
        }
    }

    #[OA\Get(
        path: "/ai-chatbot/sessions/{id}",
        summary: "Get chatbot session",
        description: "Returns a session with its full message history",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Session with messages"),
            new OA\Response(response: 404, description: "Not found"),
        ]
    )]
    public function getSession(int $id): JsonResponse
    {
        $session = DB::table('ai_chatbot_sessions')
            ->where('id', $id)
            ->where('created_by', auth()->id())
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $messages = DB::table('ai_chatbot_messages')
            ->where('session_id', $id)
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('created_at')
            ->get(['id', 'role', 'content', 'metadata', 'created_at']);

        $context = json_decode($session->context_snapshot ?? '{}', true);

        return response()->json([
            'id' => $session->id,
            'title' => $session->title,
            'status' => $session->status,
            'mode' => $session->mode ?? 'scenario',
            'memory_summary' => $session->memory_summary ?? null,
            'stats' => $context['stats'] ?? [],
            'messages' => $messages,
            'created_at' => $session->created_at,
        ]);
    }

    #[OA\Post(
        path: "/ai-chatbot/sessions/{id}/messages",
        summary: "Send chatbot message",
        description: "Sends a user message and returns the AI assistant's reply",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["message"],
                properties: [new OA\Property(property: "message", type: "string", maxLength: 4000)]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "AI reply"),
            new OA\Response(response: 422, description: "Session not active"),
            new OA\Response(response: 500, description: "AI API error"),
        ]
    )]
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'message' => 'nullable|string|max:12000',
            'attachments' => 'nullable|array|max:8',
            'attachments.*' => 'file|max:20480|mimes:pdf,doc,docx,txt,csv,xlsx,xls,png,jpg,jpeg,webp,mp3,wav,m4a,mp4,mov,webm,json',
        ]);

        $session = DB::table('ai_chatbot_sessions')
            ->where('id', $id)
            ->where('created_by', auth()->id())
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        if ($session->status !== 'active') {
            return response()->json(['error' => 'Session is not active'], 422);
        }

        $userMessage = trim((string) $request->input('message', ''));
        $files = $request->file('attachments', []);

        if ($userMessage === '' && empty($files)) {
            return response()->json(['message' => 'Message or attachment is required.'], 422);
        }

        $context = json_decode($session->context_snapshot ?? '{}', true);

        // Load conversation history (exclude the bootstrap user message)
        $history = DB::table('ai_chatbot_messages')
            ->where('session_id', $id)
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('id')
            ->get(['role', 'content'])
            ->skip(1) // skip the bootstrap "please analyze" message
            ->values()
            ->toArray();

        try {
            // Store user message
            $userMessageId = DB::table('ai_chatbot_messages')->insertGetId([
                'session_id' => $id,
                'role' => 'user',
                'content' => $userMessage ?: '[attachments uploaded]',
                'metadata' => json_encode([
                    'attachment_count' => count($files),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $attachments = $this->operations->storeAttachments($files, $id, auth()->id(), $userMessageId);
            $mode = $session->mode ?? 'scenario';

            if ($mode === 'scenario' && empty($attachments)) {
                // Get Claude response
                $assistantReply = $this->service->continueChat(
                    array_map(fn($m) => ['role' => $m->role, 'content' => $m->content], $history),
                    $userMessage,
                    $context
                );
                $operationResult = null;
            } else {
                $operationResult = $this->operations->processTurn(
                    auth()->user(),
                    $session,
                    $userMessage,
                    $attachments,
                    $userMessageId
                );
                $assistantReply = $operationResult['reply'];
            }

            // Store assistant reply
            DB::table('ai_chatbot_messages')->insert([
                'session_id' => $id,
                'role' => 'assistant',
                'content' => $assistantReply,
                'metadata' => json_encode([
                    'actions' => $operationResult['actions'] ?? [],
                    'memory_summary' => $operationResult['memory_summary'] ?? null,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update session timestamp
            DB::table('ai_chatbot_sessions')
                ->where('id', $id)
                ->update(['updated_at' => now()]);

            // Auto-extract and save policies if a policy confirmation marker is present
            if ($this->containsPolicySaveMarker($assistantReply)) {
                $this->savePoliciesFromReply($assistantReply, $id, auth()->id());
            }

            return response()->json([
                'role' => 'assistant',
                'content' => $assistantReply,
                'metadata' => [
                    'actions' => $operationResult['actions'] ?? [],
                    'memory_summary' => $operationResult['memory_summary'] ?? null,
                    'attachments' => collect($attachments)->map(fn($attachment) => [
                        'id' => $attachment['id'],
                        'name' => $attachment['name'],
                        'mime_type' => $attachment['mime_type'],
                        'size' => $attachment['size'],
                    ])->values(),
                ],
                'created_at' => now(),
            ]);
        } catch (AiProviderRateLimitException $e) {
            Log::warning('[AIChatbot] sendMessage rate limited');

            $payload = [
                'error' => $e->getMessage(),
                'code' => 'ai_rate_limited',
            ];

            if ($e->retryAfterSeconds() !== null) {
                $payload['retry_after_seconds'] = $e->retryAfterSeconds();
            }

            return response()->json($payload, 429);
        } catch (\Exception $e) {
            Log::error('[AIChatbot] sendMessage error: ' . $e->getMessage());
            return response()->json(['error' => 'The AI assistant could not process that request right now. Please try again.'], 500);
        }
    }

    #[OA\Post(
        path: "/ai-chatbot/sessions/{id}/complete",
        summary: "Complete chatbot session",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Session marked as completed")]
    )]
    public function completeSession(int $id): JsonResponse
    {
        DB::table('ai_chatbot_sessions')
            ->where('id', $id)
            ->where('created_by', auth()->id())
            ->update(['status' => 'completed', 'updated_at' => now()]);

        return response()->json(['status' => 'completed']);
    }

    #[OA\Get(
        path: "/ai-chatbot/policies",
        summary: "List scenario policies",
        description: "Returns all AI scenario policies ordered by last updated",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        responses: [new OA\Response(response: 200, description: "Scenario policies list")]
    )]
    public function policies(Request $request): JsonResponse
    {
        $policies = DB::table('ai_scenario_policies')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($policies);
    }

    #[OA\Put(
        path: "/ai-chatbot/policies/{id}",
        summary: "Update scenario policy",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(properties: [
                new OA\Property(property: "scenario_title", type: "string"),
                new OA\Property(property: "scenario_description", type: "string", nullable: true),
                new OA\Property(property: "conditions", type: "object"),
                new OA\Property(property: "boundaries", type: "object"),
                new OA\Property(property: "notifications", type: "object"),
                new OA\Property(property: "reactions", type: "object"),
                new OA\Property(property: "status", type: "string", enum: ["draft", "active", "archived"]),
            ])
        ),
        responses: [new OA\Response(response: 200, description: "Updated policy")]
    )]
    public function updatePolicy(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'scenario_title' => 'sometimes|string',
            'scenario_description' => 'sometimes|string|nullable',
            'conditions' => 'sometimes|array',
            'boundaries' => 'sometimes|array',
            'notifications' => 'sometimes|array',
            'reactions' => 'sometimes|array',
            'status' => 'sometimes|in:draft,active,archived',
        ]);

        // JSON-encode array fields
        foreach (['conditions', 'boundaries', 'notifications', 'reactions'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = json_encode($data[$field]);
            }
        }

        $data['updated_at'] = now();

        DB::table('ai_scenario_policies')->where('id', $id)->update($data);

        return response()->json(DB::table('ai_scenario_policies')->find($id));
    }

    #[OA\Post(
        path: "/ai-chatbot/sessions/{id}/refresh-context",
        summary: "Refresh session context",
        description: "Re-reads current database state and updates the session context snapshot",
        security: [["bearerAuth" => []]],
        tags: ["AI Chatbot"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "Updated stats"),
            new OA\Response(response: 404, description: "Session not found"),
        ]
    )]
    public function refreshContext(int $id): JsonResponse
    {
        $session = DB::table('ai_chatbot_sessions')
            ->where('id', $id)
            ->where('created_by', auth()->id())
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $context = $this->service->buildContextSnapshot();

        DB::table('ai_chatbot_sessions')
            ->where('id', $id)
            ->update([
                'context_snapshot' => json_encode($context),
                'updated_at' => now(),
            ]);

        return response()->json(['stats' => $context['stats'], 'refreshed_at' => now()]);
    }

    /**
     * Parse policy confirmations from assistant reply and save to DB.
     */
    private function savePoliciesFromReply(string $reply, int $sessionId, int $userId): void
    {
        // Extract scenario titles from ✅ Policy saved/updated markers, allowing Markdown variations.
        preg_match_all($this->policySavePattern(), $reply, $matches);

        foreach ($matches[1] as $title) {
            $title = trim($title, " \t\n\r\0\x0B*");
            $key = \Illuminate\Support\Str::slug($title, '_');

            // Parse boundary / notify / escalate / react lines that follow the marker.
            $boundaries = $this->extractSection($reply, $title, 'Boundary');
            $notifications = $this->extractSection($reply, $title, 'Notify');
            $escalation = $this->extractSection($reply, $title, 'Escalate');
            $reactions = $this->extractSection($reply, $title, 'React');

            $exists = DB::table('ai_scenario_policies')
                ->where('scenario_key', $key)
                ->exists();

            if (!$exists) {
                DB::table('ai_scenario_policies')->insert([
                    'session_id' => $sessionId,
                    'scenario_key' => $key,
                    'scenario_title' => $title,
                    'boundaries' => json_encode(['description' => $boundaries]),
                    'notifications' => json_encode([
                        'description' => $notifications,
                        'escalation' => $escalation,
                    ]),
                    'reactions' => json_encode(['description' => $reactions]),
                    'status' => 'draft',
                    'created_by' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('ai_scenario_policies')
                    ->where('scenario_key', $key)
                    ->update([
                        'scenario_title' => $title,
                        'boundaries' => json_encode(['description' => $boundaries]),
                        'notifications' => json_encode([
                            'description' => $notifications,
                            'escalation' => $escalation,
                        ]),
                        'reactions' => json_encode(['description' => $reactions]),
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    private function extractSection(string $text, string $scenarioTitle, string $field): string
    {
        $start = mb_strpos($text, $scenarioTitle);
        $searchText = $start === false ? $text : mb_substr($text, $start);
        $field = preg_quote($field, '/');

        // Look for "- Field: value" lines, allowing blockquotes and bold Markdown labels.
        if (preg_match('/^[>\s]*-\s*(?:\*\*)?' . $field . '(?:\*\*)?\s*:\s*(?:\*\*)?\s*([^\n]+)/mi', $searchText, $m)) {
            return $this->cleanPolicyText($m[1]);
        }

        return '';
    }

    private function cleanPolicyText(string $text): string
    {
        $text = preg_replace('/\*\*([^*]+)\*\*/', '$1', $text) ?? $text;
        $text = preg_replace('/`([^`]+)`/', '$1', $text) ?? $text;

        return trim($text, " \t\n\r\0\x0B*");
    }

    private function containsPolicySaveMarker(string $reply): bool
    {
        return preg_match($this->policySavePattern(), $reply) === 1;
    }

    private function policySavePattern(): string
    {
        return '/✅\s+\*{0,2}Policy (?:saved|updated)\*{0,2}\s*:\s*([^\n]+)/u';
    }

    public function mattermostWebhook(Request $request, MattermostService $mattermost): JsonResponse
    {
        $expected = config('services.ai_agent.mattermost_webhook_token');
        $provided = $request->input('token')
            ?? $request->header('X-Mattermost-Token')
            ?? $request->bearerToken();

        if ($expected && $provided !== $expected) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $mattermostUserId = $request->input('user_id');
        $text = trim((string) $request->input('text', ''));
        $channelId = $request->input('channel_id');

        if (!$mattermostUserId || $text === '') {
            return response()->json(['error' => 'user_id and text are required'], 422);
        }

        $user = \App\Models\User::where('mattermost_user_id', $mattermostUserId)->first();

        if (!$user) {
            return response()->json(['error' => 'Mattermost user is not linked to Aura.'], 404);
        }

        try {
            $result = $this->operations->processMattermostReply($user, $text, $channelId);

            if ($channelId) {
                $mattermost->createPost($channelId, $result['reply'], [
                    'aura_ai_reply' => true,
                    'actions' => $result['actions'],
                ]);
            }

            return response()->json([
                'text' => $result['reply'],
                'response_type' => 'comment',
            ]);
        } catch (AiProviderRateLimitException $e) {
            Log::warning('[AIChatbot] Mattermost webhook rate limited');

            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'ai_rate_limited',
            ], 429);
        } catch (\Throwable $e) {
            Log::error('[AIChatbot] Mattermost webhook error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process Mattermost reply.'], 500);
        }
    }
}
