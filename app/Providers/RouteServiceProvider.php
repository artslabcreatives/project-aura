<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(300)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('ai_chatbot_sessions', function (Request $request) {
            return $this->getAiRateLimit('session', $request);
        });

        RateLimiter::for('ai_chatbot_messages', function (Request $request) {
            return $this->getAiRateLimit('message', $request);
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));

            // Load AI/MCP routes
            Route::middleware('api')
                ->group(base_path('routes/ai.php'));
        });
    }

    protected function getAiRateLimit(string $type, Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return Limit::perMinute(10)->by($request->ip());
        }

        $role = $user->role ?? 'user';
        $settingKey = "ai_rate_limit_{$type}_{$role}";

        // Cache the setting for 5 minutes to avoid hitting the DB on every rate-limited request
        $limit = \Illuminate\Support\Facades\Cache::remember($settingKey, 300, function () use ($settingKey, $type, $role) {
            $value = \App\Models\SystemSetting::get($settingKey);
            if (! is_null($value)) {
                return (int) $value;
            }
            $defaults = [
                'session' => ['admin' => 50, 'user' => 10, 'default' => 30],
                'message' => ['admin' => 100, 'user' => 30, 'default' => 60],
            ];
            return $defaults[$type][$role] ?? $defaults[$type]['default'];
        });

        return Limit::perMinute($limit)->by($user->id);
    }
}
