<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    protected function unauthenticated($request, AuthenticationException $exception): Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return new JsonResponse([
                'message' => $exception->getMessage() ?: 'Unauthenticated.',
            ], 401);
        }

        if (!app('router')->has('login')) {
            return new JsonResponse([
                'message' => $exception->getMessage() ?: 'Unauthenticated.',
            ], 401);
        }

        return redirect()->guest(route('login'));
    }
}
