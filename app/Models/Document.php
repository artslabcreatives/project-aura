<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'name',
        'file_path',
        'url',
        'department_id',
        'uploaded_by',
        'status',
        'rejection_reason',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
