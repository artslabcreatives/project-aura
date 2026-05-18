<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\XeroController;
use App\Services\XeroService;
use Illuminate\Auth\GenericUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class XeroAuthTest extends TestCase
{
    public function test_unauthenticated_xero_auth_url_request_returns_401(): void
    {
        $response = $this->get('/api/xero/auth-url');

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_start_xero_oauth_without_session_state(): void
    {
        config(['app.frontend_url' => 'http://frontend.test']);
        config(['cache.default' => 'array']);
        Cache::setDefaultDriver('array');

        $xeroService = $this->createMock(XeroService::class);
        $xeroService->expects($this->once())
            ->method('getAuthUrl')
            ->with($this->isString())
            ->willReturnCallback(fn (string $state) => 'https://xero.test/connect?state=' . urlencode($state));

        $controller = new XeroController($xeroService);

        $user = new GenericUser([
            'id' => 123,
            'role' => 'admin',
            'is_active' => true,
        ]);

        $request = Request::create('/api/xero/auth-url', 'GET');
        $request->setUserResolver(fn () => $user);

        $response = $controller->getAuthUrl($request);

        $payload = $response->getData(true);
        $state = $this->extractStateFromUrl($payload['url'] ?? null);

        $this->assertNotNull($state);

        $callbackRequest = Request::create('/api/xero/callback', 'GET', ['state' => $state]);
        $callbackResponse = $controller->callback($callbackRequest);

        $this->assertSame(
            'http://frontend.test/settings/integrations?xero=error&reason=no_code'
            , $callbackResponse->getTargetUrl()
        );

        $this->assertNull(Cache::get('xero_oauth_state:' . $user->getAuthIdentifier()));
    }

    public function test_xero_auth_url_uses_configured_scopes(): void
    {
        config([
            'services.xero.client_id' => 'client-id',
            'services.xero.redirect_uri' => 'https://frontend.test/api/xero/callback',
            'services.xero.scopes' => 'accounting.invoices.read offline_access',
        ]);

        $service = app(XeroService::class);

        $url = $service->getAuthUrl('state-token');

        $query = parse_url($url, PHP_URL_QUERY);

        $this->assertIsString($query);

        parse_str($query, $params);

        $this->assertSame('accounting.invoices.read offline_access', $params['scope'] ?? null);
        $this->assertSame('state-token', $params['state'] ?? null);
    }

    private function extractStateFromUrl(?string $url): ?string
    {
        if (!is_string($url) || $url === '') {
            return null;
        }

        $query = parse_url($url, PHP_URL_QUERY);

        if (!is_string($query) || $query === '') {
            return null;
        }

        parse_str($query, $params);

        return $params['state'] ?? null;
    }
}