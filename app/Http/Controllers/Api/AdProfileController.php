<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdProfileController extends Controller
{
    /**
     * Display a listing of the user's ad profiles.
     */
    public function index()
    {
        $profiles = AdProfile::with('connections')
            ->where('user_id', Auth::id())
            ->get();
            
        return response()->json($profiles);
    }

    /**
     * Store a newly created ad profile in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
        ]);

        $profile = AdProfile::create([
            'user_id' => Auth::id(),
            'client_name' => $validated['client_name'],
        ]);

        return response()->json($profile->load('connections'), 201);
    }

    /**
     * Display the specified ad profile.
     */
    public function show(AdProfile $adProfile)
    {
        if ($adProfile->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this profile.');
        }
        
        return response()->json($adProfile->load('connections'));
    }

    /**
     * Update the specified ad profile in storage.
     */
    public function update(Request $request, AdProfile $adProfile)
    {
        if ($adProfile->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this profile.');
        }

        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
        ]);

        $adProfile->update($validated);

        return response()->json($adProfile->load('connections'));
    }

    /**
     * Remove the specified ad profile from storage.
     */
    public function destroy(AdProfile $adProfile)
    {
        if ($adProfile->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this profile.');
        }

        $adProfile->delete();

        return response()->json(null, 204);
    }
}
