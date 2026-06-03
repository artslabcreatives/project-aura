<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdProfile extends Model
{
    protected $fillable = [
        'user_id',
        'client_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function connections()
    {
        return $this->hasMany(AdConnection::class);
    }
}
