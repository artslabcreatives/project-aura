<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\User;
use App\Services\MattermostService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendWeeklyPoReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'projects:send-weekly-po-reminders {--dry-run : Show messages without actually sending them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send weekly Mattermost notifications for projects with skipped PO requirements.';

    /**
     * Execute the console command.
     */
    public function handle(MattermostService $mattermost): int
    {
        $now = Carbon::now('Asia/Colombo');
        $this->info('Starting weekly PO reminder checks: ' . $now->toDateTimeString());

        // Find active, non-internal projects where skip_po is enabled and no PO is attached
        $projects = Project::where('skip_po', true)
            ->where('is_archived', false)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->where('is_internal_project', false)
            ->whereNull('po_number')
            ->whereNull('po_document')
            ->whereDoesntHave('purchaseOrders')
            ->get();

        if ($projects->isEmpty()) {
            $this->info('No projects found with skipped PO requirements lacking a Purchase Order. Skipping reminders.');
            return Command::SUCCESS;
        }

        $this->info('Found ' . $projects->count() . ' projects requiring PO attention.');

        // Format direct message
        $message = "### ⚠️ Weekly Purchase Order (PO) Reminder\n";
        $message .= "The following active project(s) are currently running under a **Skipped PO Requirement** exception but still lack a valid Purchase Order. Please review them and attach their PO documents as soon as possible:\n\n";

        foreach ($projects as $project) {
            $projectUrl = config('app.url') . "/projects/" . $project->id;
            $message .= "- **[{$project->name}]({$projectUrl})** (ID: `{$project->id}`)\n";
        }

        $message .= "\n*This is an automated system reminder sent weekly to all Admin and HR users.*";

        // Query active admin and HR users who have mattermost_user_id configured
        $users = User::whereIn('role', ['admin', 'hr'])
            ->where('is_active', true)
            ->whereNotNull('mattermost_user_id')
            ->get();

        if ($users->isEmpty()) {
            $this->warn('No active Admin/HR users found with Mattermost accounts.');
            return Command::SUCCESS;
        }

        $sentCount = 0;
        foreach ($users as $user) {
            if ($this->option('dry-run')) {
                $this->line("--- [DRY-RUN] Would send to: {$user->name} ({$user->email}) ---");
                $this->line($message);
                continue;
            }

            $this->info("Sending direct message reminder to {$user->name}...");
            $post = $mattermost->sendDirectMessage($user, $message);

            if ($post) {
                $sentCount++;
            } else {
                $this->error("Failed to send reminder to {$user->name}");
            }
        }

        $this->info("Weekly PO reminders complete. Sent {$sentCount} messages.");

        return Command::SUCCESS;
    }
}
