<?php

namespace App\Pipelines;

use App\Models\Project;
use App\Models\User;
use App\Services\EmbeddingService;
use App\Services\MattermostService;
use App\Services\QdrantService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class ChannelAnalysisPipeline
{
    public function __construct(
        private readonly MattermostService $mattermost,
        private readonly EmbeddingService $embeddings,
        private readonly QdrantService $qdrant,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function run(string $channelId, int $hoursBack = 24): array
    {
        $since = now()->subHours($hoursBack)->getTimestampMs();
        $messages = $this->mattermost->getChannelMessages($channelId, $since);
        $threads = $this->groupMessagesByThread($messages);

        $threadSummaries = [];
        $suggestedTasks = [];

        foreach ($threads as $threadMessages) {
            $analysis = $this->analyzeThread($threadMessages);
            $sourceMessageIds = array_values(array_map(
                static fn (array $message): string => (string) ($message['id'] ?? ''),
                $threadMessages,
            ));

            if (! empty($analysis['summary'])) {
                $threadSummaries[] = (string) $analysis['summary'];
            }

            $signalStrength = $this->normalizeSignalStrength($analysis['signal_strength'] ?? 'none');
            $confidence = $this->normalizeConfidence($analysis['confidence'] ?? 0.0);
            $suggestedTitle = $this->nullableString($analysis['suggested_title'] ?? null);

            if ($signalStrength === 'none' || $confidence < 0.5 || $suggestedTitle === null) {
                continue;
            }

            $duplicate = $this->findDuplicate($suggestedTitle);

            $suggestedTasks[] = [
                'suggested_title' => $suggestedTitle,
                'suggested_assignee' => $this->resolveSuggestedAssignee($analysis['suggested_assignee'] ?? null),
                'suggested_due_date' => $this->normalizeDate($analysis['suggested_due_date'] ?? null),
                'signal_strength' => $signalStrength,
                'confidence' => $confidence,
                'is_duplicate' => $duplicate !== null,
                'duplicate_task_id' => $duplicate['task_id'] ?? null,
                'source_message_ids' => array_values(array_filter($sourceMessageIds)),
            ];
        }

        return [
            'channel_id' => $channelId,
            'period_hours' => $hoursBack,
            'summary' => $this->summarizeChannel($threadSummaries, $messages),
            'message_count' => count($messages),
            'thread_count' => count($threads),
            'suggested_tasks' => $suggestedTasks,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $messages
     * @return array<int, array<int, array<string, mixed>>>
     */
    private function groupMessagesByThread(array $messages): array
    {
        $threads = [];

        foreach ($messages as $message) {
            $key = (string) (($message['root_id'] ?? '') ?: ($message['id'] ?? ''));
            $threads[$key][] = $message;
        }

        foreach ($threads as &$threadMessages) {
            usort(
                $threadMessages,
                static fn (array $a, array $b): int => ((int) ($a['create_at'] ?? 0)) <=> ((int) ($b['create_at'] ?? 0)),
            );
        }

        return array_values($threads);
    }

    /**
     * @param  array<int, array<string, mixed>>  $messages
     * @return array<string, mixed>
     */
    private function analyzeThread(array $messages): array
    {
        $payload = $this->formatThreadMessages($messages);

        return $this->callClaudeJson(
            'You are a project management assistant analyzing team chat messages. 
Extract actionable tasks and decisions from the conversation. 
Be conservative - only flag something as a task if there is a clear 
action that needs to be taken. Return only valid JSON with no markdown.',
            "Analyze this Mattermost thread and return a JSON object with:
- summary: string (1-2 sentences)
- signal_strength: 'hard', 'soft', or 'none'
- confidence: float 0-1
- suggested_title: string or null
- suggested_assignee: mattermost username string or null
- suggested_due_date: ISO date string or null
- reasoning: string (brief explanation of your decision)

Thread messages:
{$payload}",
        );
    }

    /**
     * @param  array<int, string>  $threadSummaries
     * @param  array<int, array<string, mixed>>  $messages
     */
    private function summarizeChannel(array $threadSummaries, array $messages): string
    {
        if ($messages === []) {
            return 'No messages were found in the selected period.';
        }

        if ($threadSummaries === []) {
            return 'The selected messages did not contain enough actionable discussion to summarize.';
        }

        return $this->callClaudeText(
            'You summarize team chat activity for project managers. Return a clean paragraph only, with no markdown and no bullet points.',
            "Combine these Mattermost thread summaries into one concise channel summary paragraph:\n\n".implode("\n", $threadSummaries),
        );
    }

    /**
     * @param  array<int, array<string, mixed>>  $messages
     */
    private function formatThreadMessages(array $messages): string
    {
        return collect($messages)
            ->map(function (array $message): string {
                $author = $this->mattermost->resolveUsername((string) ($message['user_id'] ?? ''));
                $createdAt = isset($message['create_at'])
                    ? Carbon::createFromTimestampMs((int) $message['create_at'])->toIso8601String()
                    : null;
                $body = trim((string) ($message['message'] ?? ''));

                return json_encode([
                    'id' => (string) ($message['id'] ?? ''),
                    'author' => $author,
                    'created_at' => $createdAt,
                    'message' => $body,
                ], JSON_UNESCAPED_SLASHES);
            })
            ->implode("\n");
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findDuplicate(string $title): ?array
    {
        $embedding = $this->embeddings->embedQuery($title);
        $matches = $this->qdrant->searchSimilar($embedding, 0.85, 5);

        foreach ($matches as $match) {
            if ((float) ($match['similarity'] ?? 0.0) >= 0.85) {
                return $match;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function callClaudeJson(string $systemPrompt, string $userPrompt): array
    {
        $text = $this->callClaude($systemPrompt, $userPrompt);
        $decoded = json_decode($text, true);

        if (is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/\{.*\}/s', $text, $matches) === 1) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        throw new RuntimeException('Claude did not return valid JSON for thread analysis.');
    }

    private function callClaudeText(string $systemPrompt, string $userPrompt): string
    {
        return trim($this->callClaude($systemPrompt, $userPrompt));
    }

    private function callClaude(string $systemPrompt, string $userPrompt): string
    {
        $apiKey = config('services.claude.api_key');

        if (! $apiKey) {
            throw new RuntimeException('Claude API key is not configured.');
        }

        $response = Http::timeout(30)
            ->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
            ])
            ->acceptJson()
            ->asJson()
            ->post(config('services.claude.endpoint', 'https://api.anthropic.com/v1/messages'), [
                'model' => 'claude-sonnet-4-20250514',
                'max_tokens' => 1000,
                'system' => $systemPrompt,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $userPrompt,
                    ],
                ],
            ]);

        $response->throw();

        $content = $response->json('content', []);
        $text = collect($content)
            ->where('type', 'text')
            ->pluck('text')
            ->implode("\n");

        if (trim($text) === '') {
            throw new RuntimeException('Claude API returned an empty response.');
        }

        return $text;
    }

    private function resolveSuggestedAssignee(mixed $assignee): ?string
    {
        $value = $this->nullableString($assignee);

        if ($value === null) {
            return null;
        }

        $normalized = ltrim(trim($value), '@');

        $user = User::query()
            ->where('mattermost_user_id', $value)
            ->orWhere('mattermost_user_id', $normalized)
            ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($normalized)])
            ->orWhere('email', 'like', $normalized.'@%')
            ->first();

        return $user?->name ?? $value;
    }

    private function normalizeSignalStrength(mixed $value): string
    {
        $signal = strtolower((string) $value);

        return in_array($signal, ['hard', 'soft', 'none'], true) ? $signal : 'none';
    }

    private function normalizeConfidence(mixed $value): float
    {
        return max(0.0, min(1.0, (float) $value));
    }

    private function normalizeDate(mixed $value): ?string
    {
        $date = $this->nullableString($value);

        if ($date === null) {
            return null;
        }

        try {
            return Carbon::parse($date)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $string = trim((string) $value);

        return $string === '' || strtolower($string) === 'null' ? null : $string;
    }

    /**
     * @return array<string, int|string|null>
     */
    public function linkedWorkItemForChannel(string $channelId): array
    {
        if (Schema::hasTable('mattermost_channels')) {
            $row = DB::table('mattermost_channels')->where('channel_id', $channelId)->first();

            if ($row) {
                return [
                    'board_id' => $row->board_id ?? null,
                    'project_id' => $row->project_id ?? null,
                ];
            }
        }

        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'mattermost_channel_id')) {
            $project = Project::query()->where('mattermost_channel_id', $channelId)->first();

            if ($project) {
                return [
                    'board_id' => null,
                    'project_id' => $project->id,
                ];
            }
        }

        return [
            'board_id' => null,
            'project_id' => null,
        ];
    }
}
