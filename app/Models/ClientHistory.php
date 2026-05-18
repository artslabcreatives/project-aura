<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'client_id',
        'action',
        'target_name',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the client associated with the history entry.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
