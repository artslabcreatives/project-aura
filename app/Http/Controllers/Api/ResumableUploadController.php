<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ResumableUploadService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use OpenApi\Attributes as OA;

class ResumableUploadController extends Controller
{
    #[OA\Post(
        path: "/uploads/tus/{uploadKey}",
        summary: "Resumable file upload (TUS protocol)",
        description: "Handles resumable uploads via the TUS protocol. Supports OPTIONS, POST, HEAD, PATCH, and DELETE methods on /uploads/tus/{uploadKey?}.",
        security: [["bearerAuth" => []]],
        tags: ["Uploads"],
        parameters: [
            new OA\Parameter(name: "uploadKey", in: "path", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(response: 200, description: "TUS response (varies by method)"),
            new OA\Response(response: 201, description: "Upload created"),
            new OA\Response(response: 204, description: "Upload chunk accepted"),
        ]
    )]
    public function handle(ResumableUploadService $resumableUploadService): Response|BinaryFileResponse
    {
        return $resumableUploadService->server()->serve();
    }
}