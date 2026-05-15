<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class QdrantService
{
    private const COLLECTION = 'tasks';

    private bool $collectionReady = false;

    public function __construct(
        private readonly string $baseUrl = '',
    ) {
    }

    /**
     * @param array<int, float|int> $embedding
     */
    public function upsertTask(Task $task, array $embedding): void
    {
        $this->ensureCollection();

        $response = Http::timeout(30)
            ->acceptJson()
            ->asJson()
            ->put($this->url('/collections/' . self::COLLECTION . '/points?wait=true'), [
                'points' => [
                    [
                        'id' => is_numeric($task->id) ? (int) $task->id : (string) $task->id,
                        'vector' => array_values($embedding),
                        'payload' => [
                            'task_id' => (string) $task->id,
                            'title' => $task->title,
                            'description' => $task->description,
                            'project_id' => $task->project_id ?? null,
                            'board_id' => $task->board_id ?? null,
                            'assignee_id' => $task->assignee_id ?? null,
                            'status' => $task->status ?? $task->user_status ?? null,
                            'priority' => $task->priority ?? null,
                            'due_date' => $task->due_date?->toDateString(),
                        ],
                    ],
                ],
            ]);

        $response->throw();
    }

    /**
     * @param array<int, float|int> $embedding
     * @return array<int, array<string, mixed>>
     */
    public function searchSimilar(array $embedding, float $threshold = 0.85, int $limit = 5): array
    {
        $this->ensureCollection();

        $response = Http::timeout(30)
            ->acceptJson()
            ->asJson()
            ->post($this->url('/collections/' . self::COLLECTION . '/points/search'), [
                'vector' => array_values($embedding),
                'limit' => $limit,
                'score_threshold' => $threshold,
                'with_payload' => true,
            ]);

        $response->throw();

        return collect($response->json('result', []))
            ->map(function (array $hit): array {
                $payload = $hit['payload'] ?? [];
                $score = (float) ($hit['score'] ?? 0.0);

                return [
                    'id' => $hit['id'] ?? null,
                    'task_id' => $payload['task_id'] ?? (string) ($hit['id'] ?? ''),
                    'score' => $score,
                    'similarity' => $score,
                    'payload' => $payload,
                ];
            })
            ->values()
            ->all();
    }

    private function ensureCollection(): void
    {
        if ($this->collectionReady) {
            return;
        }

        $response = Http::timeout(30)
            ->acceptJson()
            ->get($this->url('/collections/' . self::COLLECTION));

        if ($response->successful()) {
            $this->collectionReady = true;
            return;
        }

        if ($response->status() !== 404) {
            throw new RequestException($response);
        }

        $createResponse = Http::timeout(30)
            ->acceptJson()
            ->asJson()
            ->put($this->url('/collections/' . self::COLLECTION), [
                'vectors' => [
                    'size' => 1024,
                    'distance' => 'Cosine',
                ],
            ]);

        if (! $createResponse->successful() && $createResponse->status() !== 409) {
            throw new RequestException($createResponse);
        }

        $this->collectionReady = true;
    }

    private function url(string $path): string
    {
        $baseUrl = rtrim($this->baseUrl ?: config('services.qdrant.url', ''), '/');

        if ($baseUrl === '') {
            throw new RuntimeException('Qdrant URL is not configured.');
        }

        return $baseUrl . $path;
    }
}
