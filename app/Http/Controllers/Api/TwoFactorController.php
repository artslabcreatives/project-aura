<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Laravel\Fortify\RecoveryCode;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use OpenApi\Attributes as OA;

class TwoFactorController extends Controller
{
    #[OA\Post(
        path: "/two-factor/enable",
        summary: "Enable two-factor authentication",
        description: "Generates a TOTP secret and QR code SVG for the authenticated user",
        security: [["bearerAuth" => []]],
        tags: ["Two-Factor Authentication"],
        responses: [
            new OA\Response(
                response: 200,
                description: "TOTP secret and QR code",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "secret", type: "string"),
                    new OA\Property(property: "qr_code_url", type: "string", description: "SVG QR code"),
                ])
            ),
            new OA\Response(response: 409, description: "2FA already enabled"),
        ]
    )]
    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasEnabledTwoFactorAuthentication()) {
            return response()->json(['message' => 'Two-factor authentication is already enabled.'], 409);
        }

        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        
        // Temporarily store the secret until confirmed
        $user->forceFill([
            'two_factor_secret' => $secret, // Encrypted by model cast
            'two_factor_recovery_codes' => null, // Reset recovery codes if re-enabling
            'two_factor_confirmed_at' => null,
        ])->save();

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $qrCodeSvg,
        ]);
    }

    #[OA\Post(
        path: "/two-factor/confirm",
        summary: "Confirm two-factor authentication",
        description: "Verifies the TOTP code and activates 2FA, returning recovery codes",
        security: [["bearerAuth" => []]],
        tags: ["Two-Factor Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["code"],
                properties: [new OA\Property(property: "code", type: "string", example: "123456")]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "2FA activated with recovery codes"),
            new OA\Response(response: 422, description: "Invalid code"),
        ]
    )]
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!$user->two_factor_secret) {
            return response()->json(['message' => 'Two-factor authentication has not been enabled.'], 400);
        }

        $google2fa = new Google2FA();
        $secret = $user->two_factor_secret; // Decrypted by model cast

        if (!$google2fa->verifyKey($secret, $request->code)) {
            return response()->json(['message' => 'The provided two-factor authentication code was invalid.'], 422);
        }

        $recoveryCodes = Collection::times(8, function () {
            return Str::random(10) . '-' . Str::random(10);
        })->all();

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => $recoveryCodes, // Encrypted by model cast
        ])->save();

        return response()->json([
            'message' => 'Two-factor authentication confirmed and enabled.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    #[OA\Post(
        path: "/two-factor/disable",
        summary: "Disable two-factor authentication",
        description: "Disables 2FA after verifying the user's current password",
        security: [["bearerAuth" => []]],
        tags: ["Two-Factor Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["password"],
                properties: [new OA\Property(property: "password", type: "string", format: "password")]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "2FA disabled"),
            new OA\Response(response: 422, description: "Wrong password"),
        ]
    )]
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return response()->json(['message' => 'Two-factor authentication disabled.']);
    }

    #[OA\Post(
        path: "/two-factor/recovery-codes",
        summary: "Get recovery codes",
        description: "Returns the current 2FA recovery codes after password verification",
        security: [["bearerAuth" => []]],
        tags: ["Two-Factor Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["password"],
                properties: [new OA\Property(property: "password", type: "string", format: "password")]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Recovery codes array"),
            new OA\Response(response: 422, description: "Wrong password"),
        ]
    )]
    public function recoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
           'password' => ['required', 'current_password'], // Optional: require password to view codes
        ]);

        $user = $request->user();

        if (!$user->two_factor_recovery_codes) {
            return response()->json(['recovery_codes' => []]);
        }

        return response()->json([
            'recovery_codes' => $user->two_factor_recovery_codes, // Decrypted by model cast
        ]);
    }

    #[OA\Post(
        path: "/two-factor/recovery-codes/regenerate",
        summary: "Regenerate recovery codes",
        description: "Generates new 2FA recovery codes after password verification (2FA must be enabled)",
        security: [["bearerAuth" => []]],
        tags: ["Two-Factor Authentication"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["password"],
                properties: [new OA\Property(property: "password", type: "string", format: "password")]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "New recovery codes"),
            new OA\Response(response: 400, description: "2FA not enabled"),
        ]
    )]
    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        if (!$user->hasEnabledTwoFactorAuthentication()) {
             return response()->json(['message' => 'Two-factor authentication is not enabled.'], 400);
        }

        $recoveryCodes = Collection::times(8, function () {
            return Str::random(10) . '-' . Str::random(10);
        })->all();

        $user->forceFill([
            'two_factor_recovery_codes' => $recoveryCodes, // Encrypted by model cast
        ])->save();

        return response()->json([
            'message' => 'Recovery codes regenerated.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }
}
