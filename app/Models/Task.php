<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'project_id',
        'assignee_id',
        'due_date',
        'user_status',
        'project_stage_id',
        'priority',
        'tags',
        'start_date',
        'is_in_specific_stage',
        'revision_comment',
        'previous_stage_id',
        'original_assignee_id',
        'completed_at',
        'completed_at',
        'estimated_hours',
        'parent_id',
    ];

    protected $casts = [
        'tags' => 'array',
        'due_date' => 'datetime',
        'start_date' => 'datetime',
        'completed_at' => 'datetime',
        'is_in_specific_stage' => 'boolean',
    ];

    /**
     * Get the project that owns the task.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the assignee of the task.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    /**
     * Get the project stage of the task.
     */
    public function projectStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'project_stage_id');
    }

    /**
     * Get the previous stage of the task.
     */
    public function previousStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'previous_stage_id');
    }

    /**
     * Get the original assignee of the task.
     */
    public function originalAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'original_assignee_id');
    }

    /**
     * Get the attachments for the task.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    /**
     * Get the revision history for the task.
     */
    public function revisionHistories(): HasMany
    {
        return $this->hasMany(RevisionHistory::class);
    }
    /**
     * Get the subtasks for the task.
     */
    public function subtasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    /**
     * Get the parent task.
     */
    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    /**
     * Get the comments for the task.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }
    /**
     * Get the assignees for the task.
     */
    public function assignees(): HasMany
    {
        return $this->hasMany(TaskAssignee::class);
    }

    /**
     * Get the users assigned to the task.
     */
    public function assignedUsers()
    {
        return $this->belongsToMany(User::class, 'task_assignees')
                    ->withPivot('status')
                    ->withTimestamps();
    }
}
