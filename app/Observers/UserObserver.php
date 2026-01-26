<?php

namespace App\Observers;

use App\Models\User;
use App\Services\MattermostService;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    protected MattermostService $mattermostService;

    public function __construct(MattermostService $mattermostService)
    {
        $this->mattermostService = $mattermostService;
    }

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Sync user with Mattermost when created
        try {
            $this->mattermostService->syncUser($user);
        } catch (\Exception $e) {
            Log::error('Failed to sync new user with Mattermost', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Sync user updates with Mattermost
        if ($user->isDirty(['name', 'email'])) {
            try {
                $this->mattermostService->syncUser($user);
            } catch (\Exception $e) {
                Log::error('Failed to sync updated user with Mattermost', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        // Note: You may want to deactivate the user in Mattermost
        // rather than deleting them to preserve message history
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
