<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'user_id',
        'activity_type',
        'from_status',
        'to_status',
        'comment',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(ProjectReport::class, 'report_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
