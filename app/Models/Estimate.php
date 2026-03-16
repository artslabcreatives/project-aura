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
        'issue_date',
        'valid_until',
        'currency',
        'tax_rate',
        'subtotal',
        'tax_amount',
        'total',
    ];

    protected $attributes = [
        'status'   => 'draft',
        'currency' => 'USD',
        'tax_rate' => 0,
        'subtotal' => 0,
        'tax_amount' => 0,
        'total'    => 0,
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'tax_rate'   => 'float',
        'subtotal'   => 'float',
        'tax_amount' => 'float',
        'total'      => 'float',
        'issue_date' => 'date',
        'valid_until' => 'date',
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

    /**
     * Get the line items for this estimate.
     */
    public function items(): HasMany
    {
        return $this->hasMany(EstimateItem::class)->orderBy('sort_order');
    }
}
