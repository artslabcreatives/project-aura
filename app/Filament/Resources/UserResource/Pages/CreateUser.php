<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        // Generate a password reset token
        $resetToken = Str::random(64);
        
        // Set force password reset and token
        $data['force_password_reset'] = true;
        $data['password_reset_token'] = $resetToken;
        $data['password_reset_token_expires_at'] = now()->addDays(7);
        
        // Create the user
        $user = static::getModel()::create($data);
        
        // Send invitation webhook
        $this->sendInviteWebhook($user, $resetToken);
        
        return $user;
    }
    
    protected function sendInviteWebhook(Model $user, string $token): void
    {
        try {
            $webhookUrl = env('USER_INVITE_WEBHOOK_URL');
            $webhookSecret = env('BUG_REPORT_WEBHOOK_SECRET'); // Same secret as bug report
            
            if (!$webhookUrl) {
                Log::warning('USER_INVITE_WEBHOOK_URL not configured');
                return;
            }
            
            // Build the password reset link
            $resetLink = config('app.url') . '/set-password?token=' . $token . '&email=' . urlencode($user->email);
            
            $payload = [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'reset_link' => $resetLink,
                'role' => $user->role,
                'department' => $user->department?->name ?? 'Not assigned',
                'invited_at' => now()->toDateTimeString(),
            ];
            
            // Use same header authentication as bug report webhook
            Http::withHeaders([
                'system-admin' => $webhookSecret,
            ])->post($webhookUrl, $payload);
            
            Log::info('User invite webhook sent', ['user_id' => $user->id, 'email' => $user->email]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send user invite webhook', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null,
            ]);
        }
    }
}
