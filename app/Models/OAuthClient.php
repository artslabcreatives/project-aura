<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OAuthClient extends Model
{
    protected $table = 'oauth_clients';

    protected $fillable = [
        'name',
        'client_id',
        'client_secret',
        'redirect_uris',
        'allowed_scopes',
        'is_active',
        'is_confidential',
        'description',
        'logo_url',
        'homepage_url',
        'created_by',
    ];

    protected $casts = [
        'redirect_uris' => 'array',
        'allowed_scopes' => 'array',
        'is_active' => 'boolean',
        'is_confidential' => 'boolean',
        'client_secret' => 'encrypted',
    ];

    protected $hidden = ['client_secret'];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function authorizationCodes(): HasMany
    {
        return $this->hasMany(OAuthAuthorizationCode::class, 'client_id');
    }

    public function accessTokens(): HasMany
    {
        return $this->hasMany(OAuthAccessToken::class, 'client_id');
    }

    public function isRedirectUriAllowed(string $uri): bool
    {
        return in_array($uri, $this->redirect_uris ?? []);
    }

    public function isScopeAllowed(string $scope): bool
    {
        if ($this->allowed_scopes === null) {
            return true; // null = all scopes allowed
        }
        return in_array($scope, $this->allowed_scopes);
    }
}
