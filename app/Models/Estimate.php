<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estimate extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'client_id',
        'estimated_hours',
        'amount',
        'status',
        'notes',
        'project_id',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the client for this estimate.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the auto-created suggested project for this estimate.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who created the estimate.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
