<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdConnection extends Model
{
    protected $fillable = [
        'ad_profile_id',
        'platform',
        'account_id',
        'access_token',
        'refresh_token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function adProfile()
    {
        return $this->belongsTo(AdProfile::class);
    }
}
