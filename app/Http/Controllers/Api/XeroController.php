<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\XeroService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class XeroController extends Controller
{
    private const OAUTH_STATE_TTL_MINUTES = 10;

    public function __construct(private XeroService $xeroService) {}

    #[OA\Get(
        path: "/xero/status",
        summary: "Xero connection status",
        description: "Returns whether Xero is connected and basic metadata",
        security: [["bearerAuth" => []]],
        tags: ["Xero Integration"],
        responses: [new OA\Response(response: 200, description: "Connection status")]
    )]
    public function status(): JsonResponse
    {
        return response()->json($this->xeroService->getConnectionStatus());
    }

    #[OA\Get(
        path: "/xero/auth-url",
        summary: "Get Xero OAuth authorization URL",
        description: "Generates and returns the Xero OAuth2 authorization URL for the user to begin the OAuth flow",
        security: [["bearerAuth" => []]],
        tags: ["Xero Integration"],
        responses: [
            new OA\Response(response: 200, description: "Authorization URL", content: new OA\JsonContent(properties: [new OA\Property(property: "url", type: "string")])),
        ]
    )]
    public function getAuthUrl(Request $request): JsonResponse
    {
        $userId = $request->user()?->getAuthIdentifier();
        $nonce = Str::random(40);
        $state = $this->encodeState($userId, $nonce);

        Cache::put(
            $this->stateCacheKey($userId),
            $nonce,
            now()->addMinutes(self::OAUTH_STATE_TTL_MINUTES)
        );

        return response()->json([
            'url' => $this->xeroService->getAuthUrl($state),
        ]);
    }

    #[OA\Get(
        path: "/xero/callback",
        summary: "Xero OAuth callback",
        description: "Public endpoint. Handles the Xero OAuth2 callback, exchanges code for tokens, and redirects to frontend.",
        tags: ["Xero Integration"],
        parameters: [
            new OA\Parameter(name: "code", in: "query", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "state", in: "query", required: true, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 302, description: "Redirect to frontend")]
    )]
    public function callback(Request $request)
    {
        $code  = $request->query('code');
        $state = $request->query('state');

        // Validate state to prevent CSRF
        [$userId, $nonce] = $this->decodeState($state);
        $expected = $userId !== null ? Cache::pull($this->stateCacheKey($userId)) : null;

        if (!is_string($nonce) || !is_string($expected) || !hash_equals($expected, $nonce)) {
            return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=error&reason=state_mismatch');
        }

        if (!$code) {
            return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=error&reason=no_code');
        }

        try {
            $this->xeroService->handleCallback($code);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Xero callback error: ' . $e->getMessage());
            return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=error&reason=token_exchange');
        }

        return redirect(config('app.frontend_url') . '/configuration?section=integrations&xero=connected');
    }

    private function stateCacheKey(int|string|null $userId): string
    {
        return 'xero_oauth_state:' . $userId;
    }

    private function encodeState(int|string|null $userId, string $nonce): string
    {
        $payload = json_encode([
            'user_id' => $userId,
            'nonce' => $nonce,
        ], JSON_THROW_ON_ERROR);

        return rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');
    }

    /**
     * @return array{0: int|string|null, 1: string|null}
     */
    private function decodeState(?string $state): array
    {
        if (!is_string($state) || $state === '') {
            return [null, null];
        }

        $decoded = base64_decode(strtr($state, '-_', '+/'), true);

        if ($decoded === false) {
            return [null, null];
        }

        try {
            $payload = json_decode($decoded, true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return [null, null];
        }

        $userId = $payload['user_id'] ?? null;
        $nonce = $payload['nonce'] ?? null;

        if ((!is_int($userId) && !is_string($userId)) || !is_string($nonce) || $nonce === '') {
            return [null, null];
        }

        return [$userId, $nonce];
    }

    #[OA\Post(
        path: "/xero/sync-clients",
        summary: "Sync Xero Contacts to Clients",
        description: "Syncs Xero Contacts to local Clients (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Xero Integration"],
        responses: [
            new OA\Response(response: 200, description: "Sync summary"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function syncClients(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero clients.'], 403);
        }

        try {
            $summary = $this->xeroService->syncClients($request->user()->id);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero clients synced successfully.',
            ...$summary,
        ]);
    }

    #[OA\Post(
        path: "/xero/sync-suppliers",
        summary: "Sync Xero Suppliers",
        description: "Syncs Xero Suppliers to local suppliers table (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Xero Integration"],
        responses: [
            new OA\Response(response: 200, description: "Sync summary"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function syncSuppliers(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero suppliers.'], 403);
        }

        try {
            $summary = $this->xeroService->syncSuppliers($request->user()->id);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero suppliers synced successfully.',
            ...$summary,
        ]);
    }

    #[OA\Post(
        path: "/xero/sync",
        summary: "Sync Xero Quotes to Estimates",
        description: "Syncs Xero Quotes to local Estimates (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Xero Integration"],
        responses: [
            new OA\Response(response: 200, description: "Sync summary"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function sync(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero estimates.'], 403);
        }

        try {
            $summary = $this->xeroService->syncEstimates($request->user()->id);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero estimates synced successfully.',
            ...$summary,
        ]);
    }

    #[OA\Post(
        path: "/xero/sync-invoices",
        summary: "Sync Xero Invoices",
        description: "Syncs Xero Invoices to local Projects (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Xero Integration"],
        responses: [
            new OA\Response(response: 200, description: "Sync summary"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function syncInvoices(Request $request): JsonResponse
    {
        if (!in_array($request->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Only admin or hr users can sync Xero invoices.'], 403);
        }

        try {
            $summary = $this->xeroService->syncInvoices();
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'Xero invoices synced successfully.',
            ...$summary,
        ]);
    }

    #[OA\Get(
        path: "/xero/purchase-orders",
        summary: "Get Xero Purchase Orders",
        description: "Returns available Xero Purchase Orders not yet linked to a project",
        security: [["bearerAuth" => []]],
        tags: ["Xero Integration"],
        parameters: [
            new OA\Parameter(name: "xero_contact_id", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 200, description: "Purchase orders list")]
    )]
    public function getPurchaseOrders(Request $request): JsonResponse
    {
        try {
            $xeroContactId = $request->query('xero_contact_id');
            $pos = $this->xeroService->getAvailablePurchaseOrders($xeroContactId);
            return response()->json($pos);
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
