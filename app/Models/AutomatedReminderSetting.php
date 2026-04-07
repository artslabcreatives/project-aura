<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AutomatedReminderSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'label',
        'days_before',
        'frequency_days',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'days_before' => 'array',
    ];
}
