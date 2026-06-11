<?php

namespace App\Filament\Pages;

use App\Models\SystemSetting;
use App\Services\GoogleDriveService;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class BackupManagement extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cloud-arrow-up';

    protected static ?string $navigationLabel = 'Backups';

    protected static ?string $title = 'Backup Management';

    protected static string $view = 'filament.pages.backup-management';

    protected static ?int $navigationSort = 12;

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\Action::make('runBackup')
                ->label('Run Backup Now')
                ->icon('heroicon-m-arrow-path')
                ->color('primary')
                ->disabled(fn () => !$this->isConnected || $this->isBackingUp || $this->isRestoring)
                ->action(fn () => $this->triggerBackup()),
        ];
    }

    protected GoogleDriveService $driveService;

    // View properties
    public bool $isConnected = false;
    public ?string $googleEmail = '';
    public ?string $folderId = '';
    public ?string $lastBackupStatus = '';
    public ?string $lastBackupTime = '';
    public ?string $lastBackupError = '';

    public array $backups = [];
    public bool $isLoadingBackups = false;
    public bool $isBackingUp = false;
    public bool $isRestoring = false;

    public function boot(GoogleDriveService $driveService): void
    {
        $this->driveService = $driveService;
    }

    public function mount(): void
    {
        $this->refreshState();
        
        // Load backups list if connected
        if ($this->isConnected && $this->folderId) {
            $this->loadBackups();
        }

        // Show session messages if returned from OAuth
        if (session()->has('success_message')) {
            Notification::make()
                ->title('Success')
                ->body(session('success_message'))
                ->success()
                ->send();
        }
        if (session()->has('error')) {
            Notification::make()
                ->title('Error')
                ->body(session('error'))
                ->danger()
                ->send();
        }
    }

    /**
     * Refresh connection and configuration properties from settings database.
     */
    protected function refreshState(): void
    {
        $this->isConnected = $this->driveService->isConnected();
        $this->googleEmail = SystemSetting::get('google_drive_connected_email');
        $this->folderId = SystemSetting::get('google_drive_folder_id');
        $this->lastBackupStatus = SystemSetting::get('google_drive_last_backup_status');
        $this->lastBackupTime = SystemSetting::get('google_drive_last_backup_time');
        $this->lastBackupError = SystemSetting::get('google_drive_last_backup_error');
    }

    /**
     * Fetch backup files list from Google Drive.
     */
    public function loadBackups(): void
    {
        if (!$this->isConnected || !$this->folderId) {
            $this->backups = [];
            return;
        }

        $this->isLoadingBackups = true;
        
        try {
            $rawBackups = $this->driveService->listBackupFiles($this->folderId);
            $this->backups = collect($rawBackups)->map(function ($file) {
                return [
                    'id'         => $file['id'],
                    'name'       => $file['name'],
                    'size'       => $file['size'],
                    'created_at' => $file['created_at']->setTimezone('Asia/Colombo')->format('Y-m-d h:i A'),
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to load Google Drive backups: ' . $e->getMessage());
            Notification::make()
                ->title('Failed to load backups')
                ->body($e->getMessage())
                ->danger()
                ->send();
        } finally {
            $this->isLoadingBackups = false;
        }
    }

    /**
     * Save the folder ID manually.
     */
    public function saveFolderSettings(): void
    {
        SystemSetting::set('google_drive_folder_id', trim($this->folderId));
        
        Notification::make()
            ->title('Settings Saved')
            ->body('Google Drive folder configuration has been updated.')
            ->success()
            ->send();

        $this->refreshState();
        $this->loadBackups();
    }

    /**
     * Automatically search for or create the "Aura Backups" folder.
     */
    public function autoConfigureFolder(): void
    {
        $folderId = $this->driveService->getOrCreateBackupFolder();
        
        if ($folderId) {
            $this->folderId = $folderId;
            Notification::make()
                ->title('Folder Configured')
                ->body('Found or created "Aura Backups" folder successfully.')
                ->success()
                ->send();
            
            $this->refreshState();
            $this->loadBackups();
        } else {
            Notification::make()
                ->title('Configuration Failed')
                ->body('Unable to find or create folder on Google Drive.')
                ->danger()
                ->send();
        }
    }

    /**
     * Run the backup process on demand.
     */
    public function triggerBackup(): void
    {
        $this->isBackingUp = true;
        
        try {
            putenv('AURA_JOB_RUNNER=manual');
            
            $exitCode = Artisan::call('backup:google-drive');
            $output = Artisan::output();
            
            putenv('AURA_JOB_RUNNER');

            if ($exitCode === 0) {
                Notification::make()
                    ->title('Backup Completed')
                    ->body('Backup created and synced to Google Drive successfully.')
                    ->success()
                    ->send();
            } else {
                Notification::make()
                    ->title('Backup Failed')
                    ->body('Artisan backup command failed. Check logs for details.')
                    ->danger()
                    ->send();
            }
        } catch (\Exception $e) {
            Log::error('Backup trigger failed: ' . $e->getMessage());
            Notification::make()
                ->title('Backup Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        } finally {
            $this->isBackingUp = false;
            $this->refreshState();
            $this->loadBackups();
        }
    }

    /**
     * Restore a specific backup from Google Drive.
     */
    public function restoreBackup(string $fileId): void
    {
        $this->isRestoring = true;
        
        $tempZip = storage_path('app/backup-temp/restore-' . time() . '.zip');
        $extractPath = storage_path('app/backup-temp/extract-' . time());

        try {
            // 1. Download
            $success = $this->driveService->downloadBackup($fileId, $tempZip);
            if (!$success) {
                throw new \Exception('Failed to download the backup file from Google Drive.');
            }

            // 2. Extract
            $zip = new \ZipArchive();
            if ($zip->open($tempZip) !== true) {
                throw new \Exception('Failed to open downloaded ZIP file.');
            }

            if (!file_exists($extractPath)) {
                mkdir($extractPath, 0755, true);
            }

            $zip->extractTo($extractPath);
            $zip->close();

            // 3. Find SQL file
            $sqlFiles = glob($extractPath . '/db-dumps/*.sql');
            if (empty($sqlFiles)) {
                throw new \Exception('No database dump (.sql) found in the backup archive.');
            }

            $sqlFile = $sqlFiles[0];
            $sqlContent = file_get_contents($sqlFile);

            // 4. Run SQL queries to restore database
            \Illuminate\Support\Facades\DB::unprepared($sqlContent);

            // Clean up files
            @unlink($tempZip);
            \Illuminate\Support\Facades\File::deleteDirectory($extractPath);

            // Terminate admin session because sessions table is overwritten
            auth()->logout();
            session()->invalidate();
            session()->regenerateToken();

            session()->flash('success_message', 'Database restored successfully! All active sessions have been terminated. Please log in again.');
            
            // Redirect to login page
            $this->redirect('/admin/login');

        } catch (\Exception $e) {
            // Clean up
            if (file_exists($tempZip)) {
                @unlink($tempZip);
            }
            if (file_exists($extractPath)) {
                \Illuminate\Support\Facades\File::deleteDirectory($extractPath);
            }

            Log::error('Restore failed: ' . $e->getMessage());
            
            Notification::make()
                ->title('Database Restoration Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        } finally {
            $this->isRestoring = false;
        }
    }

    /**
     * Delete a backup file from Google Drive.
     */
    public function deleteBackup(string $fileId): void
    {
        try {
            $success = $this->driveService->deleteBackup($fileId);
            
            if ($success) {
                Notification::make()
                    ->title('Backup Deleted')
                    ->body('Backup file removed from Google Drive successfully.')
                    ->success()
                    ->send();
            } else {
                Notification::make()
                    ->title('Deletion Failed')
                    ->body('Failed to delete backup file from Google Drive.')
                    ->danger()
                    ->send();
            }
        } catch (\Exception $e) {
            Log::error('Delete backup failed: ' . $e->getMessage());
            Notification::make()
                ->title('Deletion Failed')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
        
        $this->loadBackups();
    }

    /**
     * Disconnect the Google Account.
     */
    public function disconnectGoogle(): void
    {
        SystemSetting::set('google_drive_access_token', null);
        SystemSetting::set('google_drive_refresh_token', null);
        SystemSetting::set('google_drive_token_expires_at', null);
        SystemSetting::set('google_drive_connected_email', null);
        SystemSetting::set('google_drive_folder_id', null);

        Notification::make()
            ->title('Disconnected')
            ->body('Google Account disconnected successfully.')
            ->success()
            ->send();

        $this->refreshState();
        $this->backups = [];
    }
}
