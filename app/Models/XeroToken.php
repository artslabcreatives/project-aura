<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class XeroToken extends Model
{
    protected $fillable = [
        'tenant_id',
        'tenant_name',
        'access_token',
        'refresh_token',
        'token_expires_at',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
    ];

    /**
     * Always fetch the single stored credential set.
     */
    public static function current(): ?self
    {
        return static::latest('updated_at')->first();
    }

    public function isExpired(): bool
    {
        return now()->greaterThanOrEqualTo($this->token_expires_at);
    }
}
