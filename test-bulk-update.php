<?php

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Find 2 tasks in the same stage
$tasks = Task::limit(2)->get();
if ($tasks->count() < 2) {
    echo "Not enough tasks to test\n";
    exit;
}

$taskIds = $tasks->pluck('id')->toArray();
$originalAssignees = $tasks->pluck('assignee_id', 'id')->toArray();

echo "Original Assignees:\n";
print_r($originalAssignees);

// Find a user to assign to
$user = User::where('is_active', true)->first();
echo "Assigning to User ID: {$user->id} ({$user->name})\n";

// Mock the bulkUpdate logic
DB::beginTransaction();
try {
    $updates = ['assignee_id' => $user->id];
    $updatedCount = 0;
    
    $tasksToUpdate = Task::whereIn('id', $taskIds)->get();
    foreach ($tasksToUpdate as $task) {
        echo "Updating Task ID: {$task->id}\n";
        $task->fill($updates);
        $assigneeChanged = $task->isDirty('assignee_id');
        echo "Assignee Changed? " . ($assigneeChanged ? "Yes" : "No") . "\n";
        
        if ($assigneeChanged && $task->assignee_id) {
            $task->assignedUsers()->sync([$task->assignee_id]);
        }
        $task->save();
        $updatedCount++;
    }
    
    echo "Updated Count: $updatedCount\n";
    
    // Verify
    $verifyTasks = Task::whereIn('id', $taskIds)->get();
    foreach ($verifyTasks as $t) {
        echo "Task ID: {$t->id}, Assignee ID: {$t->assignee_id}\n";
        $assignedUserCount = $t->assignedUsers()->count();
        echo "Assigned Users Count: $assignedUserCount\n";
    }
    
} finally {
    DB::rollBack();
}
