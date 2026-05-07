<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'url',
        'file_path',
        'type',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    /**
     * Get the attachment URL.
     * Generates a temporary signed URL for S3 files.
     */
    public function getUrlAttribute($value)
    {
        if ($this->type === 'file' && $this->file_path) {
            try {
                return \Illuminate\Support\Facades\Storage::disk('s3')->temporaryUrl(
                    $this->file_path,
                    now()->addMinutes(1440)
                );
            } catch (\Exception $e) {
                return \Illuminate\Support\Facades\Storage::disk('s3')->url($this->file_path);
            }
        }

        return $value;
    }

    /**
     * Get the project that owns the attachment.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
