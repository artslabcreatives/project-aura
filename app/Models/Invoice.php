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
        'invoice_type',
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

    protected $appends = ['invoice_document_url'];

    /**
     * Get the full URL to the invoice document.
     */
    public function getInvoiceDocumentUrlAttribute()
    {
        return $this->getStoreUrl($this->invoice_document);
    }

    /**
     * Helper to get temporary or plain URL from S3.
     */
    protected function getStoreUrl($path)
    {
        if (!$path) {
            return null;
        }

        try {
            return \Illuminate\Support\Facades\Storage::disk('s3')->temporaryUrl(
                $path, 
                now()->addMinutes(1440)
            );
        } catch (\Exception $e) {
            return \Illuminate\Support\Facades\Storage::disk('s3')->url($path);
        }
    }

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
