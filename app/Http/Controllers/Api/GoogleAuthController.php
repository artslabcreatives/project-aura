<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\Response
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google.
     *
     * @return \Illuminate\Http\Response
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // The restriction: Only can logged in system admin added email user only
            // We search for the user by email in the existing database.
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Not authorized: This email was not added by an admin.
                Log::warning('Unauthorized Google login attempt for email: ' . $googleUser->getEmail());
                return redirect(config('app.frontend_url') . '/login?error=unauthorized_email');
            }

            // Link google_id if not already set or if it's different (updates linking)
            if ($user->google_id !== $googleUser->getId()) {
                $user->google_id = $googleUser->getId();
                $user->save();
            }

            // Generate authentication token for the SPA
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect back to frontend with the generated token
            // The frontend will catch this token and log the user in.
            return redirect(config('app.frontend_url') . '/login?token=' . $token);

        } catch (\Exception $e) {
            Log::error('Google Auth Error: ' . $e->getMessage());
            return redirect(config('app.frontend_url') . '/login?error=google_auth_failed');
        }
    }
}
