<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectListUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $action; // 'created', 'deleted', 'archived', 'restored'
    public int $projectId;
    public string $projectName;

    public function __construct(int $projectId, string $projectName, string $action = 'created')
    {
        $this->projectId = $projectId;
        $this->projectName = $projectName;
        $this->action = $action;
    }

    /**
     * Broadcast on a global private channel so all authenticated users
     * can listen for new/removed projects without knowing the project ID upfront.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('projects'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ProjectListUpdated';
    }
}
