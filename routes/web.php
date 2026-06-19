<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\SSOController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// OIDC well-known discovery endpoints
Route::get('/.well-known/openid-configuration', [SSOController::class, 'discovery']);
Route::get('/.well-known/jwks.json', [SSOController::class, 'jwks']);

// Mattermost embedded views (with API key authentication)
// Usage: /mattermost/tasks?mattermost_token=YOUR_API_KEY&mattermost_user_id=123
// Or with channel redirect: /mattermost?mattermost_token=YOUR_API_KEY&mattermost_channel_id=abc123&mattermost_user_id=456
Route::middleware('mattermost.api-key')->prefix('mattermost')->group(function () {
    Route::get('/{any?}', function (Request $request) {
        return view('app', [
            'mattermost_token' => $request->attributes->get('mattermost_token') ?? session('mattermost_bearer_token'),
            'mattermost_user_id' => $request->attributes->get('mattermost_user_id') ?? session('mattermost_user_id'),
        ]);
    })->where('any', '^(?!api).*$');
});

// Google Drive Backup OAuth callback landing route (stateless to preserve session cookie from overwrite)
Route::get('/admin/google-drive/callback', [\App\Http\Controllers\GoogleDriveBackupController::class, 'callback'])->name('admin.google-drive.callback');

// Google Drive Backup OAuth routes (Admin only check is inside controller)
Route::middleware(['web'])->group(function () {
    Route::get('/admin/google-drive/auth', [\App\Http\Controllers\GoogleDriveBackupController::class, 'redirect'])->name('admin.google-drive.auth');
    Route::get('/admin/google-drive/callback-process', [\App\Http\Controllers\GoogleDriveBackupController::class, 'callbackProcess'])->name('admin.google-drive.callback-process');
    
    // Serve invoice template PDFs for the backend visual mapper
    Route::get('/admin/invoice-templates/{invoiceTemplate}/pdf', function (\App\Models\InvoiceTemplate $invoiceTemplate) {
        if (!auth()->check()) {
            abort(403, 'Unauthorized');
        }
        $path = $invoiceTemplate->absolute_pdf_path;
        if (!file_exists($path)) {
            abort(404, 'PDF file not found');
        }
        return response()->file($path, [
            'Content-Type' => 'application/pdf',
        ]);
    })->name('admin.invoice-templates.pdf');

    // Sync users to LMS
    Route::post('/admin/sync-lms-users', function () {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $users = \App\Models\User::with('department')->get();
        $synced = 0;
        $failed = 0;

        foreach ($users as $user) {
            $role = $user->role === 'admin' ? 'admin' : 'learner';
            $department = $user->department?->name;
            $status = $user->is_active ? 'active' : 'inactive';

            try {
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'x-sync-secret' => 'aura_sync_secret_token_abc123',
                ])->post('http://localhost:3000/auth/sync-user', [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $department,
                    'role' => $role,
                    'status' => $status,
                ]);

                if ($response->successful()) {
                    $synced++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
            }
        }

        \Filament\Notifications\Notification::make()
            ->title('LMS User Synchronization')
            ->body("Synchronization complete. Synced: {$synced}, Failed: {$failed}.")
            ->success()
            ->send();

        return back();
    })->name('admin.sync-lms-users');

    // SSO auto-authorize redirect for LMS (Filament admin button)
    Route::get('/sso/auto-authorize-lms', function () {
        if (!auth()->check()) {
            return redirect('/admin/login');
        }

        $client = \App\Models\OAuthClient::where('client_id', 'artslab_lms_sso')
            ->where('is_active', true)
            ->first();

        if (!$client) {
            return redirect('https://lms.artslabcreatives.com/');
        }

        $redirectUri = 'https://lms.artslabcreatives.com/auth/callback';

        if (!$client->isRedirectUriAllowed($redirectUri)) {
            return redirect('https://lms.artslabcreatives.com/');
        }

        $code = \Illuminate\Support\Str::random(64);

        \App\Models\OAuthAuthorizationCode::create([
            'code'                  => $code,
            'user_id'               => auth()->id(),
            'client_id'             => $client->id,
            'scopes'                => ['openid', 'profile', 'email'],
            'redirect_uri'          => $redirectUri,
            'code_challenge'        => null,
            'code_challenge_method' => null,
            'expires_at'            => now()->addSeconds(300),
        ]);

        return redirect($redirectUri . '?code=' . $code);
    })->name('sso.auto-authorize-lms');
});

// Regular app routes (with session authentication)
// Serve the React app for all routes (React Router handles client-side routing)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!(api|vendor)(/|$)).*$');
