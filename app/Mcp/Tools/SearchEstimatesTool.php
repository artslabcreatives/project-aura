<?php

namespace App\Mcp\Tools;

use App\Models\Estimate;
use Illuminate\Support\Facades\Log;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class SearchEstimatesTool extends Tool
{
    protected string $name = 'search_estimates';

    protected string $description = 'Search for estimates by client name, project name, estimate number, or title. Use this FIRST when processing a PO to find the matching estimate before calling attach_estimate_po. Start with search_by="client_name" and the company that issued the PO. If no results, try search_by="all" with a keyword from the PO line items. Set has_project=false and has_amount=false on the first attempt to get the widest results, then narrow down by comparing the amount field to the PO total.';

    /**
     * @return array<string, mixed>
     */
    public function schema($schema): array
    {
        return [
            'search_query' => $schema->string()
                ->description('Search query text (project name, client name, or estimate number)'),
            'search_by' => $schema->string()
                ->enum(['all', 'project_name', 'client_name', 'estimate_number', 'title'])
                ->description('Field to search by (default: all)'),
            'status' => $schema->string()
                ->enum(['draft', 'sent', 'accepted', 'rejected', 'all'])
                ->description('Filter by estimate status (default: all)'),
            'has_project' => $schema->boolean()
                ->description('Filter estimates that are linked to a project (default: true)'),
            'has_amount' => $schema->boolean()
                ->description('Filter estimates that have valid amounts (default: true)'),
            'limit' => $schema->integer()
                ->description('Maximum number of results to return (default: 10, max: 50)'),
        ];
    }

    public function handle(Request $request): Response
    {
        Log::channel('daily')->info('[MCP Tool] search_estimates called', [
            'arguments' => $request->all(),
        ]);

        $validated = $request->validate([
            'search_query' => 'nullable|string|max:255',
            'search_by' => 'nullable|string|max:255',  // Temporarily allow any string for sanitization
            'status' => 'nullable|string|max:255',      // Temporarily allow any string for sanitization
            'has_project' => 'nullable|boolean',
            'has_amount' => 'nullable|boolean',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        // Sanitize inputs - strip leading "=" characters (common from spreadsheets/forms)
        $searchQuery = isset($validated['search_query']) 
            ? ltrim($validated['search_query'], '=') 
            : null;
        $searchBy = isset($validated['search_by']) 
            ? ltrim($validated['search_by'], '=') 
            : 'all';
        $status = isset($validated['status']) 
            ? ltrim($validated['status'], '=') 
            : 'all';
        
        // Validate sanitized values against allowed enums
        if (!in_array($searchBy, ['all', 'project_name', 'client_name', 'estimate_number', 'title'])) {
            $searchBy = 'all';
        }
        if (!in_array($status, ['draft', 'sent', 'accepted', 'rejected', 'all'])) {
            $status = 'all';
        }
        
        $hasProject = $validated['has_project'] ?? true;
        $hasAmount = $validated['has_amount'] ?? true;
        $limit = $validated['limit'] ?? 10;

        // Normalize search query for fuzzy matching (remove special chars, extra spaces)
        $searchWords = [];
        if ($searchQuery) {
            $normalizedQuery = preg_replace('/[(),.\-\/]/', ' ', $searchQuery);
            $normalizedQuery = preg_replace('/\s+/', ' ', trim($normalizedQuery));
            $searchWords = array_filter(explode(' ', $normalizedQuery), function($word) {
                return strlen($word) >= 2; // Only words with 2+ characters
            });
        }

        $query = Estimate::with(['project', 'client', 'creator']);

        // Apply search filters
        if ($searchQuery) {
            
            $query->where(function ($q) use ($searchQuery, $searchBy, $searchWords) {
                if ($searchBy === 'all' || $searchBy === 'title') {
                    $q->orWhere('title', 'like', "%{$searchQuery}%");
                }
                
                if ($searchBy === 'all' || $searchBy === 'estimate_number') {
                    $q->orWhere('estimate_number', 'like', "%{$searchQuery}%");
                }
                
                if ($searchBy === 'all' || $searchBy === 'project_name') {
                    $q->orWhereHas('project', function ($pq) use ($searchQuery) {
                        $pq->where('name', 'like', "%{$searchQuery}%");
                    });
                }
                
                if ($searchBy === 'all' || $searchBy === 'client_name') {
                    $q->orWhereHas('client', function ($cq) use ($searchQuery, $searchWords) {
                        // First try exact match with original query
                        $cq->where('company_name', 'like', "%{$searchQuery}%");
                        
                        // If we have multiple words, also match if ALL words are present
                        if (count($searchWords) > 1) {
                            $cq->orWhere(function ($wordQuery) use ($searchWords) {
                                foreach ($searchWords as $word) {
                                    $wordQuery->where('company_name', 'like', "%{$word}%");
                                }
                            });
                        }
                    });
                }
            });
        }

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by project link
        if ($hasProject) {
            $query->whereNotNull('project_id');
        }

        // Filter by amount
        if ($hasAmount) {
            $query->where(function ($q) {
                $q->where('total', '>', 0)
                  ->orWhere('amount', '>', 0)
                  ->orWhere('subtotal', '>', 0);
            });
        }

        // Execute query with limit
        $estimates = $query->limit($limit)->get();

        // Format results
        $results = $estimates->map(function ($estimate) {
            $amountValue = $estimate->total ?? $estimate->amount ?? $estimate->subtotal ?? 0;
            
            return [
                'id' => $estimate->id,
                'estimate_number' => $estimate->estimate_number,
                'title' => $estimate->title,
                'description' => $estimate->description,
                'amount' => $amountValue,
                'currency' => $estimate->currency ?? 'USD',
                'status' => $estimate->status,
                'issue_date' => $estimate->issue_date?->format('Y-m-d'),
                'valid_until' => $estimate->valid_until?->format('Y-m-d'),
                'client' => $estimate->client ? [
                    'id' => $estimate->client->id,
                    'name' => $estimate->client->company_name,
                    'company_name' => $estimate->client->company_name,
                ] : null,
                'project' => $estimate->project ? [
                    'id' => $estimate->project->id,
                    'name' => $estimate->project->name,
                    'has_po' => !empty($estimate->project->po_number),
                    'po_number' => $estimate->project->po_number,
                ] : null,
                'created_by' => $estimate->creator ? [
                    'id' => $estimate->creator->id,
                    'name' => $estimate->creator->name,
                ] : null,
                'created_at' => $estimate->created_at->format('Y-m-d H:i:s'),
            ];
        })->values()->toArray();

        // If no results found and searching by client_name, provide all available clients
        $availableClients = null;
        if (count($results) === 0 && $searchQuery && $searchBy === 'client_name') {
            $availableClients = \App\Models\Client::select('id', 'company_name')
                ->orderBy('company_name')
                ->limit(50)
                ->get()
                ->map(function ($client) {
                    return [
                        'id' => $client->id,
                        'company_name' => $client->company_name,
                    ];
                })
                ->toArray();
        }

        $response = [
            'success' => true,
            'count' => count($results),
            'limit' => $limit,
            'search_criteria' => [
                'query' => $searchQuery,
                'search_by' => $searchBy,
                'status' => $status,
                'has_project' => $hasProject,
                'has_amount' => $hasAmount,
            ],
            'results' => $results,
        ];

        // Add available clients to response if no matches found
        if ($availableClients !== null) {
            $filterInfo = [];
            if ($hasProject) $filterInfo[] = 'has_project=true';
            if ($hasAmount) $filterInfo[] = 'has_amount=true';
            if ($status !== 'all') $filterInfo[] = 'status=' . $status;
            
            $filterText = !empty($filterInfo) 
                ? ' with filters (' . implode(', ', $filterInfo) . ')' 
                : '';
            
            $response['message'] = 'No estimates found matching client name "' . $searchQuery . '"' . $filterText . '. Try relaxing the filters (set has_project=false, has_amount=false) or choose from available clients:';
            $response['available_clients'] = $availableClients;
            
            // Also show how many estimates exist for this client without filters
            $totalWithoutFilters = \App\Models\Estimate::whereHas('client', function ($cq) use ($searchQuery, $searchWords) {
                $cq->where('company_name', 'like', "%{$searchQuery}%");
                if (count($searchWords) > 1) {
                    $cq->orWhere(function ($wordQuery) use ($searchWords) {
                        foreach ($searchWords as $word) {
                            $wordQuery->where('company_name', 'like', "%{$word}%");
                        }
                    });
                }
            })->count();
            
            if ($totalWithoutFilters > 0) {
                $response['hint'] = "Found {$totalWithoutFilters} estimate(s) for matching clients, but they don't meet the filter criteria. Try setting has_project=false and has_amount=false.";
            }
        }

        return Response::text(json_encode($response));
    }
}
