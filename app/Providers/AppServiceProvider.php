<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskAttachment;
use App\Models\Project;

use App\Observers\TaskObserver;
use App\Observers\TaskCommentObserver;
use App\Observers\TaskAttachmentObserver;
use App\Observers\ProjectObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the Task observer for automatic stage progression
        Task::observe(TaskObserver::class);
        TaskComment::observe(TaskCommentObserver::class);
        TaskAttachment::observe(TaskAttachmentObserver::class);
        Project::observe(ProjectObserver::class);
    }
}
