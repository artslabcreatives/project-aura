<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'title',
        'description',
        'file_url',
        'status',
        'tl_approved_at',
        'hr_approved_at',
        'rejected_at',
        'tl_user_id',
        'hr_user_id',
    ];

    protected $casts = [
        'tl_approved_at' => 'datetime',
        'hr_approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function teamLead(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tl_user_id');
    }

    public function hrUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hr_user_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(ReportActivity::class, 'report_id');
    }
}
