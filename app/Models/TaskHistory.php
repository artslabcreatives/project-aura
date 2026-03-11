<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;


class TaskHistory extends Model
{
    //
	use Searchable;

	protected $fillable = [
		'action',
		'details',
		'previous_details',
		'incoming_user_id',
		'outgoing_user_id',
		'incoming_stage_id',
		'outgoing_stage_id',
		'task_id',
		'user_id',
	];

	public $casts = [
		'previous_details' => 'array',
	];

	/**
	 * Get the indexable data array for the model.
	 *
	 * @return array<string, mixed>
	 */
	public function toSearchableArray()
	{
		$details = [];
		if ($this->details) {
			$details[] = is_array($this->details) ? json_encode($this->details) : (string) $this->details;
		}
		return array_merge($this->toArray(),[
			'id' => (string) $this->id,
			'action' => $this->action,
			'details' => $details,
			'created_at' => $this->created_at->timestamp,
		]);
	}

	public function task()
	{
		return $this->belongsTo(Task::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function incomingUser()
	{
		return $this->belongsTo(User::class, 'incoming_user_id');
	}

	public function outgoingUser()
	{
		return $this->belongsTo(User::class, 'outgoing_user_id');
	}

	public function incomingStage()
	{
		return $this->belongsTo(Stage::class, 'incoming_stage_id');
	}

	public function outgoingStage()
	{
		return $this->belongsTo(Stage::class, 'outgoing_stage_id');
	}
}
