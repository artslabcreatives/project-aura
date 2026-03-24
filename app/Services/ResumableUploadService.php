<?php

namespace App\Services;

use Illuminate\Support\Facades\File as FileFacade;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use TusPhp\Config as TusConfig;
use TusPhp\Tus\Server;

class ResumableUploadService
{
    private ?Server $server = null;

    public function server(): Server
    {
        if ($this->server instanceof Server) {
            return $this->server;
        }

        $cachePath = rtrim((string) config('resumable_uploads.cache_path'), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $uploadPath = (string) config('resumable_uploads.temp_path');

        FileFacade::ensureDirectoryExists($cachePath);
        FileFacade::ensureDirectoryExists($uploadPath);

        TusConfig::set([
            'redis' => [
                'host' => env('REDIS_HOST', '127.0.0.1'),
                'port' => env('REDIS_PORT', '6379'),
                'database' => env('REDIS_DB', 0),
            ],
            'file' => [
                'dir' => $cachePath,
                'name' => (string) config('resumable_uploads.cache_file', 'tus_php.server.cache'),
            ],
        ], true);

        $server = new Server('file');
        $server->setApiPath((string) config('resumable_uploads.api_path', '/api/uploads/tus'));
        $server->setUploadDir($uploadPath);
        $server->setMaxUploadSize((int) config('resumable_uploads.max_upload_size', 0));

        $this->server = $server;

        return $this->server;
    }

    public function getUpload(string $uploadKey, bool $allowExpired = false): array
    {
        $metadata = $this->server()->getCache()->get($uploadKey, $allowExpired);

        if (!is_array($metadata) || empty($metadata)) {
            throw new RuntimeException('Upload could not be found or has expired.');
        }

        return $metadata;
    }

    public function extractUploadKey(?string $uploadUrl): string
    {
        $path = (string) parse_url((string) $uploadUrl, PHP_URL_PATH);
        $uploadKey = basename($path);

        if (blank($uploadKey) || $uploadKey === 'tus') {
            throw new RuntimeException('Upload key could not be determined from the upload URL.');
        }

        return $uploadKey;
    }

    public function finalizeToDisk(string $uploadKey, string $directory, ?string $preferredName = null, ?string $disk = null): array
    {
        $diskName = $disk ?: (string) config('resumable_uploads.final_disk', 's3');
        $metadata = $this->getUpload($uploadKey);

        $tempPath = $metadata['file_path'] ?? null;
        $size = (int) ($metadata['size'] ?? 0);
        $offset = (int) ($metadata['offset'] ?? 0);

        if (!$tempPath || !FileFacade::exists($tempPath)) {
            throw new RuntimeException('Temporary upload file is missing.');
        }

        if ($size > 0 && $offset < $size) {
            throw new RuntimeException('Upload is not complete yet.');
        }

        $originalName = $preferredName
            ?: ($metadata['metadata']['filename'] ?? null)
            ?: ($metadata['metadata']['name'] ?? null)
            ?: ($metadata['name'] ?? basename($tempPath));

        $originalName = trim((string) $originalName) ?: 'upload.bin';

        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $slug = Str::slug($baseName);

        if ($slug === '') {
            $slug = 'upload';
        }

        $filename = Str::uuid() . '-' . $slug . ($extension ? '.' . $extension : '');
        $targetPath = trim($directory, '/') . '/' . $filename;

        $stream = fopen($tempPath, 'rb');

        if ($stream === false) {
            throw new RuntimeException('Temporary upload could not be opened for finalization.');
        }

        try {
            $stored = Storage::disk($diskName)->writeStream($targetPath, $stream);

            if ($stored === false) {
                throw new RuntimeException('Upload could not be moved to permanent storage.');
            }
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }
        }

        FileFacade::delete($tempPath);
        $this->server()->getCache()->delete($uploadKey);

        return [
            'disk' => $diskName,
            'path' => $targetPath,
            'url' => Storage::disk($diskName)->url($targetPath),
            'name' => $originalName,
            'size' => $size,
            'upload_key' => $uploadKey,
        ];
    }
}