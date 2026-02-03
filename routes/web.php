<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

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

// Regular app routes (with session authentication)
// Serve the React app for all routes (React Router handles client-side routing)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
