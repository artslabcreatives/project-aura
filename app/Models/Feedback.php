<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Feedback extends Model
{
	use Searchable;
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

	/**
	 * Get the indexable data array for the model.
	 *
	 * @return array<string, mixed>
	 */
	public function toSearchableArray()
	{
		return array_merge($this->toArray(),[
			'id' => (string) $this->id,
			'description' => $this->description,
			'type' => $this->type,
			'status' => $this->status,
			'created_at' => $this->created_at->timestamp,
		]);
	}

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
