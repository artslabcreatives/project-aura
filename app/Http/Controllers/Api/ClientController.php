<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class ClientController extends Controller
{
    /**
     * Check if the user has permission to manage clients.
     */
    protected function checkPermission()
    {
        abort_if(!in_array(auth()->user()->role, ['admin', 'hr']), 403, 'Unauthorized. Only Admin and HR can manage clients.');
    }

    #[OA\Get(
        path: "/clients",
        summary: "List all clients",
        tags: ["Clients"],
        parameters: [
            new OA\Parameter(name: "search", in: "query", required: false, schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of clients")
        ]
    )]
    public function index(Request $request)
    {
        $this->checkPermission();

        $query = Client::withCount('contacts');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('company_name')->get());
    }

    public function store(Request $request)
    {
        $this->checkPermission();

        $validated = $request->validate([
            'company_name' => 'required|string|max:255|unique:clients,company_name',
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show(Client $client)
    {
        $this->checkPermission();
        return response()->json($client->load('contacts'));
    }

    public function update(Request $request, Client $client)
    {
        $this->checkPermission();

        $validated = $request->validate([
            'company_name' => 'required|string|max:255|unique:clients,company_name,' . $client->id,
            'industry' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        $this->checkPermission();
        
        $client->delete();

        return response()->noContent();
    }

    /**
     * Store a new contact for the client.
     */
    public function storeContact(Request $request, Client $client)
    {
        $this->checkPermission();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        if ($request->is_primary) {
            $client->contacts()->update(['is_primary' => false]);
        }

        $contact = $client->contacts()->create($validated);

        return response()->json($contact, 201);
    }

    /**
     * Update a contact.
     */
    public function updateContact(Request $request, Client $client, ClientContact $contact)
    {
        $this->checkPermission();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        if ($request->is_primary) {
            $client->contacts()->where('id', '!=', $contact->id)->update(['is_primary' => false]);
        }

        $contact->update($validated);

        return response()->json($contact);
    }

    /**
     * Remove a contact.
     */
    public function destroyContact(Client $client, ClientContact $contact)
    {
        $this->checkPermission();

        if ($contact->client_id !== $client->id) {
            return response()->json(['message' => 'Contact does not belong to this client.'], 404);
        }

        $contact->delete();

        return response()->noContent();
    }
}
