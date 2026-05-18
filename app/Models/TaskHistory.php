<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class TaskHistory extends Model
{
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
