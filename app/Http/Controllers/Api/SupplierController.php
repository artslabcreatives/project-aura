<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class SupplierController extends Controller
{
    protected function checkPermission(): void
    {
        abort_if(
            !in_array(auth()->user()->role, ['admin', 'hr']),
            403,
            'Only Admin and HR can manage suppliers.'
        );
    }

    #[OA\Get(
        path: "/suppliers",
        summary: "List suppliers",
        description: "Returns paginated list of suppliers with optional search filter (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Suppliers"],
        parameters: [
            new OA\Parameter(name: "search", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "per_page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: "Paginated supplier list"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $this->checkPermission();

        $query = Supplier::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $query->orderBy('company_name');

        $perPage = max(1, min(100, (int) ($request->per_page ?? 15)));
        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
            ],
        ]);
    }

    #[OA\Delete(
        path: "/suppliers/{supplier}",
        summary: "Delete supplier",
        description: "Deletes a supplier (admin/hr only)",
        security: [["bearerAuth" => []]],
        tags: ["Suppliers"],
        parameters: [
            new OA\Parameter(name: "supplier", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Supplier deleted"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function destroy(Supplier $supplier): JsonResponse
    {
        $this->checkPermission();
        $supplier->delete();
        return response()->json(null, 204);
    }
}
