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
        'parent_id',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'group_id');
    }

    public function parent()
    {
        return $this->belongsTo(ProjectGroup::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ProjectGroup::class, 'parent_id')->with('children');
    }
}
