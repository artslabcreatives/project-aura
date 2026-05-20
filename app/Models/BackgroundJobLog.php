<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BackgroundJobLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'command',
        'runner',
        'status',
        'output',
        'error_message',
    ];
}
