<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AIChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AIChatbotController extends Controller
{
    public function __construct(private AIChatbotService $service) {}

    /**
     * List sessions for the authenticated user.
     */
    public function sessions(Request $request): JsonResponse
    {
        $sessions = DB::table('ai_chatbot_sessions')
            ->where('created_by', auth()->id())
            ->whereIn('status', ['active', 'completed'])
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'status', 'created_at', 'updated_at']);

        return response()->json($sessions);
    }

    /**
     * Create a new chat session and trigger the initial database analysis.
     */
    public function createSession(Request $request): JsonResponse
    {
        $userId = auth()->id();

        try {
            // Build context snapshot from the live database
            $context = $this->service->buildContextSnapshot();

            // Persist session with context
            $sessionId = DB::table('ai_chatbot_sessions')->insertGetId([
                'title' => 'Scenario Discovery — ' . now()->format('M j, Y g:i A'),
                'status' => 'active',
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
                'messages' => [
                    ['role' => 'assistant', 'content' => $assistantMessage, 'created_at' => now()],
                ],
                'stats' => $context['stats'],
            ], 201);
        } catch (\Exception $e) {
            Log::error('[AIChatbot] createSession error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to start session: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get a session with all its messages.
     */
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
            'stats' => $context['stats'] ?? [],
            'messages' => $messages,
            'created_at' => $session->created_at,
        ]);
    }

    /**
     * Send a message to an active session.
     */
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:4000']);

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

        $userMessage = $request->input('message');
        $context = json_decode($session->context_snapshot ?? '{}', true);

        // Load conversation history (exclude the bootstrap user message)
        $history = DB::table('ai_chatbot_messages')
            ->where('session_id', $id)
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('created_at')
            ->skip(1) // skip the bootstrap "please analyze" message
            ->get(['role', 'content'])
            ->toArray();

        try {
            // Store user message
            DB::table('ai_chatbot_messages')->insert([
                'session_id' => $id,
                'role' => 'user',
                'content' => $userMessage,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Get Claude response
            $assistantReply = $this->service->continueChat(
                array_map(fn($m) => ['role' => $m->role, 'content' => $m->content], $history),
                $userMessage,
                $context
            );

            // Store assistant reply
            DB::table('ai_chatbot_messages')->insert([
                'session_id' => $id,
                'role' => 'assistant',
                'content' => $assistantReply,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update session timestamp
            DB::table('ai_chatbot_sessions')
                ->where('id', $id)
                ->update(['updated_at' => now()]);

            // Auto-extract and save policies if a policy confirmation marker is present
            if (str_contains($assistantReply, '✅ **Policy saved**')) {
                $this->savePoliciesFromReply($assistantReply, $id, auth()->id());
            }

            return response()->json([
                'role' => 'assistant',
                'content' => $assistantReply,
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('[AIChatbot] sendMessage error: ' . $e->getMessage());
            return response()->json(['error' => 'Claude API error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mark session as completed.
     */
    public function completeSession(int $id): JsonResponse
    {
        DB::table('ai_chatbot_sessions')
            ->where('id', $id)
            ->where('created_by', auth()->id())
            ->update(['status' => 'completed', 'updated_at' => now()]);

        return response()->json(['status' => 'completed']);
    }

    /**
     * List all scenario policies.
     */
    public function policies(Request $request): JsonResponse
    {
        $policies = DB::table('ai_scenario_policies')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($policies);
    }

    /**
     * Update a scenario policy.
     */
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

    /**
     * Refresh the context snapshot for a session (re-read current DB state).
     */
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
        // Extract scenario titles from ✅ **Policy saved**: [Title] markers
        preg_match_all('/✅ \*\*Policy saved\*\*: ([^\n]+)/u', $reply, $matches);

        foreach ($matches[1] as $title) {
            $title = trim($title);
            $key = \Illuminate\Support\Str::slug($title, '_');

            // Parse boundary / notify / react lines that follow the marker
            $boundaries = $this->extractSection($reply, $title, 'Boundary');
            $notifications = $this->extractSection($reply, $title, 'Notify');
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
                    'notifications' => json_encode(['description' => $notifications]),
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
                        'boundaries' => json_encode(['description' => $boundaries]),
                        'notifications' => json_encode(['description' => $notifications]),
                        'reactions' => json_encode(['description' => $reactions]),
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    private function extractSection(string $text, string $scenarioTitle, string $field): string
    {
        // Look for "- Field: value" lines in the block after the policy marker
        $escaped = preg_quote($scenarioTitle, '/');
        if (preg_match('/Policy saved\*\*: ' . $escaped . '.*?- ' . $field . ': ([^\n]+)/s', $text, $m)) {
            return trim($m[1]);
        }
        return '';
    }
}
