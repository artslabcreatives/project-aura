<?php

namespace App\Services;

use App\Exceptions\AiProviderRateLimitException;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\TaskHistory;
use App\Models\Department;
use App\Models\Invoice;
use App\Models\Estimate;
use App\Models\TaskTimeLog;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AIChatbotService
{
    private Client $http;
    private string $apiKey;
    private string $model = 'claude-sonnet-4-6';
    private string $apiUrl = 'https://api.anthropic.com/v1/messages';

    public function __construct()
    {
        $this->apiKey = config('services.claude.api_key');
        $this->http = new Client([
            'timeout' => 120,
            'headers' => [
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ],
        ]);
    }

    /**
     * Build a rich context snapshot of the entire database state.
     * This is the "vector understanding" layer — structured semantic context.
     */
    public function buildContextSnapshot(): array
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Projects overview
        $projects = Project::with(['stages', 'tasks', 'client', 'department'])
            ->get();

        $projectStats = $projects->map(function ($p) use ($now) {
            $tasks = $p->tasks;
            $overdueTasks = $tasks->where('user_status', '!=', 'complete')
                ->filter(fn($t) => $t->due_date && Carbon::parse($t->due_date)->isPast());
            $completedTasks = $tasks->where('user_status', 'complete');
            $inProgressTasks = $tasks->where('user_status', 'in-progress');
            $pendingTasks = $tasks->where('user_status', 'pending');

            return [
                'id' => $p->id,
                'name' => $p->name,
                'status' => $p->status ?? 'active',
                'department' => $p->department?->name,
                'client' => $p->client?->company_name,
                'deadline' => $p->deadline,
                'days_to_deadline' => $p->deadline ? $now->diffInDays(Carbon::parse($p->deadline), false) : null,
                'is_overdue' => $p->deadline && Carbon::parse($p->deadline)->isPast(),
                'budget_allocated' => $p->budget_allocated,
                'total_cost' => $p->total_cost,
                'profit_margin' => $p->profit_margin_percentage,
                'stages_count' => $p->stages->count(),
                'tasks_total' => $tasks->count(),
                'tasks_complete' => $completedTasks->count(),
                'tasks_in_progress' => $inProgressTasks->count(),
                'tasks_pending' => $pendingTasks->count(),
                'tasks_overdue' => $overdueTasks->count(),
                'completion_pct' => $tasks->count() > 0
                    ? round(($completedTasks->count() / $tasks->count()) * 100)
                    : 0,
            ];
        })->values()->toArray();

        // Team workload
        $users = User::where('is_active', true)->get();
        $userWorkload = $users->map(function ($u) use ($now) {
            $tasks = Task::where('assignee_id', $u->id)->where('user_status', '!=', 'complete')->get();
            $overdue = $tasks->filter(fn($t) => $t->due_date && Carbon::parse($t->due_date)->isPast());
            $highPriority = $tasks->where('priority', 'high');

            return [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role,
                'department_id' => $u->department_id,
                'active_tasks' => $tasks->count(),
                'overdue_tasks' => $overdue->count(),
                'high_priority_tasks' => $highPriority->count(),
                'status' => $u->status ?? 'available',
            ];
        })->sortByDesc('active_tasks')->values()->toArray();

        // Issue patterns — cross-cutting concerns
        $allTasks = Task::with(['assignee', 'project', 'projectStage'])->get();

        $overdueTaskList = $allTasks->filter(fn($t) =>
            $t->user_status !== 'complete' && $t->due_date && Carbon::parse($t->due_date)->isPast()
        )->take(20)->map(fn($t) => [
            'id' => $t->id,
            'title' => $t->title,
            'project' => $t->project?->name,
            'assignee' => $t->assignee?->name,
            'due_date' => $t->due_date,
            'days_overdue' => Carbon::parse($t->due_date)->diffInDays($now),
            'priority' => $t->priority,
        ])->values()->toArray();

        $unassignedTasks = $allTasks->whereNull('assignee_id')
            ->where('user_status', '!=', 'complete')
            ->take(20)->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'project' => $t->project?->name,
                'priority' => $t->priority,
                'due_date' => $t->due_date,
            ])->values()->toArray();

        $blockedTasks = $allTasks->where('user_status', 'in-progress')
            ->filter(fn($t) => $t->updated_at && Carbon::parse($t->updated_at)->diffInDays($now) > 3)
            ->take(20)->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'project' => $t->project?->name,
                'assignee' => $t->assignee?->name,
                'days_stuck' => Carbon::parse($t->updated_at)->diffInDays($now),
                'priority' => $t->priority,
            ])->values()->toArray();

        // Recent task history patterns
        $recentHistory = TaskHistory::where('created_at', '>=', $thirtyDaysAgo)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->groupBy('action')
            ->map(fn($items, $action) => [
                'action' => $action,
                'count' => $items->count(),
            ])->values()->toArray();

        // Financial overview
        $financialSummary = [
            'projects_over_budget' => collect($projectStats)->filter(fn($p) =>
                $p['budget_allocated'] > 0 && $p['total_cost'] > $p['budget_allocated']
            )->count(),
            'projects_low_margin' => collect($projectStats)->filter(fn($p) =>
                $p['profit_margin'] !== null && $p['profit_margin'] < 10
            )->count(),
            'pending_invoices' => Invoice::where('status', 'pending')->count(),
            'overdue_invoices' => Invoice::where('status', 'pending')
                ->where('due_date', '<', $now)
                ->count(),
            'draft_estimates' => Estimate::where('status', 'draft')->count(),
        ];

        // Aggregate stats
        $stats = [
            'snapshot_at' => $now->toISOString(),
            'total_projects' => $projects->count(),
            'active_projects' => collect($projectStats)->where('status', 'active')->count(),
            'total_tasks' => $allTasks->count(),
            'overdue_tasks_total' => count($overdueTaskList),
            'unassigned_tasks_total' => count($unassignedTasks),
            'blocked_tasks_total' => count($blockedTasks),
            'active_users' => $users->count(),
            'overworked_users' => collect($userWorkload)->filter(fn($u) => $u['active_tasks'] > 8)->count(),
            'idle_users' => collect($userWorkload)->filter(fn($u) => $u['active_tasks'] === 0)->count(),
        ];

        return [
            'stats' => $stats,
            'projects' => $projectStats,
            'user_workload' => $userWorkload,
            'issues' => [
                'overdue_tasks' => $overdueTaskList,
                'unassigned_tasks' => $unassignedTasks,
                'blocked_tasks' => $blockedTasks,
            ],
            'history_patterns' => $recentHistory,
            'financial' => $financialSummary,
        ];
    }

    /**
     * Call Claude API with a messages array.
     */
    public function callClaude(array $messages, string $systemPrompt, int $maxTokens = 4096): string
    {
        return $this->callClaudeWithMessages($messages, $systemPrompt, $maxTokens);
    }

    /**
     * Call Claude API with message content that may contain rich content blocks.
     */
    public function callClaudeWithMessages(array $messages, string $systemPrompt, int $maxTokens = 4096): string
    {
        try {
            $response = $this->http->post($this->apiUrl, [
                'json' => [
                    'model' => $this->model,
                    'max_tokens' => $maxTokens,
                    'system' => $systemPrompt,
                    'messages' => $messages,
                ],
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            return $body['content'][0]['text'] ?? '';
        } catch (ClientException $e) {
            if ($e->getResponse()->getStatusCode() === 429) {
                $retryAfter = $e->getResponse()->getHeaderLine('retry-after');
                Log::warning('[AIChatbot] Claude API rate limit hit', [
                    'retry_after' => $retryAfter ?: null,
                ]);

                throw new AiProviderRateLimitException(
                    retryAfterSeconds: is_numeric($retryAfter) ? (int) $retryAfter : null,
                );
            }

            Log::error('[AIChatbot] Claude API client error: ' . $e->getMessage());
            throw $e;
        } catch (\Exception $e) {
            Log::error('[AIChatbot] Claude API error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Build the system prompt for scenario discovery mode.
     */
    public function buildSystemPrompt(array $context): string
    {
        $statsJson = json_encode($context['stats'], JSON_PRETTY_PRINT);

        return <<<PROMPT
You are an intelligent scenario discovery assistant for **Aura**, a project management platform used by a creative agency. Your task is to deeply analyze the provided database context and help the team define clear policies for handling common and edge-case scenarios.

## Your Mission
Go through the data systematically and identify real patterns, risks, and operational scenarios. For each scenario:
1. Show the **actual data** that reveals the issue (specific numbers, task names, project names)
2. Explain **why it matters** (business/operational impact)
3. Ask focused questions to establish **3 policy dimensions**:
   - **BOUNDARIES**: Thresholds and conditions that define when something needs attention (e.g., "overdue by more than X days", "more than Y tasks assigned")
   - **NOTIFICATIONS**: Who gets notified, when, and through which channel (Mattermost, email, in-app)
   - **REACTIONS**: What automated actions the system should take (auto-assign, escalate, block progress, send alerts)

## System Overview
```json
$statsJson
```

## Conversation Guidelines
- Present **one scenario at a time** — do not dump all scenarios at once
- Use the actual data from the context to make scenarios concrete and relevant
- After the user defines a policy, **confirm it clearly** and immediately move to the next scenario
- Keep responses focused and conversational — no walls of text
- Number scenarios so the user knows progress (e.g., "Scenario 3 of 8")
- When all scenarios are covered, provide a **policy summary** they can review

## Scenario Categories to Explore (prioritize by data evidence)
1. Task overdue escalation
2. Unassigned task accumulation
3. Team member overload / idle capacity
4. Project deadline risk
5. Blocked/stuck tasks (no progress for days)
6. Budget overrun detection
7. Low profit margin projects
8. Overdue invoices / unpaid estimates
9. Leave coverage gaps
10. Stage bottlenecks (tasks piling up in one stage)

Start by greeting the user, briefly stating what you found in the data, and then dive into the first most critical scenario.

**Always format policy confirmations like this:**
> ✅ **Policy saved**: [Scenario Name]
> - Boundary: [condition]
> - Notify: [who, when, how]
> - React: [action]

PROMPT;
    }

    /**
     * Generate the initial analysis message from Claude.
     */
    public function generateInitialAnalysis(array $context): string
    {
        $systemPrompt = $this->buildSystemPrompt($context);
        $contextJson = json_encode($context, JSON_PRETTY_PRINT);

        $messages = [
            [
                'role' => 'user',
                'content' => "Here is the complete database context for Aura. Please analyze it and begin the scenario discovery session:\n\n```json\n{$contextJson}\n```\n\nPlease start by summarizing what you found and then present the first scenario.",
            ],
        ];

        return $this->callClaude($messages, $systemPrompt, 8192);
    }

    /**
     * Continue a chat conversation.
     * $history is an array of {role, content} pairs (all prior messages).
     */
    public function continueChat(array $history, string $userMessage, array $context): string
    {
        $systemPrompt = $this->buildSystemPrompt($context);

        // Build messages array: full history + new user message
        $messages = array_map(fn($m) => [
            'role' => $m['role'],
            'content' => $m['content'],
        ], array_filter($history, fn($m) => in_array($m['role'], ['user', 'assistant'])));

        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        return $this->callClaude($messages, $systemPrompt, 4096);
    }

    /**
     * Extract structured policy from conversation context using Claude.
     */
    public function extractPolicy(array $conversationHistory, string $scenarioTitle): array
    {
        $extractPrompt = "You are a data extraction assistant. Extract the policy definition from the following conversation for the scenario titled '{$scenarioTitle}'. Return ONLY a JSON object with keys: scenario_key (snake_case), scenario_title, conditions (object), boundaries (object), notifications (object), reactions (object). No explanation.";

        $historyText = collect($conversationHistory)
            ->map(fn($m) => strtoupper($m['role']) . ': ' . $m['content'])
            ->implode("\n\n");

        $messages = [
            ['role' => 'user', 'content' => "Conversation:\n{$historyText}\n\nExtract the policy for: {$scenarioTitle}"],
        ];

        $raw = $this->callClaude($messages, $extractPrompt, 1024);

        // Parse JSON from response
        preg_match('/\{.*\}/s', $raw, $matches);
        if (!empty($matches[0])) {
            return json_decode($matches[0], true) ?? [];
        }

        return [];
    }
}
