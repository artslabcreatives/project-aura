<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Models\User;
use App\Services\AIChatbotOperationsService;
use App\Services\MattermostService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AIDailyMattermostFollowups extends Command
{
    protected $signature = 'ai-chatbot:daily-mattermost-followups {--dry-run : Show messages without sending them}';

    protected $description = 'Send daily AI task follow-ups through Mattermost and record pending followups.';

    public function handle(AIChatbotOperationsService $operations, MattermostService $mattermost): int
    {
        $now = Carbon::now('Asia/Colombo');
        $this->info('AI daily Mattermost followups: ' . $now->format('Y-m-d H:i:s'));

        $tasks = Task::with(['project', 'assignee', 'assignedUsers', 'comments.user', 'taskHistories.user'])
            ->where('user_status', '!=', 'complete')
            ->where(function ($query) use ($now) {
                $query->whereDate('due_date', '<=', $now->copy()->addDay()->toDateString())
                    ->orWhere('user_status', 'in-progress')
                    ->orWhere('updated_at', '<=', $now->copy()->subDays(2));
            })
            ->orderByRaw('due_date is null')
            ->orderBy('due_date')
            ->limit(500)
            ->get();

        $byUser = collect();

        foreach ($tasks as $task) {
            $assignees = $task->assignedUsers->isNotEmpty()
                ? $task->assignedUsers
                : collect([$task->assignee])->filter();

            foreach ($assignees as $assignee) {
                if (!$assignee instanceof User || !$assignee->mattermost_user_id) {
                    continue;
                }

                $byUser->put($assignee->id, ($byUser->get($assignee->id) ?? collect())->push($task));
            }
        }

        $sent = 0;

        foreach ($byUser as $userId => $userTasks) {
            $user = User::find($userId);

            if (!$user) {
                continue;
            }

            $chunks = $userTasks->chunk(20);

            foreach ($chunks as $chunkIndex => $taskChunk) {
                $message = $operations->buildDailyFollowupMessage($user, $taskChunk);

                if ($chunks->count() > 1) {
                    $message .= "\n\nBatch " . ($chunkIndex + 1) . " of " . $chunks->count() . ".";
                }

                if ($this->option('dry-run')) {
                    $this->line("--- {$user->name} batch " . ($chunkIndex + 1) . '/' . $chunks->count() . " ---");
                    $this->line($message);
                    continue;
                }

                $post = $mattermost->sendDirectMessage($user, $message, [
                    'aura_ai_followup' => true,
                    'task_ids' => $taskChunk->pluck('id')->values()->all(),
                    'batch' => $chunkIndex + 1,
                    'batch_count' => $chunks->count(),
                ]);

                if (!$post) {
                    $this->warn("Failed to send Mattermost followup to {$user->name}");
                    continue;
                }

                foreach ($taskChunk as $task) {
                    DB::table('ai_chatbot_followups')->insert([
                        'task_id' => $task->id,
                        'user_id' => $user->id,
                        'mattermost_channel_id' => $post['channel_id'] ?? null,
                        'mattermost_post_id' => $post['id'] ?? null,
                        'status' => 'sent',
                        'summary' => "Daily followup for #{$task->id} {$task->title}",
                        'last_prompted_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $sent++;
            }
        }

        $this->info("Sent {$sent} Mattermost followup message(s).");

        return Command::SUCCESS;
    }
}
