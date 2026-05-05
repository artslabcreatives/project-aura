<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'source',
        'project_id',
        'client_id',
        'invoice_number',
        'invoice_document',
        'is_physical_invoice',
        'courier_tracking_number',
        'status',
        'amount',
        'currency',
        'issued_at',
        'due_date',
        'xero_invoice_id',
        'xero_status',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_physical_invoice' => 'boolean',
        'issued_at' => 'datetime',
        'due_date' => 'date',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
