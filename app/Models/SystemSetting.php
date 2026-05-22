<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $table = 'system_settings';
    
    protected $primaryKey = 'key';
    
    public $incrementing = false;
    
    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::updated(function ($setting) {
            // Avoid creating duplicate logs if the value didn't change
            if ($setting->isDirty('value')) {
                \App\Models\AuditLog::create([
                    'user_id'       => auth()->id(),
                    'entity_type'   => self::class,
                    'entity_id'     => 0,
                    'action'        => 'update_system_setting',
                    'field_changed' => $setting->key,
                    'old_value'     => $setting->getOriginal('value'),
                    'new_value'     => $setting->value,
                ]);
            }
        });

        static::created(function ($setting) {
            \App\Models\AuditLog::create([
                'user_id'       => auth()->id(),
                'entity_type'   => self::class,
                'entity_id'     => 0,
                'action'        => 'create_system_setting',
                'field_changed' => $setting->key,
                'old_value'     => null,
                'new_value'     => $setting->value,
            ]);
        });
    }

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::find($key);
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value): void
    {
        self::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Get a setting value as a boolean.
     */
    public static function isEnabled(string $key, bool $default = false): bool
    {
        $val = self::get($key);
        if (is_null($val)) {
            return $default;
        }
        return filter_var($val, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Get a setting value decoded as a JSON array.
     *
     * @return array<int|string, mixed>
     */
    public static function getJson(string $key, array $default = []): array
    {
        $val = self::get($key);
        if (is_null($val)) {
            return $default;
        }
        $decoded = json_decode($val, true);
        return is_array($decoded) ? $decoded : $default;
    }
}
