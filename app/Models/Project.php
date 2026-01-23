<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Project extends Model
{
    use HasFactory;
	use Searchable;

    protected $fillable = [
        'name',
        'description',
        'department_id',
        'emails',
        'phone_numbers',
        'deadline',
        'created_by',
        'project_group_id',
        'is_archived',
    ];

    protected $casts = [
        'emails' => 'array',
        'phone_numbers' => 'array',
        'deadline' => 'date',
        'is_archived' => 'boolean',
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
			'emails' => $this->emails,
			'phone_numbers' => $this->phone_numbers,
			'description' => $this->description,
			'is_archived' => $this->is_archived,
			'created_at' => $this->created_at->timestamp,
		]);
	}

    /**
     * Get the department that owns the project.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the project group that owns the project.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(ProjectGroup::class, 'project_group_id');
    }

    /**
     * Get the stages for the project.
     */
    public function stages(): HasMany
    {
        return $this->hasMany(Stage::class)->orderBy('order');
    }

    /**
     * Get the tasks for the project.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the suggested tasks for the project.
     */
    public function suggestedTasks(): HasMany
    {
        return $this->hasMany(SuggestedTask::class);
    }

    /**
     * Get the history entries for the project.
     */
    public function historyEntries(): HasMany
    {
        return $this->hasMany(HistoryEntry::class);
    }

    /**
     * Get the user who created the project.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
