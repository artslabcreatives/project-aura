<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'mattermost_channel_id',
        'client_id',
        'estimate_id',
        'estimated_hours',
        'status',
        'project_code',
        'po_number',
        'po_document',
        'is_locked_by_po',
        'invoice_number',
        'invoice_document',
        'grace_period_expires_at',
        'grace_period_notes',
        'grace_period_approved_by',
        'provisional_po_number',
        'provisional_po_expires_at',
        'is_manually_blocked',
        'is_physical_invoice',
        'courier_tracking_number',
        'courier_delivery_status',
        'currency',
        'campaign_report_document',
        'campaign_report_status',
        'campaign_report_approved_by',
        'campaign_report_approved_at',
    ];

    protected $casts = [
        'emails' => 'array',
        'phone_numbers' => 'array',
        'deadline' => 'date',
        'is_archived' => 'boolean',
        'is_locked_by_po' => 'boolean',
        'is_manually_blocked' => 'boolean',
        'is_physical_invoice' => 'boolean',
        'grace_period_expires_at' => 'date',
        'provisional_po_expires_at' => 'date',
        'campaign_report_approved_at' => 'datetime',
    ];

    protected $attributes = [
        'currency' => 'USD',
    ];

    protected $appends = [
        'po_document_url',
        'invoice_document_url',
        'campaign_report_document_url',
    ];

    /**
     * Get the full URL to the PO document.
     */
    public function getPoDocumentUrlAttribute()
    {
        return $this->getStoreUrl($this->po_document);
    }

    /**
     * Get the full URL to the invoice document.
     */
    public function getInvoiceDocumentUrlAttribute()
    {
        return $this->getStoreUrl($this->invoice_document);
    }

    /**
     * Get the full URL to the campaign report document.
     */
    public function getCampaignReportDocumentUrlAttribute()
    {
        return $this->getStoreUrl($this->campaign_report_document);
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

    /**
     * Determine whether the project's grace period is currently active.
     */
    public function isGracePeriodActive(): bool
    {
        if (!$this->grace_period_expires_at) {
            return false;
        }

        return now()->lessThanOrEqualTo($this->grace_period_expires_at);
    }

    /**
     * Determine whether tasks can be created for this project.
     * Returns true when the project is not blocked (has a PO or an active grace period
     * or a provisional PO) and is not manually blocked.
     */
    public function allowsTaskCreation(): bool
    {
        if ($this->is_manually_blocked) {
            return false;
        }

        if (!$this->is_locked_by_po) {
            return true; // Official PO has been received
        }

        // Allow if an active grace period covers today
        if ($this->isGracePeriodActive()) {
            return true;
        }

        // Allow if a provisional PO hasn't expired yet
        if ($this->provisional_po_number && $this->provisional_po_expires_at) {
            return now()->lessThanOrEqualTo($this->provisional_po_expires_at);
        }

        return false;
    }

    /**
     * Check if the campaign report is approved.
     * Only applies to Digital Marketing projects.
     */
    public function isCampaignReportApproved(): bool
    {
        if ($this->department?->name !== 'Digital Marketing') {
            return true;
        }

        return $this->campaign_report_status === 'approved';
    }

    /**
     * Get the user who approved the grace period.
     */
    public function gracePeriodApprover(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'grace_period_approved_by');
    }

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
			'po_number' => $this->po_number,
			'invoice_number' => $this->invoice_number,
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
     * Get the client that owns the project.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the originating estimate for this project.
     */
    public function estimate(): BelongsTo
    {
        return $this->belongsTo(Estimate::class);
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

    /**
     * Get the collaborators for the project (users from other departments).
     */
    public function collaborators(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_collaborators')
            ->withPivot('invited_by')
            ->withTimestamps();
    }
}
