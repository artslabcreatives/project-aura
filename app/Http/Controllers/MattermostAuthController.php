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
}
