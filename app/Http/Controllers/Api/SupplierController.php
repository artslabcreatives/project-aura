<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function destroy(Supplier $supplier): JsonResponse
    {
        $this->checkPermission();
        $supplier->delete();
        return response()->json(null, 204);
    }
}
