<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateLastActiveAt
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            // Only update if it's been more than 1 minute since last update
            if (!$user->last_active_at || $user->last_active_at->diffInMinutes(now()) >= 1) {
                $user->update(['last_active_at' => now()]);
            }
        }

        return $next($request);
    }
}
