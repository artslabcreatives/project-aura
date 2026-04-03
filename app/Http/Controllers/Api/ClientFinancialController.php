<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Services\ProfitabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class ClientFinancialController extends Controller
{
    protected ProfitabilityService $profitabilityService;

    public function __construct(ProfitabilityService $profitabilityService)
    {
        $this->profitabilityService = $profitabilityService;
    }

    #[OA\Get(
        path: "/clients/{client}/financial-dashboard",
        summary: "Get client financial dashboard",
        security: [["bearerAuth" => []]],
        tags: ["Client Finance"],
        parameters: [
            new OA\Parameter(
                name: "client",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Client financial dashboard data"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 404, description: "Client not found")
        ]
    )]
    public function getFinancialDashboard(Client $client): JsonResponse
    {
        // Get profitability data
        $profitability = $this->profitabilityService->getClientProfitability($client->id);

        // Get invoice data
        $invoiceData = $this->getInvoiceData($client->id);

        // Get project status breakdown
        $projectStatus = $this->getProjectStatusBreakdown($client->id);

        return response()->json([
            'client_id' => $client->id,
            'client_name' => $client->name,
            'profitability' => $profitability,
            'invoices' => $invoiceData,
            'project_status' => $projectStatus,
        ]);
    }

    #[OA\Get(
        path: "/clients/{client}/invoice-summary",
        summary: "Get client invoice summary",
        security: [["bearerAuth" => []]],
        tags: ["Client Finance"],
        parameters: [
            new OA\Parameter(
                name: "client",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Client invoice summary"),
            new OA\Response(response: 401, description: "Unauthorized")
        ]
    )]
    public function getInvoiceSummary(Client $client): JsonResponse
    {
        $invoiceData = $this->getInvoiceData($client->id);

        return response()->json($invoiceData);
    }

    /**
     * Get invoice aggregation data for a client.
     */
    protected function getInvoiceData(int $clientId): array
    {
        $projects = Project::where('client_id', $clientId)
            ->with('estimate')
            ->get();

        $totalInvoiced = 0;
        $totalPaid = 0;
        $pendingInvoices = [];
        $completedInvoices = [];

        foreach ($projects as $project) {
            if ($project->invoice_number) {
                $invoiceAmount = $project->estimate ? (float) $project->estimate->total : 0;

                // Determine if invoice is paid based on campaign report approval
                // (for Digital Marketing) or physical invoice delivery status
                $isPaid = false;
                if ($project->department?->name === 'Digital Marketing') {
                    $isPaid = $project->isCampaignReportApproved();
                } elseif ($project->is_physical_invoice) {
                    $isPaid = $project->courier_delivery_status === 'delivered';
                } else {
                    // For digital invoices, assume paid if invoice document exists
                    $isPaid = !empty($project->invoice_document);
                }

                $invoiceInfo = [
                    'project_id' => $project->id,
                    'project_name' => $project->name,
                    'invoice_number' => $project->invoice_number,
                    'amount' => $invoiceAmount,
                    'currency' => $project->currency,
                    'is_physical' => $project->is_physical_invoice,
                    'delivery_status' => $project->courier_delivery_status,
                    'is_paid' => $isPaid,
                ];

                $totalInvoiced += $invoiceAmount;

                if ($isPaid) {
                    $totalPaid += $invoiceAmount;
                    $completedInvoices[] = $invoiceInfo;
                } else {
                    $pendingInvoices[] = $invoiceInfo;
                }
            }
        }

        return [
            'total_invoiced' => round($totalInvoiced, 2),
            'total_paid' => round($totalPaid, 2),
            'total_outstanding' => round($totalInvoiced - $totalPaid, 2),
            'pending_count' => count($pendingInvoices),
            'completed_count' => count($completedInvoices),
            'pending_invoices' => $pendingInvoices,
            'completed_invoices' => $completedInvoices,
        ];
    }

    /**
     * Get project status breakdown for a client.
     */
    protected function getProjectStatusBreakdown(int $clientId): array
    {
        $statusCounts = Project::where('client_id', $clientId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($statusCounts);

        return [
            'total_projects' => $total,
            'status_counts' => $statusCounts,
            'status_percentages' => array_map(
                fn($count) => $total > 0 ? round(($count / $total) * 100, 2) : 0,
                $statusCounts
            ),
        ];
    }

    #[OA\Get(
        path: "/financial/aggregation",
        summary: "Get financial aggregation across all clients",
        security: [["bearerAuth" => []]],
        tags: ["Client Finance"],
        responses: [
            new OA\Response(response: 200, description: "Financial aggregation data"),
            new OA\Response(response: 401, description: "Unauthorized"),
            new OA\Response(response: 403, description: "Forbidden - Admin/HR only")
        ]
    )]
    public function getFinancialAggregation(): JsonResponse
    {
        // Only admin and HR can access this
        if (!in_array(auth()->user()->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $clients = Client::with('projects.estimate')->get();

        $aggregation = [
            'total_clients' => $clients->count(),
            'total_revenue' => 0,
            'total_cost' => 0,
            'total_profit' => 0,
            'total_invoiced' => 0,
            'total_outstanding' => 0,
            'clients_breakdown' => [],
        ];

        foreach ($clients as $client) {
            $clientProfit = $this->profitabilityService->getClientProfitability($client->id);
            $clientInvoices = $this->getInvoiceData($client->id);

            $aggregation['total_revenue'] += $clientProfit['total_revenue'];
            $aggregation['total_cost'] += $clientProfit['total_cost'];
            $aggregation['total_profit'] += $clientProfit['total_profit'];
            $aggregation['total_invoiced'] += $clientInvoices['total_invoiced'];
            $aggregation['total_outstanding'] += $clientInvoices['total_outstanding'];

            $aggregation['clients_breakdown'][] = [
                'client_id' => $client->id,
                'client_name' => $client->name,
                'revenue' => $clientProfit['total_revenue'],
                'profit' => $clientProfit['total_profit'],
                'profit_margin' => $clientProfit['profit_margin_percentage'],
                'outstanding_invoices' => $clientInvoices['total_outstanding'],
            ];
        }

        // Sort clients by revenue (descending)
        usort($aggregation['clients_breakdown'], function ($a, $b) {
            return $b['revenue'] <=> $a['revenue'];
        });

        return response()->json($aggregation);
    }
}
