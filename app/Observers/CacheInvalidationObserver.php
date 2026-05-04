<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class CacheInvalidationObserver
{
    public function created($model): void
    {
        $this->invalidate($model);
    }

    public function updated($model): void
    {
        $this->invalidate($model);
    }

    public function deleted($model): void
    {
        $this->invalidate($model);
    }

    public function restored($model): void
    {
        $this->invalidate($model);
    }

    public function forceDeleted($model): void
    {
        $this->invalidate($model);
    }

    protected function invalidate($model): void
    {
        $className = class_basename($model);
        
        if ($className === 'Project' || $className === 'Stage') {
            // Use increment to ensure the version always changes, even in the same second
            if (!Cache::has('projects_version')) {
                Cache::forever('projects_version', 1);
            } else {
                Cache::increment('projects_version');
            }
        }
        
        if ($className === 'Task') {
            if (!Cache::has('tasks_version')) {
                Cache::forever('tasks_version', 1);
            } else {
                Cache::increment('tasks_version');
            }
            
            // Tasks change project data (e.g. task counts), so invalidate projects too
            if (!Cache::has('projects_version')) {
                Cache::forever('projects_version', 1);
            } else {
                Cache::increment('projects_version');
            }
        }
    }
}
