<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Tag extends Model
{
    protected $fillable = ['name', 'department_id'];

	

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
}
