<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Stage extends Model
{
    use HasFactory;
	use Searchable;

    protected $fillable = [
        'title',
        'color',
        'order',
        'type',
        'project_id',
        'main_responsible_id',
        'backup_responsible_id_1',
        'backup_responsible_id_2',
        'is_review_stage',
        'linked_review_stage_id',
        'approved_target_stage_id',
        'stage_group_id',
        'user_id',
        'context_stage_id',
    ];

    protected $casts = [
        'is_review_stage' => 'boolean',
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
			'type' => $this->type,
			'created_at' => $this->created_at->timestamp,
		]);
	}

    /**
     * Get the project that owns the stage.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the stage group this stage belongs to.
     */
    public function stageGroup(): BelongsTo
    {
        return $this->belongsTo(StageGroup::class);
    }

    /**
     * Get the main responsible user.
     */
    public function mainResponsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'main_responsible_id');
    }

    /**
     * Get the first backup responsible user.
     */
    public function backupResponsible1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'backup_responsible_id_1');
    }

    /**
     * Get the second backup responsible user.
     */
    public function backupResponsible2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'backup_responsible_id_2');
    }

    /**
     * Get the linked review stage.
     */
    public function linkedReviewStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'linked_review_stage_id');
    }

    /**
     * Get the approved target stage.
     */
    public function approvedTargetStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'approved_target_stage_id');
    }

    /**
     * Get the tasks in this stage.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'project_stage_id');
    }
}
