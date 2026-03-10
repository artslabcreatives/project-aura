<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;

class SuggestedTask extends Model
{
	use Searchable;
	
    protected $fillable = [
        'project_id',
        'title',
        'description',
        'source',
        'suggested_at',
    ];

    protected $casts = [
        'suggested_at' => 'datetime',
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
			'title' => $this->title,
			'description' => $this->description,
			'source' => $this->source,
			'created_at' => $this->created_at->timestamp,
		]);
	}

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
