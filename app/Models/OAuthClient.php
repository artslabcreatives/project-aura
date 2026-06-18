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

    public function getRedirectUrisAttribute($value): array
    {
        if (empty($value)) {
            return [];
        }
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
        return array_values(array_filter(array_map('trim', preg_split('/[\n,]+/', $value))));
    }

    public function setRedirectUrisAttribute($value): void
    {
        if (is_array($value)) {
            $this->attributes['redirect_uris'] = json_encode(array_values(array_filter(array_map('trim', $value))));
        } elseif (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->attributes['redirect_uris'] = json_encode($decoded);
            } else {
                $uris = array_values(array_filter(array_map('trim', preg_split('/[\n,]+/', $value))));
                $this->attributes['redirect_uris'] = json_encode($uris);
            }
        } else {
            $this->attributes['redirect_uris'] = json_encode([]);
        }
    }

    public function getAllowedScopesAttribute($value): ?array
    {
        if ($value === null) {
            return null;
        }
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
        return array_values(array_filter(array_map('trim', preg_split('/[\n,]+/', $value))));
    }

    public function setAllowedScopesAttribute($value): void
    {
        if ($value === null) {
            $this->attributes['allowed_scopes'] = null;
        } elseif (is_array($value)) {
            $this->attributes['allowed_scopes'] = json_encode(array_values(array_filter(array_map('trim', $value))));
        } elseif (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->attributes['allowed_scopes'] = json_encode($decoded);
            } else {
                $scopes = array_values(array_filter(array_map('trim', preg_split('/[\n,]+/', $value))));
                $this->attributes['allowed_scopes'] = json_encode($scopes);
            }
        } else {
            $this->attributes['allowed_scopes'] = null;
        }
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
