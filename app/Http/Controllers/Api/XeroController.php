<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\XeroService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class XeroController extends Controller
{
    public function __construct(private XeroService $xeroService) {}

    /**
     * Return whether Xero is connected and basic metadata.
     */
    public function status(): JsonResponse
    {
        return response()->json($this->xeroService->getConnectionStatus());
    }

    /**
     * Generate and return the Xero OAuth2 authorisation URL.
     * The frontend redirects the user here to begin the OAuth flow.
     */
    public function getAuthUrl(Request $request): JsonResponse
    {
        $state = Str::random(32);
        $request->session()->put('xero_oauth_state', $state);

        return response()->json([
            'url' => $this->xeroService->getAuthUrl($state),
        ]);
    }

    /**
     * Handle the Xero OAuth2 callback (public route — no auth middleware).
     * Exchanges the code for tokens and redirects back to the frontend.
     */
    public function callback(Request $request)
    {
        $code  = $request->query('code');
        $state = $request->query('state');

        // Validate state to prevent CSRF
        $expected = $request->session()->pull('xero_oauth_state');
        if ($state !== $expected) {
            return redirect(config('app.frontend_url') . '/settings/integrations?xero=error&reason=state_mismatch');
        }

        if (!$code) {
            return redirect(config('app.frontend_url') . '/settings/integrations?xero=error&reason=no_code');
        }

        try {
            $this->xeroService->handleCallback($code);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Xero callback error: ' . $e->getMessage());
            return redirect(config('app.frontend_url') . '/settings/integrations?xero=error&reason=token_exchange');
        }

        return redirect(config('app.frontend_url') . '/settings/integrations?xero=connected');
    }

    /**
     * Trigger a manual sync of Xero Quotes → local Estimates.
     * Returns a summary of the sync operation.
     */
    public function sync(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero estimates.'], 403);
        }

        try {
            $summary = $this->xeroService->syncEstimates();
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero estimates synced successfully.',
            ...$summary,
        ]);
    }
}
