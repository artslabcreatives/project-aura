<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdsModuleAccess extends Model
{
    protected $fillable = [
        'email',
        'added_by',
    ];

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
