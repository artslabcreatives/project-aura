<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Department;
use App\Services\ResumableUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class DocumentController extends Controller
{
    private const APPROVER_ROLES = ['admin', 'hr', 'team-lead'];

    #[OA\Get(
        path: "/documents",
        summary: "List documents grouped by department",
        security: [["bearerAuth" => []]],
        tags: ["Documents"],
        responses: [
            new OA\Response(response: 200, description: "List of documents")
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $status = $request->query('status', 'approved');

        $query = Document::with(['department', 'uploader:id,name'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc');

        // Non-approvers can only see their own pending documents
        if ($status === 'pending' && !in_array($user->role, self::APPROVER_ROLES)) {
            $query->where('uploaded_by', $user->id);
        }

        $documents = $query->get();

        // Group by department
        $grouped = $documents->groupBy(function ($doc) {
            return $doc->department->name ?? 'Uncategorized';
        });

        return response()->json($grouped);
    }

    #[OA\Post(
        path: "/documents",
        summary: "Upload a new document",
        security: [["bearerAuth" => []]],
        tags: ["Documents"],
        responses: [
            new OA\Response(response: 201, description: "Document uploaded")
        ]
    )]
    public function store(Request $request, ResumableUploadService $resumableUploadService): JsonResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'file' => 'nullable|file|max:20480', // 20MB
            'upload_key' => 'nullable|string',
        ]);

        $filePath = null;
        $url = null;

        if (!empty($validated['upload_key'])) {
            $finalized = $resumableUploadService->finalizeToDisk(
                $validated['upload_key'],
                'documents',
                $validated['name']
            );
            $filePath = $finalized['path'];
            $url = $finalized['url'];
        } elseif ($request->hasFile('file')) {
            $path = $request->file('file')->store('documents', 's3');
            $filePath = $path;
            $url = Storage::disk('s3')->url($path);
        } else {
            return response()->json(['message' => 'No file uploaded.'], 422);
        }

        // Auto-approve for privileged roles
        $status = in_array($user->role, self::APPROVER_ROLES) ? 'approved' : 'pending';

        $document = Document::create([
            'name' => $validated['name'],
            'file_path' => $filePath,
            'url' => $url,
            'department_id' => $validated['department_id'],
            'uploaded_by' => $user->id,
            'status' => $status,
        ]);

        return response()->json($document->load(['department', 'uploader:id,name']), 201);
    }

    #[OA\Post(
        path: "/documents/{document}/approve",
        summary: "Approve a document",
        security: [["bearerAuth" => []]],
        tags: ["Documents"],
        responses: [
            new OA\Response(response: 200, description: "Document approved")
        ]
    )]
    public function approve(Document $document): JsonResponse
    {
        $user = auth()->user();

        // Check permissions: Admin, HR, or Team Lead of the SAME department
        if (!in_array($user->role, ['admin', 'hr'])) {
            if ($user->role !== 'team-lead' || $user->department_id !== $document->department_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $document->update([
            'status' => 'approved',
            'rejection_reason' => null
        ]);

        return response()->json($document);
    }

    #[OA\Post(
        path: "/documents/{document}/reject",
        summary: "Reject a document",
        security: [["bearerAuth" => []]],
        tags: ["Documents"],
        responses: [
            new OA\Response(response: 200, description: "Document rejected")
        ]
    )]
    public function reject(Request $request, Document $document): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'hr'])) {
            if ($user->role !== 'team-lead' || $user->department_id !== $document->department_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $document->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason']
        ]);

        return response()->json($document);
    }

    #[OA\Delete(
        path: "/documents/{document}",
        summary: "Delete a document",
        security: [["bearerAuth" => []]],
        tags: ["Documents"],
        responses: [
            new OA\Response(response: 204, description: "Document deleted")
        ]
    )]
    public function destroy(Document $document): JsonResponse
    {
        $user = auth()->user();

        // Only owner or privileged roles can delete
        if ($document->uploaded_by !== $user->id && !in_array($user->role, self::APPROVER_ROLES)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($document->file_path) {
            Storage::disk('s3')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(null, 204);
    }

    #[OA\Get(
        path: "/documents/{document}/download",
        summary: "Get a secure download URL for a document",
        security: [["bearerAuth" => []]],
        tags: ["Documents"],
        responses: [
            new OA\Response(response: 200, description: "Secure URL returned")
        ]
    )]
    public function download(Document $document, Request $request): JsonResponse
    {
        if (!$document->file_path) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        $mode = $request->query('mode', 'download');
        $options = [];

        if ($mode === 'download') {
            $options['ResponseContentDisposition'] = 'attachment; filename="' . $document->name . '"';
        } else {
            $options['ResponseContentDisposition'] = 'inline';
        }

        $url = Storage::disk('s3')->temporaryUrl(
            $document->file_path,
            now()->addMinutes(30),
            $options
        );

        return response()->json([
            'url' => $url,
            'name' => $document->name
        ]);
    }
}
