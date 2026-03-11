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

class TwoFactorController extends Controller
{
    /**
     * Enable two-factor authentication for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Confirm two-factor authentication for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Disable two-factor authentication for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Get the recovery codes for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Regenerate the recovery codes for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
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
