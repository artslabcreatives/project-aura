<?php

namespace App\Console\Commands;

use App\Models\SystemSetting;
use App\Services\GoogleDriveService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleDriveBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:google-drive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run database backup locally and upload to Google Drive, keeping only the latest 5 backups.';

    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        parent::__construct();
        $this->driveService = $driveService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Google Drive Backup process...');

        if (!$this->driveService->isConnected()) {
            $errorMsg = 'Google Drive is not connected. Please go to Admin Settings to connect your Google Account.';
            $this->error($errorMsg);
            SystemSetting::set('google_drive_last_backup_status', 'failed');
            SystemSetting::set('google_drive_last_backup_time', now()->toDateTimeString());
            SystemSetting::set('google_drive_last_backup_error', $errorMsg);
            return 1;
        }

        $folderId = $this->driveService->getOrCreateBackupFolder();
        if (!$folderId) {
            $errorMsg = 'Failed to find or create backup folder in Google Drive.';
            $this->error($errorMsg);
            SystemSetting::set('google_drive_last_backup_status', 'failed');
            SystemSetting::set('google_drive_last_backup_time', now()->toDateTimeString());
            SystemSetting::set('google_drive_last_backup_error', $errorMsg);
            return 1;
        }

        // Run local backup
        $this->info('Running local backup...');
        try {
            $exitCode = Artisan::call('backup:run', [
                '--only-to-disk' => 'local',
            ]);

            $output = Artisan::output();
            $this->line($output);

            if ($exitCode !== 0) {
                throw new \Exception('Spatie backup:run command failed with exit code ' . $exitCode);
            }
        } catch (\Exception $e) {
            $errorMsg = 'Local backup generation failed: ' . $e->getMessage();
            Log::error($errorMsg);
            $this->error($errorMsg);
            SystemSetting::set('google_drive_last_backup_status', 'failed');
            SystemSetting::set('google_drive_last_backup_time', now()->toDateTimeString());
            SystemSetting::set('google_drive_last_backup_error', $errorMsg);
            return 1;
        }

        // Locate the created ZIP file
        $backupName = config('backup.backup.name') ?? env('APP_NAME', 'laravel-backup');
        $searchDirs = [
            storage_path('app/' . $backupName),
            storage_path('app/' . Str::slug($backupName)),
            storage_path('app'),
        ];

        $zipFile = null;
        foreach ($searchDirs as $dir) {
            if (file_exists($dir)) {
                $files = glob($dir . '/*.zip');
                if (!empty($files)) {
                    // Sort by modified time descending (newest first)
                    usort($files, function ($a, $b) {
                        return filemtime($b) <=> filemtime($a);
                    });
                    // Pick the newest one that was modified in the last 15 minutes
                    if (time() - filemtime($files[0]) < 900) {
                        $zipFile = $files[0];
                        break;
                    }
                }
            }
        }

        if (!$zipFile) {
            $errorMsg = 'Failed to locate the newly created backup ZIP file.';
            Log::error($errorMsg);
            $this->error($errorMsg);
            SystemSetting::set('google_drive_last_backup_status', 'failed');
            SystemSetting::set('google_drive_last_backup_time', now()->toDateTimeString());
            SystemSetting::set('google_drive_last_backup_error', $errorMsg);
            return 1;
        }

        try {
            $this->info("Found backup file at: {$zipFile}");
            $this->info('Uploading backup to Google Drive...');

            $googleFileId = $this->driveService->uploadBackup($zipFile, $folderId);

            if ($googleFileId) {
                $this->info("Backup successfully uploaded. File ID: {$googleFileId}");

                // Retention Pruning: Keep only latest 5 backups
                $this->info('Running retention policy (pruning backups older than 5 days)...');
                $prunedCount = $this->driveService->pruneOldBackups($folderId, 5);
                $this->info("Retention completed. Pruned {$prunedCount} old backup(s).");

                SystemSetting::set('google_drive_last_backup_status', 'success');
                SystemSetting::set('google_drive_last_backup_time', now()->toDateTimeString());
                SystemSetting::set('google_drive_last_backup_error', null);
                return 0;
            } else {
                $errorMsg = 'Failed to upload backup to Google Drive.';
                Log::error($errorMsg);
                $this->error($errorMsg);
                SystemSetting::set('google_drive_last_backup_status', 'failed');
                SystemSetting::set('google_drive_last_backup_time', now()->toDateTimeString());
                SystemSetting::set('google_drive_last_backup_error', $errorMsg);
                return 1;
            }
        } finally {
            // Delete all local backup zip files to save storage space (guaranteed to run even on failure)
            foreach ($searchDirs as $dir) {
                if (file_exists($dir)) {
                    $files = glob($dir . '/*.zip');
                    foreach ($files as $file) {
                        @unlink($file);
                    }
                }
            }
            $this->info('Temporary local backup zip files cleaned.');
        }
    }
}
