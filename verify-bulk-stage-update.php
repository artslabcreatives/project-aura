<?php

use App\Models\Task;
use App\Models\User;
use App\Models\Stage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\TaskController;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Helper to login/mock user
function mockUser($role) {
    $user = User::where('role', $role)->first();
    if (!$user) {
        $user = User::factory()->create(['role' => $role]);
    }
    auth()->login($user);
    return $user;
}

DB::beginTransaction();

try {
    // 1. Create a project and some stages
    $admin = mockUser('admin');
    
    // Find or create stages
    $stages = Stage::limit(2)->get();
    if ($stages->count() < 2) {
        echo "Need at least 2 stages in the database.\n";
        exit;
    }
    $stage1 = $stages[0];
    $stage2 = $stages[1];
    
    // Create 2 tasks in stage 1
    $task1 = Task::create([
        'title' => 'Test Task 1',
        'project_stage_id' => $stage1->id,
        'project_id' => $stage1->project_id,
        'user_status' => 'pending',
    ]);
    $task2 = Task::create([
        'title' => 'Test Task 2',
        'project_stage_id' => $stage1->id,
        'project_id' => $stage1->project_id,
        'user_status' => 'pending',
    ]);
    
    echo "Initial setup complete. Tasks created in stage: {$stage1->title} (ID: {$stage1->id}), Project ID: {$stage1->project_id}\n";
    
    // 2. Try bulk updating stage as ADMIN
    $request = Request::create('/api/tasks/bulk-update', 'POST', [
        'task_ids' => [$task1->id, $task2->id],
        'project_stage_id' => $stage2->id,
    ]);
    $request->setUserResolver(fn() => $admin);
    
    $controller = app(TaskController::class);
    $response = $controller->bulkUpdate($request);
    
    echo "Admin Request Response Status: " . $response->getStatusCode() . "\n";
    echo "Admin Request Response Content: " . $response->getContent() . "\n";
    
    // Verify tasks are now in stage 2
    $task1->refresh();
    $task2->refresh();
    echo "Task 1 New Stage: {$task1->project_stage_id} (Expected: {$stage2->id})\n";
    echo "Task 2 New Stage: {$task2->project_stage_id} (Expected: {$stage2->id})\n";
    
    // 3. Try bulk updating stage as TEAM-LEAD (should fail stage update with 403)
    $teamLead = mockUser('team-lead');
    $requestTL = Request::create('/api/tasks/bulk-update', 'POST', [
        'task_ids' => [$task1->id, $task2->id],
        'project_stage_id' => $stage1->id, // try moving back
    ]);
    $requestTL->setUserResolver(fn() => $teamLead);
    
    $responseTL = $controller->bulkUpdate($requestTL);
    echo "Team Lead Stage Request Response Status: " . $responseTL->getStatusCode() . "\n";
    echo "Team Lead Stage Request Response Content: " . $responseTL->getContent() . "\n";
    
    // Try bulk updating assignee as TEAM-LEAD (should be allowed with 200)
    $requestTL2 = Request::create('/api/tasks/bulk-update', 'POST', [
        'task_ids' => [$task1->id, $task2->id],
        'assignee_id' => $teamLead->id,
    ]);
    $requestTL2->setUserResolver(fn() => $teamLead);
    
    $responseTL2 = $controller->bulkUpdate($requestTL2);
    echo "Team Lead Assignee Request Response Status: " . $responseTL2->getStatusCode() . "\n";
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
} finally {
    DB::rollBack();
}
