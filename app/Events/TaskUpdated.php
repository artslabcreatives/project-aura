<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $action; // 'create', 'update', 'delete'

    /**
     * Create a new event instance.
     */
    public function __construct($task, $action = 'update')
    {
        $this->task = $task;
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('project.' . $this->task->project_id),
        ];
    }

    /**
     * Keep realtime broadcasts small; consumers use this event as a refetch signal.
     */
    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'task_id' => $this->task->id,
            'project_id' => $this->task->project_id,
            'task' => [
                'id' => $this->task->id,
                'project_id' => $this->task->project_id,
                'user_status' => $this->task->user_status,
                'project_stage_id' => $this->task->project_stage_id,
                'assignee_id' => $this->task->assignee_id,
                'parent_id' => $this->task->parent_id,
                'updated_at' => optional($this->task->updated_at)->toJSON(),
            ],
        ];
    }
}
