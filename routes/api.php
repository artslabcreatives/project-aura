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
use App\Http\Controllers\Api\Search\SearchController;
use App\Http\Controllers\Api\Search\SearchIndexController;
use App\Http\Controllers\MattermostAuthController;
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
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('projects/{project}/suggested-tasks', [ProjectController::class, 'suggestedTasks']);
Route::post('projects/{project}/suggested-tasks', [ProjectController::class, 'createSuggestedTasks']);
Route::get('projects/search/email', [ProjectController::class, 'searchByEmail']);
Route::get('projects/search/whatsapp', [ProjectController::class, 'searchByWhatsapp']);
Route::get('users/search/exist', [UserController::class, 'exist']);

// Protected API routes (require bearer token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('stages', StageController::class);
    Route::apiResource('tasks', TaskController::class);
    Route::post('/tasks/{task}/complete', [TaskController::class, 'complete']);
    Route::post('/tasks/{task}/start', [TaskController::class, 'start']);
    Route::get('/task-attachments/{taskAttachment}/download', [TaskAttachmentController::class, 'download']);
    Route::apiResource('task-attachments', TaskAttachmentController::class);
    Route::apiResource('revision-histories', RevisionHistoryController::class);
    Route::apiResource('history-entries', HistoryEntryController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('project-groups', \App\Http\Controllers\Api\ProjectGroupController::class);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
    Route::apiResource('feedback', \App\Http\Controllers\Api\FeedbackController::class);
    Route::apiResource('tags', \App\Http\Controllers\Api\TagController::class);

    // Search endpoints
    Route::get('/search/all-with-relations', [SearchController::class, 'searchAllWithRelations']);
    Route::get('/search/all', [SearchController::class, 'searchAll']);
    Route::get('/search/tasks', [SearchController::class, 'searchTasks']);
    Route::get('/search/tags', [SearchController::class, 'searchTags']);
    Route::get('/search/projects', [SearchController::class, 'searchProjects']);
    Route::get('/search/task-comments', [SearchController::class, 'searchTaskComments']);
    Route::get('/search/project-groups', [SearchController::class, 'searchProjectGroups']);
    Route::get('/search/stages', [SearchController::class, 'searchStages']);
    Route::get('/search/task-attachments', [SearchController::class, 'searchTaskAttachments']);
    Route::get('/search/history-entries', [SearchController::class, 'searchHistoryEntries']);
    Route::get('/search/departments', [SearchController::class, 'searchDepartments']);
    Route::get('/search/feedback', [SearchController::class, 'searchFeedback']);
    Route::get('/search/suggested-tasks', [SearchController::class, 'searchSuggestedTasks']);
    Route::get('/search/revision-histories', [SearchController::class, 'searchRevisionHistories']);

    // Search index trigger endpoints
    Route::post('/search/index/tasks', [SearchIndexController::class, 'indexTasks']);
    Route::post('/search/index/tags', [SearchIndexController::class, 'indexTags']);
    Route::post('/search/index/projects', [SearchIndexController::class, 'indexProjects']);
    Route::post('/search/index/task-comments', [SearchIndexController::class, 'indexTaskComments']);
    Route::post('/search/index/project-groups', [SearchIndexController::class, 'indexProjectGroups']);
    Route::post('/search/index/stages', [SearchIndexController::class, 'indexStages']);
    Route::post('/search/index/task-attachments', [SearchIndexController::class, 'indexTaskAttachments']);
    Route::post('/search/index/history-entries', [SearchIndexController::class, 'indexHistoryEntries']);
    Route::post('/search/index/departments', [SearchIndexController::class, 'indexDepartments']);
    Route::post('/search/index/feedback', [SearchIndexController::class, 'indexFeedback']);
    Route::post('/search/index/suggested-tasks', [SearchIndexController::class, 'indexSuggestedTasks']);
    Route::post('/search/index/revision-histories', [SearchIndexController::class, 'indexRevisionHistories']);

    // Mattermost magic link authentication
    Route::get('/mattermost/magic-link', [MattermostAuthController::class, 'getMagicLink']);
    Route::get('/mattermost/redirect', [MattermostAuthController::class, 'redirect']);
});
