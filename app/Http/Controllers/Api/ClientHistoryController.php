<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientHistory;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ClientHistoryController extends Controller
{
    #[OA\Get(
        path: "/clients/history",
        summary: "Get client history",
        description: "Returns the last 100 client change history entries (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Clients"],
        responses: [
            new OA\Response(response: 200, description: "Client history list"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
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
