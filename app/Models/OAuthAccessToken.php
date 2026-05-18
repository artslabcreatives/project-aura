<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OAuthAccessToken extends Model
{
    protected $table = 'oauth_access_tokens';

    protected $fillable = [
        'jti',
        'user_id',
        'client_id',
        'scopes',
        'refresh_token',
        'expires_at',
        'refresh_token_expires_at',
        'revoked',
    ];

    protected $casts = [
        'scopes' => 'array',
        'expires_at' => 'datetime',
        'refresh_token_expires_at' => 'datetime',
        'revoked' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(OAuthClient::class, 'client_id');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return !$this->revoked && !$this->isExpired();
    }
}
