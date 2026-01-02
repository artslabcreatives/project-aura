<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuggestedTask extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'source',
        'suggested_at',
    ];

    protected $casts = [
        'suggested_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
