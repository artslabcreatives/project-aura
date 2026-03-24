<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use Carbon\Carbon;

class MoveTasksToStartStage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:move-to-start-stage';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move tasks from Pending to their start stage when start time arrives';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Set timezone to Sri Lanka
        $now = Carbon::now('Asia/Colombo');
        
        $this->info("=== Task Auto-Move Check ===");
        $this->info("Current Sri Lanka Time: " . $now->format('Y-m-d H:i:s'));
        
        // Find tasks that:
        // 1. Are in Pending stage
        // 2. Have a start_stage_id set
        // 3. Have a start_date that has passed
        $tasks = Task::with(['projectStage', 'startStage'])
            ->whereHas('projectStage', function($query) {
                $query->where('title', 'Pending');
            })
            ->whereNotNull('start_stage_id')
            ->whereNotNull('start_date')
            ->get();

        $this->info("Found " . $tasks->count() . " pending task(s) with start stage set");

        $movedCount = 0;
        
        foreach ($tasks as $task) {
            $rawDate = $task->getRawOriginal('start_date');
            // Remove 'Z' or timezone info if present to treat as local time
            // But usually raw DB string is just Y-m-d H:i:s
            $startTime = Carbon::parse($rawDate, 'Asia/Colombo');
            
            $this->info("---");
            $this->info("Task #{$task->id}: {$task->title}");
            $this->info("  Start Time: " . $startTime->format('Y-m-d H:i:s'));
            $this->info("  Current Time: " . $now->format('Y-m-d H:i:s'));
            
            if ($startTime->lte($now)) {
                // Move the task to its start stage
                $task->project_stage_id = $task->start_stage_id;
                $task->save();
                
                $movedCount++;
                
                $this->info("  ✓ MOVED to stage: {$task->startStage->title}");
            } else {
                $this->info("  ✗ NOT MOVED (start time is in future)");
            }
        }
        
        $this->info("---");
        if ($movedCount > 0) {
            $this->info("Successfully moved {$movedCount} task(s) to their start stages.");
        } else {
            $this->info("No tasks to move at this time.");
        }
        
        return Command::SUCCESS;
    }
}
