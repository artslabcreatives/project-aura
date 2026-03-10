<?php

namespace App\Console\Commands;

use App\Models\Feedback;
use App\Models\TaskAttachment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MigrateFilesToS3 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:migrate-to-s3
                            {--type=all : Type of files to migrate (all, tasks, users, feedback)}
                            {--dry-run : Preview what will be migrated without making changes}
                            {--force : Skip confirmation prompt}
                            {--delete-local : Delete local files after successful migration}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate files from local storage to S3 and update database paths';

    private int $successCount = 0;
    private int $errorCount = 0;
    private int $skippedCount = 0;
    private array $errors = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $type = $this->option('type');
        $dryRun = $this->option('dry-run');
        $deleteLocal = $this->option('delete-local');

        // Validate S3 configuration
        if (!$this->validateS3Config()) {
            return self::FAILURE;
        }

        // Show configuration
        $this->info('Migration Configuration:');
        $this->line('  Type: ' . $type);
        $this->line('  Dry Run: ' . ($dryRun ? 'Yes' : 'No'));
        $this->line('  Delete Local Files: ' . ($deleteLocal ? 'Yes' : 'No'));
        $this->line('  S3 Bucket: ' . config('filesystems.disks.s3.bucket'));
        $this->newLine();

        if (!$dryRun && !$this->option('force')) {
            if (!$this->confirm('Do you want to proceed with the migration?')) {
                $this->info('Migration cancelled.');
                return self::SUCCESS;
            }
        }

        $this->info('Starting migration...');
        $this->newLine();

        DB::beginTransaction();

        try {
            switch ($type) {
                case 'tasks':
                    $this->migrateTaskAttachments($dryRun, $deleteLocal);
                    break;
                case 'users':
                    $this->migrateUserAvatars($dryRun, $deleteLocal);
                    break;
                case 'feedback':
                    $this->migrateFeedbackFiles($dryRun, $deleteLocal);
                    break;
                case 'all':
                default:
                    $this->migrateTaskAttachments($dryRun, $deleteLocal);
                    $this->migrateUserAvatars($dryRun, $deleteLocal);
                    $this->migrateFeedbackFiles($dryRun, $deleteLocal);
                    break;
            }

            if (!$dryRun) {
                DB::commit();
                $this->newLine();
                $this->info('Migration completed successfully!');
            } else {
                DB::rollBack();
                $this->newLine();
                $this->info('Dry run completed (no changes made).');
            }

            $this->displaySummary();

            return self::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Migration failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return self::FAILURE;
        }
    }

    private function validateS3Config(): bool
    {
        $requiredConfig = [
            'AWS_ACCESS_KEY_ID' => 'key',
            'AWS_SECRET_ACCESS_KEY' => 'secret',
            'AWS_DEFAULT_REGION' => 'region',
            'AWS_BUCKET' => 'bucket',
        ];
        $missing = [];

        foreach ($requiredConfig as $envName => $configKey) {
            if (empty(config('filesystems.disks.s3.' . $configKey))) {
                $missing[] = $envName;
            }
        }

        if (!empty($missing)) {
            $this->error('Missing S3 configuration variables:');
            foreach ($missing as $var) {
                $this->error('  - ' . $var);
            }
            $this->newLine();
            $this->error('Please configure S3 settings in your .env file.');
            return false;
        }

        // Test S3 connection
        try {
            Storage::disk('s3')->exists('test-connection-probe');
        } catch (\Exception $e) {
            $this->error('Failed to connect to S3: ' . $e->getMessage());
            return false;
        }

        return true;
    }

    private function migrateTaskAttachments(bool $dryRun, bool $deleteLocal): void
    {
        $this->info('🔄 Migrating Task Attachments...');

        $attachments = TaskAttachment::where('type', 'file')
            ->whereNotNull('url')
            ->where('url', '!=', '')
            ->where('url', '!=', '/storage/')
            ->where('url', '!=', '/storage')
            ->get();

        if ($attachments->isEmpty()) {
            $this->warn('  No task attachments found to migrate.');
            return;
        }

        $bar = $this->output->createProgressBar($attachments->count());
        $bar->start();

        foreach ($attachments as $attachment) {
            $result = $this->migrateFile(
                $attachment->url,
                'task-attachments',
                function ($newUrl) use ($attachment, $dryRun) {
                    if (!$dryRun) {
                        $attachment->update(['url' => $newUrl]);
                    }
                },
                $deleteLocal && !$dryRun
            );

            if ($result === 'success') {
                $this->successCount++;
            } elseif ($result === 'skipped') {
                $this->skippedCount++;
            } else {
                $this->errorCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function migrateUserAvatars(bool $dryRun, bool $deleteLocal): void
    {
        $this->info('🔄 Migrating User Avatars...');

        $users = User::whereNotNull('avatar')
            ->where('avatar', '!=', '')
            ->where('avatar', '!=', '/storage/')
            ->where('avatar', '!=', '/storage')
            ->get();

        if ($users->isEmpty()) {
            $this->warn('  No user avatars found to migrate.');
            return;
        }

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            $result = $this->migrateFile(
                $user->avatar,
                'avatars',
                function ($newUrl) use ($user, $dryRun) {
                    if (!$dryRun) {
                        $user->update(['avatar' => $newUrl]);
                    }
                },
                $deleteLocal && !$dryRun
            );

            if ($result === 'success') {
                $this->successCount++;
            } elseif ($result === 'skipped') {
                $this->skippedCount++;
            } else {
                $this->errorCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function migrateFeedbackFiles(bool $dryRun, bool $deleteLocal): void
    {
        $this->info('🔄 Migrating Feedback Files...');

        $feedbacks = Feedback::where(function ($query) {
            $query->where(function ($q) {
                $q->whereNotNull('screenshot_path')
                    ->where('screenshot_path', '!=', '')
                    ->where('screenshot_path', '!=', '/storage/')
                    ->where('screenshot_path', '!=', '/storage');
            })->orWhereNotNull('images');
        })->get();

        if ($feedbacks->isEmpty()) {
            $this->warn('  No feedback files found to migrate.');
            return;
        }

        $totalFiles = 0;
        foreach ($feedbacks as $feedback) {
            if (!empty($feedback->screenshot_path)) {
                $totalFiles++;
            }
            if (!empty($feedback->images) && is_array($feedback->images)) {
                $totalFiles += count($feedback->images);
            }
        }

        $bar = $this->output->createProgressBar($totalFiles);
        $bar->start();

        foreach ($feedbacks as $feedback) {
            // Migrate screenshot_path
            if (!empty($feedback->screenshot_path)) {
                $result = $this->migrateFile(
                    $feedback->screenshot_path,
                    'feedback-screenshots',
                    function ($newUrl) use ($feedback, $dryRun) {
                        if (!$dryRun) {
                            $feedback->update(['screenshot_path' => $newUrl]);
                        }
                    },
                    $deleteLocal && !$dryRun
                );

                if ($result === 'success') {
                    $this->successCount++;
                } elseif ($result === 'skipped') {
                    $this->skippedCount++;
                } else {
                    $this->errorCount++;
                }

                $bar->advance();
            }

            // Migrate images array
            if (!empty($feedback->images) && is_array($feedback->images)) {
                $newImages = [];
                foreach ($feedback->images as $imagePath) {
                    $result = $this->migrateFile(
                        $imagePath,
                        'feedback-screenshots',
                        function ($newUrl) use (&$newImages) {
                            $newImages[] = $newUrl;
                        },
                        $deleteLocal && !$dryRun
                    );

                    if ($result === 'success') {
                        $this->successCount++;
                    } elseif ($result === 'skipped') {
                        $this->skippedCount++;
                    } else {
                        $this->errorCount++;
                        $newImages[] = $imagePath; // Keep original on error
                    }

                    $bar->advance();
                }

                if (!$dryRun && !empty($newImages)) {
                    $feedback->update(['images' => $newImages]);
                }
            }
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function migrateFile(string $url, string $folder, callable $updateCallback, bool $deleteLocal): string
    {
        try {
            // Extract local path from URL
            $localPath = $this->extractLocalPath($url);

            if (empty($localPath)) {
                // Silently skip invalid URLs (data quality issue, not migration error)
                return 'skipped';
            }

            // Check if file already on S3 (URL contains S3 domain)
            if ($this->isS3Url($url)) {
                return 'skipped';
            }

            // Check if local file exists
            if (!Storage::disk('public')->exists($localPath)) {
                $this->errors[] = "Local file not found: {$localPath}";
                return 'error';
            }

            // Generate S3 path (maintain folder structure)
            $s3Path = $localPath;

            // Copy file to S3
            $fileContent = Storage::disk('public')->get($localPath);
            $mimeType = Storage::disk('public')->mimeType($localPath);

            Storage::disk('s3')->put($s3Path, $fileContent, [
                'visibility' => 'public',
                'ContentType' => $mimeType,
            ]);

            // Get S3 URL
            $s3Url = Storage::disk('s3')->url($s3Path);

            // Update database record
            $updateCallback($s3Url);

            // Delete local file if requested
            if ($deleteLocal) {
                Storage::disk('public')->delete($localPath);
            }

            return 'success';
        } catch (\Exception $e) {
            $this->errors[] = "Error migrating {$url}: " . $e->getMessage();
            return 'error';
        }
    }

    private function extractLocalPath(string $url): ?string
    {
        // Trim whitespace
        $url = trim($url);
        
        // Return null for invalid/empty URLs
        if (empty($url) || $url === '/storage/' || $url === '/storage') {
            return null;
        }

        // Remove /storage/ prefix if present
        $path = preg_replace('#^/storage/#', '', $url);

        // Handle full URLs
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            $parsed = parse_url($url);
            $path = ltrim($parsed['path'] ?? '', '/');
            $path = preg_replace('#^storage/#', '', $path);
        }

        // Validate we have an actual filename
        if (empty($path) || $path === '/' || basename($path) === '') {
            return null;
        }

        return $path;
    }

    private function isS3Url(string $url): bool
    {
        $s3Domain = config('filesystems.disks.s3.url');
        $s3Bucket = config('filesystems.disks.s3.bucket');

        return str_contains($url, 's3.amazonaws.com') ||
               str_contains($url, $s3Domain) ||
               str_contains($url, $s3Bucket);
    }

    private function displaySummary(): void
    {
        $this->newLine();
        $this->info('═══════════════════════════════════════');
        $this->info('           Migration Summary           ');
        $this->info('═══════════════════════════════════════');
        $this->line('  ✅ Successful: ' . $this->successCount);
        $this->line('  ⏭️  Skipped: ' . $this->skippedCount);
        $this->line('  ❌ Errors: ' . $this->errorCount);
        $this->info('═══════════════════════════════════════');

        if (!empty($this->errors)) {
            $this->newLine();
            $this->error('Errors encountered:');
            foreach ($this->errors as $error) {
                $this->error('  • ' . $error);
            }
        }
    }
}
