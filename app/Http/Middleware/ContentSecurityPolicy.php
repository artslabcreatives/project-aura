<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $nonce = app('csp-nonce');

        if ($request->is('api/*') || $request->expectsJson()) {
            // Apply extremely strict CSP for REST API responses to prevent execution of any HTML/script content
            $csp = "default-src 'none'; frame-ancestors 'none';";
        } else {
            // Unsafe-eval is allowed in local development (HMR / source maps) and on the
            // LaRecipe documentation routes, whose bundled Vue 2 runtime-compiler calls
            // new Function() to compile in-DOM templates. It stays disabled everywhere else.
            $docsRoute = trim(config('larecipe.docs.route', '/manuals'), '/');
            $needsUnsafeEval = config('app.env') === 'local'
                || $request->is($docsRoute, $docsRoute . '/*');

            $unsafeEval = $needsUnsafeEval ? " 'unsafe-eval'" : "";

            $csp = "default-src 'self'; " .
                   "script-src 'self' 'nonce-{$nonce}'{$unsafeEval} https://apis.google.com; " .
                   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
                   "img-src 'self' data: https:; " .
                   "font-src 'self' https://fonts.gstatic.com; " .
                   "connect-src 'self' https: wss: ws:; " .
                   "frame-src 'self' https:; " .
                   "object-src 'none'; " .
                   "base-uri 'self'; " .
                   "form-action 'self';";
        }

        // Set the CSP header on the response
        if (method_exists($response, 'header')) {
            $response->header('Content-Security-Policy', $csp);
        } elseif ($response instanceof Response) {
            $response->headers->set('Content-Security-Policy', $csp);
        }

        return $response;
    }
}
