<?php

namespace App\Http\Controllers;

use App\Events\TaskUpdated;
use App\Jobs\AnalyzeChannelJob;
use App\Models\Task;
use App\Models\User;
use App\Pipelines\ChannelAnalysisPipeline;
use App\Services\EmbeddingService;
use App\Services\QdrantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AnalysisController extends Controller
{
    public function trigger(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channel_id' => 'required|string',
            'hours_back' => 'sometimes|integer|min:1|max:168',
        ]);

        $jobId = (string) Str::uuid();
        $hoursBack = (int) ($validated['hours_back'] ?? 24);
        $triggeredBy = $request->user()?->id ?? 'scheduled';

        AnalyzeChannelJob::dispatch($validated['channel_id'], $hoursBack, $triggeredBy);

        return response()->json([
            'job_id' => $jobId,
            'status' => 'queued',
        ], 202);
    }

    public function result(string $channelId): JsonResponse
    {
        $result = Cache::get(AnalyzeChannelJob::cacheKey($channelId));

        if (! $result) {
            return response()->json([
                'message' => 'Analysis result is not ready yet.',
            ], 404);
        }

        return response()->json($result);
    }

    public function confirm(
        Request $request,
        EmbeddingService $embeddings,
        QdrantService $qdrant,
        ChannelAnalysisPipeline $pipeline,
    ): JsonResponse {
        $validated = $request->validate([
            'channel_id' => 'nullable|string',
            'project_id' => 'nullable',
            'board_id' => 'nullable',
            'suggested_tasks' => 'required|array',
            'suggested_tasks.*.is_approved' => 'required|boolean',
            'suggested_tasks.*.suggested_title' => 'required|string|max:255',
            'suggested_tasks.*.suggested_assignee' => 'nullable|string',
            'suggested_tasks.*.suggested_due_date' => 'nullable|date',
            'suggested_tasks.*.source_message_ids' => 'nullable|array',
        ]);

        $createdTaskIds = [];

        foreach ($validated['suggested_tasks'] as $suggestedTask) {
            if (! (bool) ($suggestedTask['is_approved'] ?? false)) {
                continue;
            }

            $target = $this->resolveTarget($request, $suggestedTask, $pipeline);
            $payload = $this->buildTaskPayload($suggestedTask, $target);

            if (! $this->hasCreatableTarget($payload)) {
                return response()->json([
                    'message' => 'A project_id, board_id, or channel_id linked to a project/board is required to create approved tasks.',
                ], 422);
            }

            $embedding = $embeddings->embedDocument($payload['title']."\n".($payload['description'] ?? ''));
            $task = Task::create($payload);

            if ($task->assignee_id && method_exists($task, 'assignedUsers')) {
                $task->assignedUsers()->sync([$task->assignee_id]);
            }

            $qdrant->upsertTask($task, $embedding);
            $createdTaskIds[] = $task->id;

            if (isset($task->project_id)) {
                TaskUpdated::dispatch($task, 'create');
            }
        }

        return response()->json([
            'created_task_ids' => $createdTaskIds,
        ], 201);
    }

    /**
     * @param  array<string, mixed>  $suggestedTask
     * @return array<string, mixed>
     */
    private function buildTaskPayload(array $suggestedTask, array $target): array
    {
        $payload = [
            'title' => $suggestedTask['suggested_title'],
            'description' => $this->buildDescription($suggestedTask),
            'assignee_id' => $this->resolveAssigneeId($suggestedTask['suggested_assignee'] ?? null),
            'due_date' => $suggestedTask['suggested_due_date'] ?? null,
            'priority' => $suggestedTask['priority'] ?? 'medium',
        ];

        if (Schema::hasColumn('tasks', 'project_id') && ($target['project_id'] ?? null)) {
            $payload['project_id'] = $target['project_id'];
        }

        if (Schema::hasColumn('tasks', 'board_id') && ($target['board_id'] ?? null)) {
            $payload['board_id'] = $target['board_id'];
        }

        if (Schema::hasColumn('tasks', 'user_status')) {
            $payload['user_status'] = 'pending';
        }

        if (Schema::hasColumn('tasks', 'status')) {
            $payload['status'] = 'pending';
        }

        return array_filter($payload, static fn (mixed $value): bool => $value !== null);
    }

    /**
     * @param  array<string, mixed>  $suggestedTask
     */
    private function buildDescription(array $suggestedTask): ?string
    {
        $description = $suggestedTask['description'] ?? $suggestedTask['summary'] ?? null;
        $sourceMessageIds = $suggestedTask['source_message_ids'] ?? [];

        if (is_array($sourceMessageIds) && $sourceMessageIds !== []) {
            $sourceLine = 'Source Mattermost messages: '.implode(', ', array_map('strval', $sourceMessageIds));
            $description = trim((string) $description);

            return $description === '' ? $sourceLine : $description."\n\n".$sourceLine;
        }

        return $description ? (string) $description : null;
    }

    /**
     * @param  array<string, mixed>  $suggestedTask
     * @return array<string, mixed>
     */
    private function resolveTarget(Request $request, array $suggestedTask, ChannelAnalysisPipeline $pipeline): array
    {
        $target = [
            'project_id' => $suggestedTask['project_id'] ?? $request->input('project_id'),
            'board_id' => $suggestedTask['board_id'] ?? $request->input('board_id'),
        ];

        if (($target['project_id'] ?? null) || ($target['board_id'] ?? null)) {
            return $target;
        }

        $channelId = $suggestedTask['channel_id'] ?? $request->input('channel_id');

        if ($channelId) {
            return $pipeline->linkedWorkItemForChannel((string) $channelId);
        }

        return $target;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function hasCreatableTarget(array $payload): bool
    {
        return (Schema::hasColumn('tasks', 'project_id') && array_key_exists('project_id', $payload))
            || (Schema::hasColumn('tasks', 'board_id') && array_key_exists('board_id', $payload));
    }

    private function resolveAssigneeId(mixed $assignee): int|string|null
    {
        if ($assignee === null || trim((string) $assignee) === '') {
            return null;
        }

        $value = trim((string) $assignee);

        if (is_numeric($value)) {
            $user = User::query()->whereKey($value)->first();

            if ($user) {
                return $user->id;
            }
        }

        $normalized = ltrim($value, '@');
        $user = User::query()
            ->where('mattermost_user_id', $value)
            ->orWhere('mattermost_user_id', $normalized)
            ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($normalized)])
            ->orWhere('email', 'like', $normalized.'@%')
            ->first();

        return $user?->id;
    }
}
