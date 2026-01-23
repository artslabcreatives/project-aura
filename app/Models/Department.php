<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
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

    /**
     * Get the users in the department.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the projects for the department.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
