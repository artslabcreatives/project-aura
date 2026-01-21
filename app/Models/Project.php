<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

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
