<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OAuthClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class OAuthClientController extends Controller
{
    #[OA\Get(
        path: "/oauth/clients",
        summary: "List OAuth clients",
        description: "Returns all OAuth clients (admin only)",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        responses: [new OA\Response(response: 200, description: "OAuth clients list")]
    )]
    public function index(): JsonResponse
    {
        $clients = OAuthClient::with('createdBy:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => $this->formatClient($c, false));

        return response()->json($clients);
    }

    #[OA\Post(
        path: "/oauth/clients",
        summary: "Create OAuth client",
        description: "Creates a new OAuth 2.0 client application. Returns client_secret once on creation (admin only).",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["name", "redirect_uris"],
                properties: [
                    new OA\Property(property: "name", type: "string"),
                    new OA\Property(property: "redirect_uris", type: "array", items: new OA\Items(type: "string", format: "uri")),
                    new OA\Property(property: "allowed_scopes", type: "array", items: new OA\Items(type: "string", enum: ["openid", "profile", "email"])),
                    new OA\Property(property: "is_confidential", type: "boolean", default: true),
                    new OA\Property(property: "description", type: "string"),
                    new OA\Property(property: "logo_url", type: "string", format: "uri"),
                    new OA\Property(property: "homepage_url", type: "string", format: "uri"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Client created with secret"),
            new OA\Response(response: 403, description: "Forbidden"),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'redirect_uris'    => 'required|array|min:1',
            'redirect_uris.*'  => 'required|url',
            'allowed_scopes'   => 'nullable|array',
            'allowed_scopes.*' => 'string|in:openid,profile,email',
            'is_confidential'  => 'boolean',
            'description'      => 'nullable|string|max:1000',
            'logo_url'         => 'nullable|url',
            'homepage_url'     => 'nullable|url',
        ]);

        $isConfidential = $data['is_confidential'] ?? true;
        $rawSecret = $isConfidential ? Str::random(48) : null;

        $client = OAuthClient::create([
            'name'            => $data['name'],
            'client_id'       => 'aurai_' . Str::random(24),
            'client_secret'   => $rawSecret, // encrypted at rest via cast
            'redirect_uris'   => $data['redirect_uris'],
            'allowed_scopes'  => $data['allowed_scopes'] ?? null,
            'is_active'       => true,
            'is_confidential' => $isConfidential,
            'description'     => $data['description'] ?? null,
            'logo_url'        => $data['logo_url'] ?? null,
            'homepage_url'    => $data['homepage_url'] ?? null,
            'created_by'      => $request->user()->id,
        ]);

        // Return the secret only once on creation
        return response()->json(array_merge(
            $this->formatClient($client, false),
            ['client_secret' => $rawSecret]
        ), 201);
    }

    #[OA\Get(
        path: "/oauth/clients/{oauthClient}",
        summary: "Get OAuth client",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        parameters: [new OA\Parameter(name: "oauthClient", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "OAuth client details")]
    )]
    public function show(OAuthClient $oauthClient): JsonResponse
    {
        return response()->json($this->formatClient($oauthClient->load('createdBy:id,name,email'), false));
    }

    #[OA\Put(
        path: "/oauth/clients/{oauthClient}",
        summary: "Update OAuth client",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        parameters: [new OA\Parameter(name: "oauthClient", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(properties: [
                new OA\Property(property: "name", type: "string"),
                new OA\Property(property: "redirect_uris", type: "array", items: new OA\Items(type: "string")),
                new OA\Property(property: "is_active", type: "boolean"),
            ])
        ),
        responses: [new OA\Response(response: 200, description: "Updated client")]
    )]
    public function update(Request $request, OAuthClient $oauthClient): JsonResponse
    {
        $data = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'redirect_uris'    => 'sometimes|array|min:1',
            'redirect_uris.*'  => 'required|url',
            'allowed_scopes'   => 'nullable|array',
            'allowed_scopes.*' => 'string|in:openid,profile,email',
            'is_active'        => 'sometimes|boolean',
            'description'      => 'nullable|string|max:1000',
            'logo_url'         => 'nullable|url',
            'homepage_url'     => 'nullable|url',
        ]);

        $oauthClient->update($data);

        return response()->json($this->formatClient($oauthClient->fresh(), false));
    }

    #[OA\Delete(
        path: "/oauth/clients/{oauthClient}",
        summary: "Delete OAuth client",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        parameters: [new OA\Parameter(name: "oauthClient", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Client deleted")]
    )]
    public function destroy(OAuthClient $oauthClient): JsonResponse
    {
        $oauthClient->delete();
        return response()->json(['message' => 'Client deleted.']);
    }

    #[OA\Post(
        path: "/oauth/clients/{oauthClient}/regenerate-secret",
        summary: "Regenerate OAuth client secret",
        description: "Generates a new client secret and revokes all existing tokens (admin only, confidential clients only)",
        security: [["bearerAuth" => []]],
        tags: ["SSO / OAuth"],
        parameters: [new OA\Parameter(name: "oauthClient", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [
            new OA\Response(response: 200, description: "New client secret"),
            new OA\Response(response: 422, description: "Public client has no secret"),
        ]
    )]
    public function regenerateSecret(OAuthClient $oauthClient): JsonResponse
    {
        if (!$oauthClient->is_confidential) {
            return response()->json(['error' => 'Public clients do not have a secret.'], 422);
        }

        $rawSecret = Str::random(48);
        $oauthClient->update(['client_secret' => $rawSecret]);

        // Revoke all existing tokens for this client for security
        $oauthClient->accessTokens()->update(['revoked' => true]);

        return response()->json([
            'message'       => 'Secret regenerated. All existing tokens have been revoked.',
            'client_secret' => $rawSecret,
        ]);
    }

    private function formatClient(OAuthClient $client, bool $includeSecret): array
    {
        return [
            'id'              => $client->id,
            'name'            => $client->name,
            'client_id'       => $client->client_id,
            'redirect_uris'   => $client->redirect_uris,
            'allowed_scopes'  => $client->allowed_scopes,
            'is_active'       => $client->is_active,
            'is_confidential' => $client->is_confidential,
            'description'     => $client->description,
            'logo_url'        => $client->logo_url,
            'homepage_url'    => $client->homepage_url,
            'created_by'      => $client->createdBy?->only(['id', 'name', 'email']),
            'created_at'      => $client->created_at,
        ];
    }
}
