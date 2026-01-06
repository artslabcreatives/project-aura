<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and return bearer token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create a new token for stateless auth
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load('department'),
            'token' => $token,
        ]);
    }

    /**
     * Logout user - revoke current token
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('department'));
    }

    /**
     * Check if email exists
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $exists = User::where('email', $request->email)->exists();

        if (!$exists) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        return response()->json(['message' => 'Email exists']);
    }

    /**
     * Send OTP for password reset
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $email = $request->email;
        $otp = (string) rand(100000, 999999);
        
        // Store OTP in cache for 5 minutes
        \Illuminate\Support\Facades\Cache::put('password_reset_otp_' . $email, $otp, 300);

        // Send OTP via Webhook
        try {
            $response = \Illuminate\Support\Facades\Http::post('https://automation.artslabcreatives.com/webhook/aura-otp', [
                'email' => $email,
                'otp' => $otp,
                'type' => 'reset_password'
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to send OTP via webhook');
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send verification code'], 500);
        }

        return response()->json(['message' => 'Verification code sent']);
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = \Illuminate\Support\Facades\Cache::get('password_reset_otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return response()->json(['message' => 'Invalid or expired verification code'], 400);
        }

        return response()->json(['message' => 'Code verified successfully']);
    }

    /**
     * Reset Password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8',
        ]);

        // Verify OTP again before resetting
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('password_reset_otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return response()->json(['message' => 'Invalid or expired verification code'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Clear OTP
        \Illuminate\Support\Facades\Cache::forget('password_reset_otp_' . $request->email);

        return response()->json(['message' => 'Password reset successfully']);
    }
}
