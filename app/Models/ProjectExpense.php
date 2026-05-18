<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'supplier_id',
        'submitted_by',
        'approved_by',
        'type',
        'amount',
        'currency',
        'description',
        'expense_date',
        'receipt_file_path',
        'status',
        'approved_at',
        'rejection_reason',
        'is_reimbursable',
        'reimbursement_noted',
        'xero_expense_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'approved_at' => 'datetime',
        'is_reimbursable' => 'boolean',
        'reimbursement_noted' => 'boolean',
    ];

    protected $appends = ['receipt_file_url'];

    public function getReceiptFileUrlAttribute(): ?string
    {
        if (!$this->receipt_file_path) {
            return null;
        }

        try {
            return \Illuminate\Support\Facades\Storage::disk('s3')->temporaryUrl(
                $this->receipt_file_path,
                now()->addMinutes(1440)
            );
        } catch (\Exception $e) {
            return \Illuminate\Support\Facades\Storage::disk('s3')->url($this->receipt_file_path);
        }
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
