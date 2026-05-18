<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Email extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'message_id',
        'folder_id',
        'subject',
        'from',
        'to',
        'cc',
        'bcc',
        'body',
        'body_type',
        'sent_at',
        'is_read',
        'project_id',
        'task_id',
        'client_id',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
