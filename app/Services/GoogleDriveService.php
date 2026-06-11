<?php

namespace App\Services;

use App\Models\SystemSetting;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    protected string $clientId;
    protected string $clientSecret;
    protected Client $guzzleClient;

    public function __construct()
    {
        $this->clientId = config('services.google.client_id') ?? '';
        $this->clientSecret = config('services.google.client_secret') ?? '';
        $this->guzzleClient = new Client();
    }

    /**
     * Get the Google Drive access token, refreshing it if expired.
     */
    public function getAccessToken(): ?string
    {
        $refreshToken = SystemSetting::get('google_drive_refresh_token');
        if (!$refreshToken) {
            Log::warning('Google Drive access token requested but no refresh token is stored.');
            return null;
        }

        $accessToken = SystemSetting::get('google_drive_access_token');
        $expiresAtVal = SystemSetting::get('google_drive_token_expires_at');
        
        $expiresAt = $expiresAtVal ? Carbon::parse($expiresAtVal) : null;

        // If no access token or it expires in less than 5 minutes, refresh it
        if (!$accessToken || !$expiresAt || $expiresAt->subMinutes(5)->isPast()) {
            return $this->refreshAccessToken($refreshToken);
        }

        return $accessToken;
    }

    /**
     * Refresh the access token using the refresh token.
     */
    protected function refreshAccessToken(string $refreshToken): ?string
    {
        try {
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id'     => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $refreshToken,
                'grant_type'     => 'refresh_token',
            ]);

            if ($response->failed()) {
                Log::error('Failed to refresh Google Drive access token: ' . $response->body());
                return null;
            }

            $data = $response->json();
            $newAccessToken = $data['access_token'] ?? null;
            $expiresIn = $data['expires_in'] ?? 3600;

            if ($newAccessToken) {
                SystemSetting::set('google_drive_access_token', $newAccessToken);
                SystemSetting::set('google_drive_token_expires_at', Carbon::now()->addSeconds($expiresIn)->toDateTimeString());
                
                // If Google unexpectedly sends a new refresh token, save it too
                if (isset($data['refresh_token'])) {
                    SystemSetting::set('google_drive_refresh_token', $data['refresh_token']);
                }

                return $newAccessToken;
            }
        } catch (\Exception $e) {
            Log::error('Exception refreshing Google Drive access token: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Check if Google Drive is currently authorized.
     */
    public function isConnected(): bool
    {
        return !empty(SystemSetting::get('google_drive_refresh_token'));
    }

    /**
     * Get the folder ID for Aura backups. Creates the folder if not exists.
     */
    public function getOrCreateBackupFolder(): ?string
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return null;
        }

        $folderId = SystemSetting::get('google_drive_folder_id');

        // Verify folder exists if we have an ID stored
        if ($folderId) {
            $response = Http::withToken($accessToken)
                ->get("https://www.googleapis.com/drive/v3/files/{$folderId}", [
                    'fields' => 'id, name, mimeType, trashed',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                if (($data['mimeType'] ?? '') === 'application/vnd.google-apps.folder' && !($data['trashed'] ?? false)) {
                    return $folderId;
                }
            }
        }

        // Search for an existing "Aura Backups" folder
        $query = "mimeType = 'application/vnd.google-apps.folder' and name = 'Aura Backups' and trashed = false";
        $response = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/drive/v3/files', [
                'q'      => $query,
                'fields' => 'files(id, name)',
                'spaces' => 'drive',
            ]);

        if ($response->successful()) {
            $files = $response->json('files');
            if (!empty($files)) {
                $foundId = $files[0]['id'];
                SystemSetting::set('google_drive_folder_id', $foundId);
                return $foundId;
            }
        }

        // Create a new "Aura Backups" folder
        $response = Http::withToken($accessToken)
            ->post('https://www.googleapis.com/drive/v3/files', [
                'name'     => 'Aura Backups',
                'mimeType' => 'application/vnd.google-apps.folder',
            ]);

        if ($response->successful()) {
            $newFolderId = $response->json('id');
            SystemSetting::set('google_drive_folder_id', $newFolderId);
            return $newFolderId;
        }

        Log::error('Failed to find or create Google Drive folder: ' . $response->body());
        return null;
    }

    /**
     * List all zip backups in the given Google Drive folder.
     */
    public function listBackupFiles(string $folderId): array
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return [];
        }

        try {
            $query = "'{$folderId}' in parents and name contains '.zip' and trashed = false";
            $response = Http::withToken($accessToken)
                ->get('https://www.googleapis.com/drive/v3/files', [
                    'q'        => $query,
                    'fields'   => 'files(id, name, size, createdTime)',
                    'orderBy'  => 'createdTime desc',
                    'pageSize' => 100,
                ]);

            if ($response->successful()) {
                return collect($response->json('files') ?? [])->map(function ($file) {
                    return [
                        'id'         => $file['id'],
                        'name'       => $file['name'],
                        'size'       => (int) ($file['size'] ?? 0),
                        'created_at' => Carbon::parse($file['createdTime']),
                    ];
                })->toArray();
            }

            Log::error('Failed to list backup files from Google Drive: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Exception listing Google Drive files: ' . $e->getMessage());
        }

        return [];
    }

    /**
     * Upload a zip backup to Google Drive.
     */
    public function uploadBackup(string $filePath, string $folderId): ?string
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return null;
        }

        if (!file_exists($filePath)) {
            Log::error("Backup file does not exist at local path: {$filePath}");
            return null;
        }

        try {
            $filename = basename($filePath);
            
            // Memory-efficient multipart upload via Guzzle
            $response = $this->guzzleClient->request('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'multipart' => [
                    [
                        'name'     => 'metadata',
                        'contents' => json_encode([
                            'name'    => $filename,
                            'parents' => [$folderId],
                        ]),
                        'headers'  => [
                            'Content-Type' => 'application/json',
                        ],
                    ],
                    [
                        'name'     => 'file',
                        'contents' => fopen($filePath, 'r'),
                        'filename' => $filename,
                        'headers'  => [
                            'Content-Type' => 'application/zip',
                        ],
                    ],
                ],
            ]);

            if ($response->getStatusCode() === 200 || $response->getStatusCode() === 201) {
                $body = json_decode($response->getBody()->getContents(), true);
                return $body['id'] ?? null;
            }

            Log::error('Failed to upload backup to Google Drive. Status: ' . $response->getStatusCode());
        } catch (\Exception $e) {
            Log::error('Exception uploading backup to Google Drive: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Download a file from Google Drive to local destination path.
     */
    public function downloadBackup(string $fileId, string $destinationPath): bool
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return false;
        }

        try {
            $dir = dirname($destinationPath);
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }

            // Stream download directly to file to prevent memory exhaustion
            $response = $this->guzzleClient->request('GET', "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'sink' => $destinationPath,
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            Log::error("Exception downloading backup {$fileId} from Google Drive: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Delete a file from Google Drive.
     */
    public function deleteBackup(string $fileId): bool
    {
        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return false;
        }

        try {
            $response = Http::withToken($accessToken)
                ->delete("https://www.googleapis.com/drive/v3/files/{$fileId}");

            return $response->successful() || $response->status() === 404;
        } catch (\Exception $e) {
            Log::error("Exception deleting file {$fileId} from Google Drive: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Prune backups in the Google Drive folder, keeping only the latest $keepCount.
     */
    public function pruneOldBackups(string $folderId, int $keepCount = 5): int
    {
        $files = $this->listBackupFiles($folderId);
        if (count($files) <= $keepCount) {
            return 0;
        }

        // Sort descending by created_at (latest first)
        usort($files, function ($a, $b) {
            return $b['created_at']->timestamp <=> $a['created_at']->timestamp;
        });

        $deletedCount = 0;
        $toDelete = array_slice($files, $keepCount);

        foreach ($toDelete as $file) {
            if ($this->deleteBackup($file['id'])) {
                $deletedCount++;
                Log::info("Deleted old Google Drive backup: {$file['name']}");
            }
        }

        return $deletedCount;
    }
}
