<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientHistory;
use Illuminate\Http\Request;

class ClientHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        abort_if(!in_array(auth()->user()->role, ['admin', 'hr']), 403);

        $history = ClientHistory::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($history);
    }
}
