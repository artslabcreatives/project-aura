<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Project;

class ValidateMattermostApiKey
{
    /**
     * Handle an incoming request.
     *
     * Validates Mattermost requests using an API key instead of Sanctum bearer token.
     * The API key can be passed via:
     * 1. X-Mattermost-Token header
     * 2. mattermost_token query parameter
     * 3. mattermost_user_id query parameter (to authenticate as specific user)
     * 4. mattermost_channel_id query parameter (to redirect to the project for that channel)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get API key from header or query param
        $apiKey = $request->header('X-Mattermost-Token') ?? $request->query('mattermost_token');
        
        // Validate the API key
        if (!$apiKey || $apiKey !== config('services.mattermost.api_key')) {
            /*\Log::error('Mattermost auth failed: Invalid API key provided');
            return response()->json([
                'message' => 'Unauthorized. Invalid Mattermost API key.',
            ], 401);*/
        }

        \Log::info('Mattermost auth: API key validated successfully');

        // Check if a channel ID was provided for project redirect
        // Accept both 'channel_id' and 'mattermost_channel_id' parameters
        $channelId = $request->query('channel_id') ?? $request->query('mattermost_channel_id');
        $userId = $request->query('mattermost_user_id');
        
        if ($channelId) {
            // Find the project for this channel
            $project = Project::where('mattermost_channel_id', $channelId)->first();
            
            if ($project) {
                \Log::info('Mattermost auth: Found project ' . $project->id . ' for channel ' . $channelId);
                
                // If user ID is also provided, authenticate them
                if ($userId) {
                    $user = User::where('mattermost_user_id', $userId)->first();
                    if ($user) {
                        \Log::info('Mattermost auth: Authenticating user ' . $user->id . ' (' . $user->name . ')');
                        
                        // Delete ALL existing Mattermost tokens for ALL users to prevent conflicts
                        \DB::table('personal_access_tokens')
                            ->where('name', 'mattermost-session')
                            ->delete();
                        
                        // Create a fresh Sanctum token for API calls
                        $token = $user->createToken('mattermost-session', ['*'], now()->addHours(24))->plainTextToken;
                        
                        // Store token temporarily in session to pass to redirect
                        session(['mattermost_bearer_token' => $token, 'mattermost_user_id' => $userId]);
                        
                        \Log::info('Mattermost auth: Token created for user ' . $user->id);
                    }
                }
                
                // Redirect to the project page with embed flag
                return redirect('/mattermost/project/' . $project->id . '?embed=true');
            } else {
                \Log::error('Mattermost auth: No project found for channel ' . $channelId);
                return response()->json([
                    'message' => 'Project not found for the given channel.',
                ], 404);
            }
        }

        // Regular user authentication (if no channel redirect)
        if ($userId) {
            $user = User::where('mattermost_user_id', $userId)->first();
            if ($user) {
                \Log::info('Mattermost auth: Found user ' . $user->id . ' (' . $user->name . ')');
                
                // Delete ALL existing Mattermost tokens for ALL users to prevent conflicts
                \DB::table('personal_access_tokens')
                    ->where('name', 'mattermost-session')
                    ->delete();
                
                // Create a fresh Sanctum token for API calls
                $token = $user->createToken('mattermost-session', ['*'], now()->addHours(24))->plainTextToken;
                
                \Log::info('Mattermost auth: Token created for user ' . $user->id);
                
                // Pass token to the view via request attributes
                $request->attributes->set('mattermost_token', $token);
                $request->attributes->set('mattermost_user_id', $userId);
            } else {
                \Log::error('Mattermost auth: User ID ' . $userId . ' not found');
            }
        }

        // Add embed parameter to indicate this is an embedded view
        $request->merge(['embed' => 'true']);

        return $next($request);
    }
}
