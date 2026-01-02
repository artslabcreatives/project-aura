<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\HistoryEntryController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\RevisionHistoryController;
use App\Http\Controllers\Api\StageController;
use App\Http\Controllers\Api\TaskAttachmentController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes (public)
Route::post('/login', [AuthController::class, 'login']);

Route::get('/projects/search/whatsapp', [ProjectController::class, 'searchByWhatsapp']);
Route::get('/projects/{project}/suggested-tasks', [ProjectController::class, 'suggestedTasks']);
Route::post('/projects/{project}/suggested-tasks', [ProjectController::class, 'createSuggestedTasks']);

// Protected API routes (require bearer token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('stages', StageController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('task-attachments', TaskAttachmentController::class);
    Route::apiResource('revision-histories', RevisionHistoryController::class);
    Route::apiResource('history-entries', HistoryEntryController::class);
    Route::apiResource('users', UserController::class);
});
