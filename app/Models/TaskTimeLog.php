<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskTimeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'started_at',
        'ended_at',
        'hours_logged',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'hours_logged' => 'decimal:2',
    ];

    /**
     * Get the task that owns the time log.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user who logged the time.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate hours logged when ended_at is set.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($log) {
            if ($log->ended_at && $log->started_at) {
                $log->hours_logged = $log->started_at->diffInSeconds($log->ended_at, true) / 3600;
            }
        });
    }
}
