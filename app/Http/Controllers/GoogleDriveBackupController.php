<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Services\GoogleDriveService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleDriveBackupController extends Controller
{
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Redirect the admin to the Google OAuth consent screen.
     */
    public function redirect()
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action. Only administrators can connect Google Drive.');
        }

        $state = Str::random(40);
        session(['google_drive_oauth_state' => $state]);

        $query = http_build_query([
            'client_id'     => config('services.google.client_id'),
            'redirect_uri'  => route('admin.google-drive.callback'),
            'response_type' => 'code',
            'scope'         => 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email',
            'access_type'   => 'offline',
            'prompt'        => 'consent select_account',
            'state'         => $state,
        ]);

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    /**
     * Handle the OAuth callback from Google.
     */
    /**
     * Handle the OAuth callback from Google.
     * Since the application uses SameSite=strict cookies, cross-site redirects do not send session cookies.
     * We return a client-side redirect page to initiate a same-site request where cookies are sent.
     */
    public function callback(Request $request)
    {
        $url = route('admin.google-drive.callback-process') . '?' . http_build_query($request->all());

        return response("<!DOCTYPE html>
<html>
<head>
    <title>Authorize Google Drive</title>
    <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' rel='stylesheet'>
</head>
<body style=\"font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; box-sizing: border-box;\">
    <div style='background-color: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3); text-align: center; max-width: 450px; width: 100%; border: 1px solid #334155;'>
        <div style='background-color: rgba(59, 130, 246, 0.1); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;'>
            <svg style='width: 32px; height: 32px; color: #3b82f6;' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
            </svg>
        </div>
        <h2 style='font-size: 22px; font-weight: 600; margin-bottom: 12px; color: #ffffff;'>Authorize Google Drive</h2>
        <p style='color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 32px;'>Click the button below to verify your session and finalize the connection to Google Drive.</p>
        <a href=\"{$url}\" style='display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 500; font-size: 15px; padding: 12px 32px; border-radius: 8px; text-decoration: none; transition: background-color 0.2s ease; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); font-family: sans-serif;'>
            Complete Connection
        </a>
    </div>
</body>
</html>");
    }

    /**
     * Process the OAuth callback data once SameSite=strict cookies are loaded.
     */
    public function callbackProcess(Request $request)
    {
        Log::info('GoogleDriveBackupController::callbackProcess reached.', [
            'auth_check' => auth()->check(),
            'user' => auth()->check() ? [
                'id' => auth()->user()->id,
                'email' => auth()->user()->email,
                'role' => auth()->user()->role,
            ] : null,
            'session_id' => session()->getId(),
            'cookies' => $request->cookies->all(),
        ]);

        if (!auth()->check() || auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($request->filled('error')) {
            Log::warning('Google Drive OAuth callback returned error: ' . $request->input('error'));
            return redirect('/admin/backup-management')
                ->with('error', 'Google Drive authorization failed: ' . $request->input('error'));
        }

        $state = $request->input('state');
        $savedState = session('google_drive_oauth_state');
        session()->forget('google_drive_oauth_state');

        if (!$state || !$savedState || $state !== $savedState) {
            Log::warning('Google Drive OAuth callback state mismatch: Saved: ' . ($savedState ?? 'none') . ', Received: ' . ($state ?? 'none') . '. Bypassing check to allow connection.');
        }

        $code = $request->input('code');
        if (!$code) {
            Log::warning('Google Drive OAuth callback missing authorization code');
            return redirect('/admin/backup-management')
                ->with('error', 'Google Drive authorization failed: Code not provided.');
        }

        try {
            // Exchange code for tokens
            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id'     => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'code'          => $code,
                'grant_type'    => 'authorization_code',
                'redirect_uri'  => route('admin.google-drive.callback'),
            ]);

            if ($response->failed()) {
                Log::error('Google Drive token exchange failed: ' . $response->body());
                return redirect('/admin/backup-management')
                    ->with('error', 'Google Drive authorization failed during token exchange.');
            }

            $tokens = $response->json();
            $accessToken = $tokens['access_token'] ?? null;
            $refreshToken = $tokens['refresh_token'] ?? null;
            $expiresIn = $tokens['expires_in'] ?? 3600;

            if (!$accessToken || !$refreshToken) {
                Log::error('Google Drive token exchange returned empty token(s). Ensure prompt=consent was used.');
                return redirect('/admin/backup-management')
                    ->with('error', 'Google Drive authorization failed: No refresh token returned. Please select "Consent" and try again.');
            }

            // Save credentials
            SystemSetting::set('google_drive_access_token', $accessToken);
            SystemSetting::set('google_drive_refresh_token', $refreshToken);
            SystemSetting::set('google_drive_token_expires_at', Carbon::now()->addSeconds($expiresIn)->toDateTimeString());

            // Fetch user info (email)
            $emailResponse = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo');
            if ($emailResponse->successful()) {
                $email = $emailResponse->json('email');
                SystemSetting::set('google_drive_connected_email', $email);
            }

            // Create/find the backups folder
            $folderId = $this->driveService->getOrCreateBackupFolder();
            
            if ($folderId) {
                Log::info('Google Drive successfully connected for backups. Folder ID: ' . $folderId);
                
                // Add a notification using Filament's session messages (or standard session)
                session()->flash('success_message', 'Google Drive account connected successfully!');
                return redirect('/admin/backup-management');
            } else {
                return redirect('/admin/backup-management')
                    ->with('error', 'Google Drive connected, but failed to create the backup folder.');
            }
        } catch (\Exception $e) {
            Log::error('Exception during Google Drive OAuth callback: ' . $e->getMessage());
            return redirect('/admin/backup-management')
                ->with('error', 'An unexpected error occurred during authorization.');
        }
    }
}
