<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoryEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'timestamp',
        'user_id',
        'action',
        'entity_id',
        'entity_type',
        'project_id',
        'details',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'details' => 'array',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($historyEntry) {
            if (empty($historyEntry->timestamp)) {
                $historyEntry->timestamp = now();
            }
        });
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the project that the history entry belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
