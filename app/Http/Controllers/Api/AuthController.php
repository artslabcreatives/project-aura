<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: "/login",
        summary: "Login user",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "password"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "system@artslabcreatives.com"),
                    new OA\Property(property: "password", type: "string", format: "password", example: "system@artslabcreatives")
                ]
            )
        ),
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful login",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Login successful"),
                        new OA\Property(property: "user", type: "object"),
                        new OA\Property(property: "token", type: "string", example: "1|abcdef123456...")
                    ]
                )
            ),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'two_factor_code' => 'nullable|string',
            'two_factor_recovery_code' => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->hasEnabledTwoFactorAuthentication()) {
            if ($request->two_factor_code) {
                if (! (new \PragmaRX\Google2FA\Google2FA)->verifyKey($user->two_factor_secret, $request->two_factor_code)) {
                    throw ValidationException::withMessages([
                        'two_factor_code' => ['The provided two-factor authentication code was invalid.'],
                    ]);
                }
            } elseif ($request->two_factor_recovery_code) {
                $recoveryCodes = $user->two_factor_recovery_codes;
 
                if (! in_array($request->two_factor_recovery_code, $recoveryCodes)) {
                    throw ValidationException::withMessages([
                        'two_factor_recovery_code' => ['The provided recovery code was invalid.'],
                    ]);
                }
 
                $user->forceFill([
                    'two_factor_recovery_codes' => array_values(array_diff($recoveryCodes, [$request->two_factor_recovery_code])),
                ])->save();
            } else {
                return response()->json([
                    'two_factor' => true,
                ]);
            }
        }

        // Create a new token for stateless auth
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load('department'),
            'token' => $token,
            'force_password_reset' => (bool) $user->force_password_reset,
        ]);
    }

    #[OA\Post(
        path: "/logout",
        summary: "Logout user",
        security: [["bearerAuth" => []]],
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful logout",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Logout successful")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function logout(Request $request): JsonResponse
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }

    #[OA\Get(
        path: "/user",
        summary: "Get authenticated user",
        security: [["bearerAuth" => []]],
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "User data",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "id", type: "integer"),
                        new OA\Property(property: "name", type: "string"),
                        new OA\Property(property: "email", type: "string"),
                        new OA\Property(property: "department", type: "object")
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('department'));
    }

    #[OA\Post(
        path: "/check-email",
        summary: "Check if email exists",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com")
                ]
            )
        ),
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Email exists",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Email exists")
                    ]
                )
            ),
            new OA\Response(response: 404, description: "Email not found")
        ]
    )]
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $exists = User::where('email', $request->email)->exists();

        if (!$exists) {
            return response()->json(['message' => 'Email not found'], 404);
        }

        return response()->json(['message' => 'Email exists']);
    }

    #[OA\Post(
        path: "/forgot-password",
        summary: "Send OTP for password reset",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com")
                ]
            )
        ),
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Verification code sent",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Verification code sent")
                    ]
                )
            ),
            new OA\Response(response: 422, description: "Validation error"),
            new OA\Response(response: 500, description: "Failed to send code")
        ]
    )]
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

    #[OA\Post(
        path: "/verify-otp",
        summary: "Verify OTP code",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "otp"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
                    new OA\Property(property: "otp", type: "string", example: "123456", minLength: 6, maxLength: 6)
                ]
            )
        ),
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Code verified successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Code verified successfully")
                    ]
                )
            ),
            new OA\Response(response: 400, description: "Invalid or expired code"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
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

    #[OA\Post(
        path: "/reset-password",
        summary: "Reset password with OTP",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "otp", "password"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "user@example.com"),
                    new OA\Property(property: "otp", type: "string", example: "123456", minLength: 6, maxLength: 6),
                    new OA\Property(property: "password", type: "string", format: "password", example: "newpassword123", minLength: 8)
                ]
            )
        ),
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Password reset successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Password reset successfully")
                    ]
                )
            ),
            new OA\Response(response: 400, description: "Invalid or expired code"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
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

    #[OA\Post(
        path: "/change-password",
        summary: "Change password (for first login or regular password change)",
        security: [["bearerAuth" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["current_password", "new_password", "new_password_confirmation"],
                properties: [
                    new OA\Property(property: "current_password", type: "string", format: "password", example: "currentpassword123"),
                    new OA\Property(property: "new_password", type: "string", format: "password", example: "newpassword123", minLength: 8),
                    new OA\Property(property: "new_password_confirmation", type: "string", format: "password", example: "newpassword123")
                ]
            )
        ),
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Password changed successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Password changed successfully")
                    ]
                )
            ),
            new OA\Response(response: 400, description: "Current password is incorrect"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->force_password_reset = false;
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    #[OA\Post(
        path: "/set-password",
        summary: "Set password using invite token (for new users)",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email", "token", "password", "password_confirmation"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "newuser@example.com"),
                    new OA\Property(property: "token", type: "string", example: "abc123..."),
                    new OA\Property(property: "password", type: "string", format: "password", example: "newpassword123"),
                    new OA\Property(property: "password_confirmation", type: "string", format: "password", example: "newpassword123")
                ]
            )
        ),
        tags: ["Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Password set successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Password set successfully"),
                        new OA\Property(property: "user", type: "object"),
                        new OA\Property(property: "token", type: "string")
                    ]
                )
            ),
            new OA\Response(response: 400, description: "Invalid or expired token"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function setPasswordFromToken(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)
            ->where('password_reset_token', $request->token)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid email or token'], 400);
        }

        // Check if token has expired
        if ($user->password_reset_token_expires_at && now()->isAfter($user->password_reset_token_expires_at)) {
            return response()->json(['message' => 'Token has expired. Please contact your administrator.'], 400);
        }

        // Update password and clear reset flags
        $user->password = Hash::make($request->password);
        $user->force_password_reset = false;
        $user->password_reset_token = null;
        $user->password_reset_token_expires_at = null;
        $user->save();

        // Create an auth token so they're logged in immediately
        $authToken = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Password set successfully',
            'user' => $user->load('department'),
            'token' => $authToken,
        ]);
    }
}
