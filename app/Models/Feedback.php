<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'user_id',
        'description',
        'screenshot_path',
        'device_info',
        'type',
        'status',
    ];

    protected $casts = [
        'device_info' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
