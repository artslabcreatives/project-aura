<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Scout\Searchable;

class ProjectGroup extends Model
{
    use HasFactory;
	use Searchable;

    protected $fillable = [
        'name',
        'department_id',
        'parent_id',
    ];

	/**
	 * Get the indexable data array for the model.
	 *
	 * @return array<string, mixed>
	 */
	public function toSearchableArray()
	{
		return array_merge($this->toArray(),[
			'id' => (string) $this->id,
			'name' => $this->name,
			'created_at' => $this->created_at->timestamp,
		]);
	}

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'project_group_id');
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
