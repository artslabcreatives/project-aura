<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\TaskAttachment;
use App\Models\Project;
use App\Models\User;
use App\Models\ProjectExpense;

use App\Observers\TaskObserver;
use App\Observers\TaskCommentObserver;
use App\Observers\TaskAttachmentObserver;
use App\Observers\ProjectObserver;
use App\Observers\UserObserver;
use App\Observers\ProjectExpenseObserver;
use App\Observers\CacheInvalidationObserver;
use App\Models\Stage;
use App\Models\ProjectPurchaseOrder;

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
        if (class_exists(\BinaryTorch\LaRecipe\Facades\LaRecipe::class)) {
            \BinaryTorch\LaRecipe\Facades\LaRecipe::style('app.css', public_path('vendor/binarytorch/larecipe/assets/css/app.css'));
            \BinaryTorch\LaRecipe\Facades\LaRecipe::style('font-awesome.css', public_path('vendor/binarytorch/larecipe/assets/css/font-awesome.css'));
            \BinaryTorch\LaRecipe\Facades\LaRecipe::style('font-awesome-v4-shims.css', public_path('vendor/binarytorch/larecipe/assets/css/font-awesome-v4-shims.css'));
            \BinaryTorch\LaRecipe\Facades\LaRecipe::script('app.js', public_path('vendor/binarytorch/larecipe/assets/js/app.js'));
        }

        // Register the Task observer for automatic stage progression
        Task::observe(TaskObserver::class);
        TaskComment::observe(TaskCommentObserver::class);
        TaskAttachment::observe(TaskAttachmentObserver::class);
        Project::observe(ProjectObserver::class);
        User::observe(UserObserver::class);
        ProjectExpense::observe(ProjectExpenseObserver::class);
        
        // Cache Invalidation
        Project::observe(CacheInvalidationObserver::class);
        Task::observe(CacheInvalidationObserver::class);
        Stage::observe(CacheInvalidationObserver::class);
        ProjectPurchaseOrder::observe(CacheInvalidationObserver::class);
    }
}
