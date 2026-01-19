<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProjectGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'department_id',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
