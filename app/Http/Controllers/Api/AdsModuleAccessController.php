<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdsModuleAccess;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdsModuleAccessController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $accesses = AdsModuleAccess::with('addedBy:id,name,email')->get();
        return response()->json($accesses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:ads_module_accesses,email',
        ]);

        $access = AdsModuleAccess::create([
            'email' => $validated['email'],
            'added_by' => $request->user()->id,
        ]);

        return response()->json($access->load('addedBy:id,name,email'), 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AdsModuleAccess $adsModuleAccess): JsonResponse
    {
        $adsModuleAccess->delete();
        return response()->json(null, 204);
    }

    /**
     * Check if the authenticated user has access.
     */
    public function checkAccess(Request $request): JsonResponse
    {
        $hasAccess = AdsModuleAccess::where('email', $request->user()->email)->exists();
        return response()->json(['has_access' => $hasAccess]);
    }
}
