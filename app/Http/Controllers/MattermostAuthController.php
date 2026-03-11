<?php

namespace App\Http\Controllers;

use App\Services\MattermostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

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

    /**
     * Generate and redirect to Mattermost with magic link
     */
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

    /**
     * API endpoint to get magic link URL
     */
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

    /**
     * Generate email login and redirect to Mattermost plugin auto-login
     */
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

    /**
     * API endpoint to get plugin auto-login URL with email login
     */
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
