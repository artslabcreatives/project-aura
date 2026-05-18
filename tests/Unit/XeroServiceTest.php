<?php

namespace Tests\Unit;

use App\Services\XeroService;
use ReflectionMethod;
use Tests\TestCase;

class XeroServiceTest extends TestCase
{
    public function test_resolve_quote_title_falls_back_to_quote_number_when_title_is_missing(): void
    {
        $service = app(XeroService::class);

        $title = $this->invokePrivateMethod($service, 'resolveQuoteTitle', [[
            'QuoteNumber' => 'QU-123',
        ]]);

        $this->assertSame('QU-123', $title);
    }

    public function test_resolve_quote_title_falls_back_to_default_when_title_and_quote_number_are_blank(): void
    {
        $service = app(XeroService::class);

        $title = $this->invokePrivateMethod($service, 'resolveQuoteTitle', [[
            'Title' => '   ',
            'QuoteNumber' => '',
        ]]);

        $this->assertSame('Xero Quote', $title);
    }

    /**
     * @param  array<int, mixed>  $arguments
     */
    private function invokePrivateMethod(object $object, string $method, array $arguments = []): mixed
    {
        $reflection = new ReflectionMethod($object, $method);
        $reflection->setAccessible(true);

        return $reflection->invokeArgs($object, $arguments);
    }
}