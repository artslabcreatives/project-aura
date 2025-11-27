<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevisionHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'comment',
        'requested_by_id',
        'requested_at',
        'resolved_at',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the task that owns the revision history.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user who requested the revision.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_id');
    }
}
