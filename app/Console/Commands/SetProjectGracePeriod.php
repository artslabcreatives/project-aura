<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\User;
use App\Events\ProjectUpdated;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SetProjectGracePeriod extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'projects:set-grace-period
                            {--project= : ID or partial name of the project to update}
                            {--department=Digital Marketing : Target department name if no specific project is specified}
                            {--date=2026-06-15 : The grace period expiration date (YYYY-MM-DD)}
                            {--notes=Grace period authorized via script : Custom notes for the grace period}
                            {--approved-by= : User ID of the admin/hr who approved it}
                            {--force : Force the operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set the grace period expiration date, notes, and approval for one or all projects in a department.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projectSearch = $this->option('project');
        $departmentName = $this->option('department');
        $dateStr = $this->option('date');
        $notes = $this->option('notes');
        $approvedBy = $this->option('approved-by');
        $force = $this->option('force');

        // Parse date
        try {
            $expiresAt = Carbon::parse($dateStr)->startOfDay();
        } catch (\Exception $e) {
            $this->error("Invalid date format: {$dateStr}. Please use YYYY-MM-DD.");
            return 1;
        }

        // Determine the approver
        if ($approvedBy) {
            $approver = User::find($approvedBy);
            if (!$approver) {
                $this->error("User with ID {$approvedBy} not found.");
                return 1;
            }
            if (!in_array($approver->role, ['admin', 'hr'])) {
                $this->warn("User {$approver->name} (ID {$approvedBy}) does not have an admin or hr role, but using anyway as requested.");
            }
        } else {
            // Find the first admin user in the system
            $approver = User::where('role', 'admin')->first();
            if (!$approver) {
                // Try hr role
                $approver = User::where('role', 'hr')->first();
            }
            if (!$approver) {
                // Fallback to first user in system
                $approver = User::first();
            }

            if (!$approver) {
                $this->error("No users found in the system to set as grace period approver.");
                return 1;
            }

            $this->info("Automatically selected approver: {$approver->name} (ID: {$approver->id})");
        }

        // Fetch projects to update
        $query = Project::query();

        if ($projectSearch) {
            if (is_numeric($projectSearch)) {
                $query->where('id', $projectSearch);
            } else {
                $query->where('name', 'like', "%{$projectSearch}%");
            }
        } else {
            // Filter by department if no specific project was provided
            if ($departmentName) {
                $query->whereHas('department', function ($q) use ($departmentName) {
                    $q->where('name', 'like', "%{$departmentName}%");
                });
            }
        }

        $projects = $query->get();

        if ($projects->isEmpty()) {
            if ($projectSearch) {
                $this->error("No projects found matching project criteria: '{$projectSearch}'");
            } else {
                $this->error("No projects found in department matching: '{$departmentName}'");
            }
            return 1;
        }

        $this->info("Found " . $projects->count() . " project(s) to update:");
        foreach ($projects as $project) {
            $deptName = $project->department?->name ?? 'No Department';
            $this->line(" - [ID: {$project->id}] {$project->name} ({$deptName})");
        }

        if (!$force && !$this->confirm("Are you sure you want to set the grace period for these projects to {$expiresAt->toDateString()}?")) {
            $this->warn("Operation cancelled.");
            return 0;
        }

        $bar = $this->output->createProgressBar($projects->count());
        $bar->start();

        $updatedCount = 0;
        foreach ($projects as $project) {
            $project->update([
                'grace_period_expires_at'  => $expiresAt,
                'grace_period_notes'       => $notes,
                'grace_period_approved_by' => $approver->id,
            ]);

            // Dispatch update event to keep UI synchronized in real-time
            try {
                ProjectUpdated::dispatch($project, 'update');
            } catch (\Exception $e) {
                // Log and continue if broadcasting is not configured or fails
            }

            $bar->advance();
            $updatedCount++;
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully updated grace period to {$expiresAt->toDateString()} for {$updatedCount} project(s).");

        return 0;
    }
}
