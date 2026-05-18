<?php

namespace App\Http\Controllers;

use App\Services\MattermostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use OpenApi\Attributes as OA;

class MattermostAuthController extends Controller
{
    protected MattermostService $mattermostService;

    public function __construct(MattermostService $mattermostService)
    {
        $this->mattermostService = $mattermostService;
    }

    /**
     * Show the Mattermost magic link page
     */
    public function show(): View
    {
        $user = Auth::user();
        
        return view('mattermost.magic-link', [
            'user' => $user,
        ]);
    }

    #[OA\Get(
        path: "/mattermost/redirect",
        summary: "Redirect to Mattermost with magic link",
        description: "Generates a magic link and redirects the browser to Mattermost",
        security: [["bearerAuth" => []]],
        tags: ["Mattermost"],
        responses: [new OA\Response(response: 302, description: "Redirect to Mattermost")]
    )]
    public function redirect(): RedirectResponse
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Please login first');
        }

        // Generate magic link URL
        $magicLinkUrl = $this->mattermostService->generateMagicLinkUrl($user);

        if (!$magicLinkUrl) {
            return back()->with('error', 'Failed to generate Mattermost login link. Please try again.');
        }

        // Redirect to Mattermost with magic link
        return redirect()->away($magicLinkUrl);
    }

    #[OA\Get(
        path: "/mattermost/magic-link",
        summary: "Get Mattermost magic link",
        description: "Returns a one-time magic link URL for Mattermost auto-login (expires in 5 minutes)",
        security: [["bearerAuth" => []]],
        tags: ["Mattermost"],
        responses: [
            new OA\Response(response: 200, description: "Magic link URL and expiry"),
            new OA\Response(response: 500, description: "Failed to generate link"),
        ]
    )]
    public function getMagicLink(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $magicLinkUrl = $this->mattermostService->generateMagicLinkUrl($user);

        if (!$magicLinkUrl) {
            return response()->json(['error' => 'Failed to generate magic link'], 500);
        }

        return response()->json([
            'url' => $magicLinkUrl,
            'expires_at' => now()->addMinutes(5)->toIso8601String(),
        ]);
    }

    #[OA\Get(
        path: "/mattermost/plugin/auto-login",
        summary: "Redirect to Mattermost plugin auto-login",
        description: "Generates auto-login URL and redirects the browser to Mattermost",
        security: [["bearerAuth" => []]],
        tags: ["Mattermost"],
        parameters: [
            new OA\Parameter(name: "channel", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 302, description: "Redirect to Mattermost")]
    )]
    public function pluginAutoLogin(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'Please login first');
        }

        // Get optional channel parameter
        $channelName = $request->query('channel', 'general');

        // Generate auto-login URL with email login
        $autoLoginUrl = $this->mattermostService->generatePluginAutoLoginUrl($user, $channelName);

        if (!$autoLoginUrl) {
            return back()->with('error', 'Failed to generate Mattermost login link. Please try again.');
        }

        // Redirect to Mattermost plugin auto-login endpoint
        return redirect()->away($autoLoginUrl);
    }

    #[OA\Get(
        path: "/mattermost/plugin/auto-login-url",
        summary: "Get Mattermost plugin auto-login URL",
        description: "Returns a URL for Mattermost plugin auto-login (expires in 60 seconds)",
        security: [["bearerAuth" => []]],
        tags: ["Mattermost"],
        parameters: [
            new OA\Parameter(name: "channel", in: "query", required: false, schema: new OA\Schema(type: "string", default: "general")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Auto-login URL and expiry"),
            new OA\Response(response: 500, description: "Integration not configured"),
        ]
    )]
    public function getPluginAutoLoginUrl(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check if Mattermost is properly configured
        if (!config('services.mattermost.url')) {
            return response()->json([
                'error' => 'Mattermost integration not configured. Please contact your administrator.'
            ], 500);
        }

        // Get optional channel parameter (project channel name or 'general')
        $channelName = $request->query('channel', 'general');

        $autoLoginUrl = $this->mattermostService->generatePluginAutoLoginUrl($user, $channelName);

        if (!$autoLoginUrl) {
            return response()->json([
                'error' => 'Unable to generate login URL. Please contact your administrator.'
            ], 500);
        }

        return response()->json([
            'url' => $autoLoginUrl,
            'expires_at' => now()->addSeconds(60)->toIso8601String(),
        ]);
    }
}
