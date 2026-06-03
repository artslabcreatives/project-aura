<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AdsModuleAccess;
use Illuminate\Support\Facades\Auth;

class CheckAdsModuleAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $hasAccess = AdsModuleAccess::where('email', Auth::user()->email)->exists();

        if (!$hasAccess && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'You do not have access to the Ads Module.'], 403);
        }

        return $next($request);
    }
}
