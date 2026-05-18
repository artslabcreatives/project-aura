<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'reminder_at',
        'is_sent',
        'is_read',
        'is_overridden',
        'overridden_by',
        'overridden_at',
        'reminder_frequency_days',
    ];

    protected $casts = [
        'reminder_at' => 'datetime',
        'is_sent' => 'boolean',
        'is_read' => 'boolean',
        'is_overridden' => 'boolean',
        'overridden_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function overriddenBy()
    {
        return $this->belongsTo(User::class, 'overridden_by');
    }
}
