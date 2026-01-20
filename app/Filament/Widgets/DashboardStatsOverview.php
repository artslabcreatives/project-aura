<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class DashboardStatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Projects', \App\Models\Project::count())
                ->description('Total Projects')
                ->descriptionIcon('heroicon-m-briefcase')
                ->color('primary')
                ->url(\App\Filament\Resources\ProjectResource::getUrl()),

            Stat::make('Stages', \App\Models\Stage::count())
                ->description('Total Stages')
                ->descriptionIcon('heroicon-m-queue-list')
                ->color('success')
                ->url(\App\Filament\Resources\StageResource::getUrl()),

            Stat::make('Tasks', \App\Models\Task::count())
                ->description('Active: ' . \App\Models\Task::where('user_status', '!=', 'complete')->count())
                ->descriptionIcon('heroicon-m-clipboard-document-check')
                ->color('warning')
                ->url(\App\Filament\Resources\TaskResource::getUrl()),

            Stat::make('Users', \App\Models\User::count())
                ->description('Total Users')
                ->descriptionIcon('heroicon-m-users')
                ->color('info')
                ->url(\App\Filament\Resources\UserResource::getUrl()),

            Stat::make('Feedback', \App\Models\Feedback::count())
                ->description('Pending: ' . \App\Models\Feedback::where('status', 'pending')->count())
                ->descriptionIcon('heroicon-m-bug-ant')
                ->color('danger')
                ->url(\App\Filament\Resources\FeedbackResource::getUrl()),
        ];
    }
}
