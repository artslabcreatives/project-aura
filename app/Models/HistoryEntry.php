<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;

class HistoryEntry extends Model
{
    use HasFactory;
	use Searchable;

    protected $fillable = [
        'timestamp',
        'user_id',
        'action',
        'entity_id',
        'entity_type',
        'project_id',
        'details',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'details' => 'array',
    ];

	/**
	 * Get the indexable data array for the model.
	 *
	 * @return array<string, mixed>
	 */
	public function toSearchableArray()
	{
		$details = [];
		if ($this->details && is_array($this->details)) {
			foreach ($this->details as $key => $value) {
				$details[] = is_array($value) ? json_encode($value) : (string) $value;
			}
		}
		
		return array_merge($this->toArray(),[
			'id' => (string) $this->id,
			'action' => $this->action,
			'details' => $details,
			'created_at' => $this->created_at->timestamp,
		]);
	}

    /**
     * Boot the model.
     * Sets the timestamp field (event time) automatically if not provided.
     * Note: This is separate from Laravel's created_at/updated_at timestamps.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($historyEntry) {
            if (empty($historyEntry->timestamp)) {
                $historyEntry->timestamp = now();
            }
        });
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the project that the history entry belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
