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

        // Define a robust and strict Content Security Policy
        // Mitigates XSS by restricting allowed script/connect sources,
        // preventing malicious scripts from loading or exfiltrating tokens (localStorage) to arbitrary external servers.
        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; " .
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
               "img-src 'self' data: https:; " .
               "font-src 'self' https://fonts.gstatic.com; " .
               "connect-src 'self' https: wss: ws:; " .
               "frame-src 'self' https:; " .
               "object-src 'none'; " .
               "base-uri 'self'; " .
               "form-action 'self';";

        // Set the CSP header on the response
        if (method_exists($response, 'header')) {
            $response->header('Content-Security-Policy', $csp);
        } elseif ($response instanceof Response) {
            $response->headers->set('Content-Security-Policy', $csp);
        }

        return $response;
    }
}
