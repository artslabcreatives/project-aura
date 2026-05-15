<?php

namespace App\Services;

use App\Events\TaskUpdated;
use App\Models\Project;
use App\Models\Stage;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AIChatbotOperationsService
{
    public function __construct(private AIChatbotService $ai) {}

    public function storeAttachments(array $files, int $sessionId, int $userId, ?int $messageId = null): array
    {
        $stored = [];

        foreach ($files as $file) {
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $stored[] = $this->storeAttachment($file, $sessionId, $userId, $messageId);
        }

        return $stored;
    }

    public function processTurn(User $user, object $session, string $message, array $attachments = [], ?int $messageId = null): array
    {
        $context = $this->buildOperationalContext($user, $session);
        $messages = $this->buildAiMessages($session, $message, $attachments, $context);
        $raw = $this->ai->callClaudeWithMessages($messages, $this->buildOperationalPrompt(), 4096);
        $plan = $this->parseAiPlan($raw);
        $actions = $plan['actions'] ?? [];
        $results = $this->executeActions($actions, $user, (int) $session->id, $messageId);
        $reply = trim((string) ($plan['reply'] ?? ''));

        if ($reply === '') {
            $reply = $this->defaultReplyFromResults($results);
        }

        if (!empty($results)) {
            $reply .= "\n\n" . $this->formatActionResults($results);
        }

        $memory = $this->updateMemorySummary($session, $message, $reply, $results, $attachments, $plan);

        DB::table('ai_chatbot_sessions')
            ->where('id', $session->id)
            ->update([
                'memory_summary' => $memory,
                'updated_at' => now(),
            ]);

        return [
            'reply' => $reply,
            'memory_summary' => $memory,
            'actions' => $results,
            'raw_plan' => $plan,
        ];
    }

    public function processMattermostReply(User $user, string $text, ?string $channelId = null): array
    {
        $session = DB::table('ai_chatbot_sessions')
            ->where('created_by', $user->id)
            ->where('mode', 'mattermost')
            ->where('status', 'active')
            ->orderByDesc('updated_at')
            ->first();

        if (!$session) {
            $sessionId = DB::table('ai_chatbot_sessions')->insertGetId([
                'title' => 'Mattermost Followups',
                'status' => 'active',
                'mode' => 'mattermost',
                'created_by' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $session = DB::table('ai_chatbot_sessions')->find($sessionId);
        }

        $messageId = DB::table('ai_chatbot_messages')->insertGetId([
            'session_id' => $session->id,
            'role' => 'user',
            'content' => $text,
            'metadata' => json_encode(['source' => 'mattermost', 'channel_id' => $channelId]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $result = $this->processTurn($user, $session, $text, [], $messageId);

        DB::table('ai_chatbot_messages')->insert([
            'session_id' => $session->id,
            'role' => 'assistant',
            'content' => $result['reply'],
            'metadata' => json_encode([
                'source' => 'mattermost',
                'actions' => $result['actions'],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('ai_chatbot_followups')
            ->where('user_id', $user->id)
            ->where('status', 'sent')
            ->update([
                'status' => 'responded',
                'last_response_at' => now(),
                'updated_at' => now(),
            ]);

        return $result;
    }

    public function buildDailyFollowupMessage(User $user, iterable $tasks): string
    {
        $lines = [
            '**Daily task follow-up**',
            'Reply here and I can update Aura for you. Useful replies: `done #123`, `blocked #123 because...`, `move #123 to in-progress`, `assign #123 to Name`, or a plain progress update.',
            '',
        ];

        foreach ($tasks as $task) {
            $due = $task->due_date ? Carbon::parse($task->due_date)->format('M j') : 'no due date';
            $project = $task->project?->name ?? 'No project';
            $recent = $this->recentTaskActivityLine($task);
            $lines[] = "- #{$task->id} {$task->title} ({$project}, {$task->user_status}, due {$due})";

            if ($recent) {
                $lines[] = "  Recent: {$recent}";
            }
        }

        return implode("\n", $lines);
    }

    private function storeAttachment(UploadedFile $file, int $sessionId, int $userId, ?int $messageId): array
    {
        $safeName = Str::uuid()->toString() . '-' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $name = $extension ? "{$safeName}.{$extension}" : $safeName;
        $path = $file->storeAs('ai-chatbot-uploads', $name, 'local');
        $mime = $file->getMimeType();
        $extractedText = $this->extractText($file, $mime);
        $aiPayload = $this->buildAttachmentAiPayload($file, $mime);

        $id = DB::table('ai_chatbot_attachments')->insertGetId([
            'session_id' => $sessionId,
            'message_id' => $messageId,
            'created_by' => $userId,
            'disk' => 'local',
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $mime,
            'size' => $file->getSize() ?: 0,
            'extracted_text' => $extractedText,
            'ai_payload' => $aiPayload ? json_encode($aiPayload) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [
            'id' => $id,
            'name' => $file->getClientOriginalName(),
            'mime_type' => $mime,
            'size' => $file->getSize() ?: 0,
            'path' => $path,
            'extracted_text' => $extractedText,
            'ai_payload' => $aiPayload,
        ];
    }

    private function extractText(UploadedFile $file, ?string $mime): ?string
    {
        $textMimes = [
            'text/plain',
            'text/csv',
            'application/json',
            'application/xml',
            'text/xml',
            'text/markdown',
        ];

        if ($mime && in_array($mime, $textMimes, true)) {
            $contents = file_get_contents($file->getRealPath()) ?: '';
            return Str::limit($contents, 120000, "\n...[truncated]");
        }

        return null;
    }

    private function buildAttachmentAiPayload(UploadedFile $file, ?string $mime): ?array
    {
        if (!$mime || $file->getSize() > 10 * 1024 * 1024) {
            return null;
        }

        if (str_starts_with($mime, 'image/')) {
            return [
                'type' => 'image',
                'source' => [
                    'type' => 'base64',
                    'media_type' => $mime,
                    'data' => base64_encode(file_get_contents($file->getRealPath()) ?: ''),
                ],
            ];
        }

        if ($mime === 'application/pdf') {
            return [
                'type' => 'document',
                'source' => [
                    'type' => 'base64',
                    'media_type' => $mime,
                    'data' => base64_encode(file_get_contents($file->getRealPath()) ?: ''),
                ],
            ];
        }

        return null;
    }

    private function buildOperationalContext(User $user, object $session): array
    {
        $projectQuery = Project::with(['stages' => fn ($query) => $query->orderBy('order'), 'client', 'department']);
        $taskQuery = Task::with(['project', 'assignee', 'projectStage', 'comments.user', 'taskHistories.user'])
            ->where('user_status', '!=', 'complete');

        if ($user->role !== 'admin') {
            if ($user->role === 'team-lead') {
                $projectQuery->where(function ($query) use ($user) {
                    $query->where('department_id', $user->department_id)
                        ->orWhere('created_by', $user->id);
                });
            } else {
                $projectIds = Task::where('assignee_id', $user->id)
                    ->orWhereHas('assignedUsers', fn ($query) => $query->where('users.id', $user->id))
                    ->pluck('project_id')
                    ->unique()
                    ->values();

                $projectQuery->whereIn('id', $projectIds);
            }
        }

        $projects = $projectQuery->limit(100)->get();
        $projectIds = $projects->pluck('id');
        $taskQuery->whereIn('project_id', $projectIds)->limit(200);

        if (!in_array($user->role, ['admin', 'team-lead'], true)) {
            $taskQuery->where(function ($query) use ($user) {
                $query->where('assignee_id', $user->id)
                    ->orWhereHas('assignedUsers', fn ($subQuery) => $subQuery->where('users.id', $user->id));
            });
        }

        $users = User::query()
            ->where('is_active', true)
            ->when($user->role !== 'admin', fn ($query) => $query->where('department_id', $user->department_id))
            ->orderBy('name')
            ->limit(100)
            ->get(['id', 'name', 'email', 'role', 'department_id']);

        return [
            'actor' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'department_id' => $user->department_id,
            ],
            'memory_summary' => $session->memory_summary,
            'projects' => $projects->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'department' => $project->department?->name,
                'deadline' => $project->deadline,
                'can_create_tasks' => $project->allowsTaskCreation(),
                'stages' => $project->stages->map(fn (Stage $stage) => [
                    'id' => $stage->id,
                    'title' => $stage->title,
                    'order' => $stage->order,
                    'main_responsible_id' => $stage->main_responsible_id,
                ])->values()->all(),
            ])->values()->all(),
            'tasks' => $taskQuery->get()->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'project_id' => $task->project_id,
                'project' => $task->project?->name,
                'stage_id' => $task->project_stage_id,
                'stage' => $task->projectStage?->title,
                'assignee_id' => $task->assignee_id,
                'assignee' => $task->assignee?->name,
                'status' => $task->user_status,
                'priority' => $task->priority,
                'due_date' => $task->due_date,
                'last_comment' => $task->comments->sortByDesc('created_at')->first()?->comment,
                'last_activity' => $task->taskHistories->first()?->details,
            ])->values()->all(),
            'users' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department_id' => $user->department_id,
            ])->values()->all(),
        ];
    }

    private function buildOperationalPrompt(): string
    {
        return <<<'PROMPT'
You are Aura's operational AI work agent. Users chat with you to inspect project data, create or update tasks, attach meaning from uploaded files, and record decisions.

You must only act within the provided context and the actor's scope. If a project, task, assignee, date, or stage is ambiguous, ask a concise clarification instead of inventing IDs.

Return ONLY valid JSON with this shape:
{
  "reply": "short natural language response",
  "memory_summary": "updated concise memory of what has happened and what remains",
  "actions": [
    {"type": "create_task", "arguments": {"project_id": 1, "title": "...", "description": "...", "assignee_id": 2, "project_stage_id": 3, "due_date": "YYYY-MM-DD HH:MM:SS", "priority": "medium", "estimated_hours": 2}},
    {"type": "update_task", "arguments": {"task_id": 10, "fields": {"title": "...", "description": "...", "due_date": "YYYY-MM-DD HH:MM:SS", "priority": "high", "project_stage_id": 4}}},
    {"type": "set_task_status", "arguments": {"task_id": 10, "status": "pending|in-progress|complete|blocked"}},
    {"type": "assign_task", "arguments": {"task_id": 10, "assignee_id": 2}},
    {"type": "add_task_comment", "arguments": {"task_id": 10, "comment": "..."}}
  ]
}

Rules:
- Create tasks when the user clearly asks to add/create/import tasks and the needed project is known.
- For "done #123" or "completed task 123", use set_task_status complete.
- For "blocked #123 because X", use set_task_status blocked and add_task_comment with the reason.
- Do not delete anything.
- Do not change budgets, invoices, users, roles, or permissions.
- Keep replies short because the backend will append exact action results.
- Mention when an uploaded audio/video/unsupported document needs transcription or a better text extract before you can create exact tasks from it.
PROMPT;
    }

    private function buildAiMessages(object $session, string $message, array $attachments, array $context): array
    {
        $content = [[
            'type' => 'text',
            'text' => "Current operational context:\n```json\n" . json_encode($context, JSON_PRETTY_PRINT) . "\n```\n\nUser message:\n{$message}",
        ]];

        foreach ($attachments as $attachment) {
            $content[] = [
                'type' => 'text',
                'text' => "Attachment #{$attachment['id']}: {$attachment['name']} ({$attachment['mime_type']}, {$attachment['size']} bytes)",
            ];

            if (!empty($attachment['extracted_text'])) {
                $content[] = [
                    'type' => 'text',
                    'text' => "Extracted text from {$attachment['name']}:\n" . $attachment['extracted_text'],
                ];
            }

            if (!empty($attachment['ai_payload'])) {
                $content[] = $attachment['ai_payload'];
            }
        }

        return [[
            'role' => 'user',
            'content' => $content,
        ]];
    }

    private function parseAiPlan(string $raw): array
    {
        $raw = trim($raw);
        $decoded = json_decode($raw, true);

        if (is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/\{.*\}/s', $raw, $matches)) {
            $decoded = json_decode($matches[0], true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [
            'reply' => $raw ?: 'I could not produce an action plan for that message.',
            'actions' => [],
            'memory_summary' => null,
        ];
    }

    private function executeActions(array $actions, User $user, int $sessionId, ?int $messageId): array
    {
        $results = [];

        foreach ($actions as $action) {
            $type = (string) ($action['type'] ?? '');
            $arguments = (array) ($action['arguments'] ?? []);
            $actionId = DB::table('ai_chatbot_actions')->insertGetId([
                'session_id' => $sessionId,
                'message_id' => $messageId,
                'created_by' => $user->id,
                'type' => $type ?: 'unknown',
                'status' => 'pending',
                'request_payload' => json_encode($arguments),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            try {
                $result = match ($type) {
                    'create_task' => $this->createTask($arguments, $user),
                    'update_task' => $this->updateTask($arguments, $user),
                    'set_task_status' => $this->setTaskStatus($arguments, $user),
                    'assign_task' => $this->assignTask($arguments, $user),
                    'add_task_comment' => $this->addTaskComment($arguments, $user),
                    default => throw new \InvalidArgumentException("Unsupported action type: {$type}"),
                };

                DB::table('ai_chatbot_actions')->where('id', $actionId)->update([
                    'status' => 'completed',
                    'result_payload' => json_encode($result),
                    'updated_at' => now(),
                ]);

                $results[] = ['type' => $type, 'status' => 'completed', 'result' => $result];
            } catch (\Throwable $e) {
                DB::table('ai_chatbot_actions')->where('id', $actionId)->update([
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                    'updated_at' => now(),
                ]);

                Log::warning('[AIChatbotOperations] action failed', [
                    'type' => $type,
                    'error' => $e->getMessage(),
                ]);

                $results[] = ['type' => $type, 'status' => 'failed', 'error' => $e->getMessage()];
            }
        }

        return $results;
    }

    private function createTask(array $arguments, User $user): array
    {
        $project = Project::findOrFail((int) ($arguments['project_id'] ?? 0));
        $this->authorizeProjectMutation($project, $user, 'create tasks in');

        if (!$project->allowsTaskCreation()) {
            throw new \RuntimeException("Project {$project->name} cannot accept new tasks right now.");
        }

        $stageId = $arguments['project_stage_id'] ?? null;
        $stage = $stageId ? Stage::where('project_id', $project->id)->find($stageId) : null;
        $stage ??= Stage::where('project_id', $project->id)->orderBy('order')->first();
        $assigneeId = $this->validAssigneeId($arguments['assignee_id'] ?? null, $user);
        $assigneeId ??= $stage?->main_responsible_id;

        $task = Task::create([
            'title' => Str::limit((string) ($arguments['title'] ?? 'Untitled task'), 255, ''),
            'description' => $arguments['description'] ?? null,
            'project_id' => $project->id,
            'assignee_id' => $assigneeId,
            'project_stage_id' => $stage?->id,
            'due_date' => $this->normalizeDate($arguments['due_date'] ?? null),
            'user_status' => 'pending',
            'priority' => in_array($arguments['priority'] ?? 'medium', ['low', 'medium', 'high'], true) ? $arguments['priority'] : 'medium',
            'estimated_hours' => is_numeric($arguments['estimated_hours'] ?? null) ? max(0, (int) $arguments['estimated_hours']) : 0,
        ]);

        if ($assigneeId) {
            $task->assignedUsers()->sync([$assigneeId]);
        }

        TaskUpdated::dispatch($task, 'create');

        return [
            'task_id' => $task->id,
            'title' => $task->title,
            'project' => $project->name,
        ];
    }

    private function updateTask(array $arguments, User $user): array
    {
        $task = Task::with('project')->findOrFail((int) ($arguments['task_id'] ?? 0));
        $this->authorizeTaskMutation($task, $user);
        $fields = (array) ($arguments['fields'] ?? []);
        $allowed = Arr::only($fields, ['title', 'description', 'due_date', 'priority', 'project_stage_id', 'estimated_hours', 'start_date']);

        if (isset($allowed['title'])) {
            $allowed['title'] = Str::limit((string) $allowed['title'], 255, '');
        }

        foreach (['due_date', 'start_date'] as $field) {
            if (array_key_exists($field, $allowed)) {
                $allowed[$field] = $this->normalizeDate($allowed[$field]);
            }
        }

        if (isset($allowed['project_stage_id'])) {
            $stageExists = Stage::where('project_id', $task->project_id)->where('id', $allowed['project_stage_id'])->exists();
            if (!$stageExists) {
                throw new \RuntimeException('Stage is not part of the task project.');
            }
        }

        if (isset($allowed['priority']) && !in_array($allowed['priority'], ['low', 'medium', 'high'], true)) {
            unset($allowed['priority']);
        }

        if (empty($allowed)) {
            throw new \RuntimeException('No supported task fields were supplied.');
        }

        $task->fill($allowed);
        $task->save();

        TaskUpdated::dispatch($task, 'update');

        return [
            'task_id' => $task->id,
            'title' => $task->title,
            'changed' => array_keys($allowed),
        ];
    }

    private function setTaskStatus(array $arguments, User $user): array
    {
        $task = Task::findOrFail((int) ($arguments['task_id'] ?? 0));
        $this->authorizeTaskMutation($task, $user);
        $status = (string) ($arguments['status'] ?? '');

        if (!in_array($status, ['pending', 'in-progress', 'complete', 'blocked'], true)) {
            throw new \RuntimeException("Unsupported status: {$status}");
        }

        $task->user_status = $status;
        $task->save();

        TaskUpdated::dispatch($task, 'update');

        return [
            'task_id' => $task->id,
            'title' => $task->title,
            'status' => $task->user_status,
        ];
    }

    private function assignTask(array $arguments, User $user): array
    {
        $task = Task::with('project')->findOrFail((int) ($arguments['task_id'] ?? 0));
        $this->authorizeProjectMutation($task->project, $user, 'assign tasks in');
        $assigneeId = $this->validAssigneeId($arguments['assignee_id'] ?? null, $user);

        if (!$assigneeId) {
            throw new \RuntimeException('Assignee is not available in your scope.');
        }

        $task->assignee_id = $assigneeId;
        $task->save();
        $task->assignedUsers()->sync([$assigneeId]);

        TaskUpdated::dispatch($task, 'update');

        return [
            'task_id' => $task->id,
            'title' => $task->title,
            'assignee_id' => $assigneeId,
        ];
    }

    private function addTaskComment(array $arguments, User $user): array
    {
        $task = Task::findOrFail((int) ($arguments['task_id'] ?? 0));
        $this->authorizeTaskMutation($task, $user, allowAssignedUsers: true);
        $comment = trim((string) ($arguments['comment'] ?? ''));

        if ($comment === '') {
            throw new \RuntimeException('Comment cannot be empty.');
        }

        $created = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'comment' => $comment,
        ]);

        return [
            'task_id' => $task->id,
            'comment_id' => $created->id,
        ];
    }

    private function authorizeProjectMutation(Project $project, User $user, string $verb): void
    {
        if ($user->role === 'admin') {
            return;
        }

        if ($user->role === 'team-lead' && (int) $project->department_id === (int) $user->department_id) {
            return;
        }

        throw new \RuntimeException("You are not allowed to {$verb} {$project->name}.");
    }

    private function authorizeTaskMutation(Task $task, User $user, bool $allowAssignedUsers = true): void
    {
        if ($user->role === 'admin') {
            return;
        }

        $task->loadMissing('project', 'assignedUsers');

        if ($user->role === 'team-lead' && (int) $task->project?->department_id === (int) $user->department_id) {
            return;
        }

        if ($allowAssignedUsers && ((int) $task->assignee_id === (int) $user->id || $task->assignedUsers->contains('id', $user->id))) {
            return;
        }

        throw new \RuntimeException("You are not allowed to update task #{$task->id}.");
    }

    private function validAssigneeId(mixed $assigneeId, User $actor): ?int
    {
        if (!$assigneeId) {
            return null;
        }

        $query = User::where('is_active', true)->where('id', (int) $assigneeId);

        if ($actor->role !== 'admin') {
            $query->where('department_id', $actor->department_id);
        }

        return $query->value('id');
    }

    private function normalizeDate(mixed $value): ?string
    {
        if (!$value) {
            return null;
        }

        try {
            return Carbon::parse($value, 'Asia/Colombo')->format('Y-m-d H:i:s');
        } catch (\Throwable) {
            return null;
        }
    }

    private function updateMemorySummary(object $session, string $userMessage, string $reply, array $results, array $attachments, array $plan): string
    {
        if (!empty($plan['memory_summary']) && is_string($plan['memory_summary'])) {
            return Str::limit($plan['memory_summary'], 3000, "\n...[truncated]");
        }

        $parts = [];

        if ($session->memory_summary) {
            $parts[] = $session->memory_summary;
        }

        $attachmentNames = collect($attachments)->pluck('name')->implode(', ');
        $completed = collect($results)->where('status', 'completed')->map(function ($result) {
            $payload = $result['result'] ?? [];
            $label = $payload['title'] ?? ('task #' . ($payload['task_id'] ?? 'unknown'));
            return "{$result['type']} {$label}";
        })->implode('; ');

        $parts[] = trim(implode(' ', array_filter([
            'Latest user request: ' . Str::limit($userMessage, 500, ''),
            $attachmentNames ? "Attachments: {$attachmentNames}." : null,
            $completed ? "Completed actions: {$completed}." : null,
            'Assistant replied: ' . Str::limit($reply, 500, ''),
        ])));

        return Str::limit(implode("\n", array_filter($parts)), 3000, "\n...[truncated]");
    }

    private function defaultReplyFromResults(array $results): string
    {
        if (empty($results)) {
            return 'I checked that and need one more detail before I can safely change anything.';
        }

        $failed = collect($results)->where('status', 'failed')->count();

        return $failed > 0
            ? 'I tried to make the requested changes, but some actions need attention.'
            : 'Done.';
    }

    private function formatActionResults(array $results): string
    {
        return collect($results)->map(function ($result) {
            if ($result['status'] !== 'completed') {
                return "- {$result['type']}: failed - {$result['error']}";
            }

            $payload = $result['result'] ?? [];
            $id = $payload['task_id'] ?? $payload['comment_id'] ?? null;
            $label = $payload['title'] ?? $payload['project'] ?? '';

            return trim("- {$result['type']}: completed" . ($id ? " (#{$id})" : '') . ($label ? " {$label}" : ''));
        })->implode("\n");
    }

    private function recentTaskActivityLine(Task $task): ?string
    {
        $task->loadMissing(['comments.user', 'taskHistories.user']);
        $comment = $task->comments->sortByDesc('created_at')->first();
        $history = $task->taskHistories->first();

        if ($comment) {
            return Str::limit(($comment->user?->name ?? 'Someone') . ': ' . $comment->comment, 140, '...');
        }

        if ($history) {
            return Str::limit($history->details, 140, '...');
        }

        return null;
    }
}
