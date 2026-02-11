<?php

namespace App\Console\Commands;

use App\Models\Feedback;
use App\Models\TaskAttachment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupInvalidFilePaths extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:cleanup-invalid-paths
                            {--dry-run : Preview what will be cleaned without making changes}
                            {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up invalid or empty file paths in the database';

    private int $cleanedCount = 0;
    private array $invalidPaths = [
        '',
        '/',
        '/storage',
        '/storage/',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $this->info('Scanning for invalid file paths...');
        $this->newLine();

        if (!$dryRun && !$this->option('force')) {
            if (!$this->confirm('Do you want to clean up invalid file paths?')) {
                $this->info('Cleanup cancelled.');
                return self::SUCCESS;
            }
        }

        DB::beginTransaction();

        try {
            $this->cleanTaskAttachments($dryRun);
            $this->cleanUserAvatars($dryRun);
            $this->cleanFeedbackFiles($dryRun);

            if (!$dryRun) {
                DB::commit();
                $this->newLine();
                $this->info('Cleanup completed successfully!');
            } else {
                DB::rollBack();
                $this->newLine();
                $this->info('Dry run completed (no changes made).');
            }

            $this->displaySummary();

            return self::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Cleanup failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    private function cleanTaskAttachments(bool $dryRun): void
    {
        $this->info('🧹 Cleaning Task Attachments...');

        $query = TaskAttachment::where(function ($q) {
            foreach ($this->invalidPaths as $path) {
                $q->orWhere('url', $path);
            }
        });

        $count = $query->count();

        if ($count === 0) {
            $this->line('  No invalid task attachments found.');
            return;
        }

        $this->warn("  Found {$count} invalid task attachment(s)");

        if (!$dryRun) {
            $deleted = $query->delete();
            $this->cleanedCount += $deleted;
            $this->line("  Deleted {$deleted} invalid task attachment(s)");
        } else {
            $this->line("  Would delete {$count} invalid task attachment(s)");
        }
    }

    private function cleanUserAvatars(bool $dryRun): void
    {
        $this->info('🧹 Cleaning User Avatars...');

        $query = User::where(function ($q) {
            foreach ($this->invalidPaths as $path) {
                $q->orWhere('avatar', $path);
            }
        });

        $count = $query->count();

        if ($count === 0) {
            $this->line('  No invalid user avatars found.');
            return;
        }

        $this->warn("  Found {$count} user(s) with invalid avatar path");

        if (!$dryRun) {
            $updated = $query->update(['avatar' => null]);
            $this->cleanedCount += $updated;
            $this->line("  Set {$updated} avatar(s) to NULL");
        } else {
            $this->line("  Would set {$count} avatar(s) to NULL");
        }
    }

    private function cleanFeedbackFiles(bool $dryRun): void
    {
        $this->info('🧹 Cleaning Feedback Files...');

        $query = Feedback::where(function ($q) {
            foreach ($this->invalidPaths as $path) {
                $q->orWhere('screenshot_path', $path);
            }
        });

        $count = $query->count();

        if ($count === 0) {
            $this->line('  No invalid feedback files found.');
            return;
        }

        $this->warn("  Found {$count} feedback(s) with invalid screenshot path");

        if (!$dryRun) {
            $updated = $query->update(['screenshot_path' => null]);
            $this->cleanedCount += $updated;
            $this->line("  Set {$updated} screenshot_path(s) to NULL");
        } else {
            $this->line("  Would set {$count} screenshot_path(s) to NULL");
        }

        // Also clean up images arrays
        $feedbacksWithImages = Feedback::whereNotNull('images')->get();
        $imagesCleanedCount = 0;

        foreach ($feedbacksWithImages as $feedback) {
            if (!is_array($feedback->images)) {
                continue;
            }

            $originalCount = count($feedback->images);
            $cleanedImages = array_filter($feedback->images, function ($path) {
                return !in_array($path, $this->invalidPaths) && !empty(trim($path));
            });

            if (count($cleanedImages) !== $originalCount) {
                $imagesCleanedCount++;
                if (!$dryRun) {
                    $feedback->update(['images' => array_values($cleanedImages)]);
                }
            }
        }

        if ($imagesCleanedCount > 0) {
            $this->warn("  Found {$imagesCleanedCount} feedback(s) with invalid image paths");
            if (!$dryRun) {
                $this->line("  Cleaned up image arrays for {$imagesCleanedCount} feedback(s)");
                $this->cleanedCount += $imagesCleanedCount;
            } else {
                $this->line("  Would clean up image arrays for {$imagesCleanedCount} feedback(s)");
            }
        }
    }

    private function displaySummary(): void
    {
        $this->newLine();
        $this->info('═══════════════════════════════════════');
        $this->info('           Cleanup Summary             ');
        $this->info('═══════════════════════════════════════');
        $this->line('  🧹 Records Cleaned: ' . $this->cleanedCount);
        $this->info('═══════════════════════════════════════');
    }
}
