<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ResumableUploadService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ResumableUploadController extends Controller
{
    public function handle(ResumableUploadService $resumableUploadService): Response|BinaryFileResponse
    {
        return $resumableUploadService->server()->serve();
    }
}