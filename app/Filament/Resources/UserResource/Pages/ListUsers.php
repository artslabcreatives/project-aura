<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('syncUsers')
                ->label('Sync Active Users')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->action(function () {
                    $users = \App\Models\User::with('department')->get();
                    $synced = 0;
                    $failed = 0;

                    foreach ($users as $user) {
                        $role = $user->role === 'admin' ? 'admin' : 'learner';
                        $department = $user->department?->name;
                        $status = $user->is_active ? 'active' : 'inactive';

                        try {
                            $response = \Illuminate\Support\Facades\Http::withHeaders([
                                'x-sync-secret' => 'aura_sync_secret_token_abc123',
                            ])->post('http://localhost:3000/auth/sync-user', [
                                'id' => (string) $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                                'department' => $department,
                                'role' => $role,
                                'status' => $status,
                            ]);

                            if ($response->successful()) {
                                $synced++;
                            } else {
                                $failed++;
                            }
                        } catch (\Exception $e) {
                            $failed++;
                        }
                    }

                    \Filament\Notifications\Notification::make()
                        ->title('LMS User Synchronization')
                        ->body("Synchronization complete. Synced: {$synced}, Failed: {$failed}.")
                        ->success()
                        ->send();
                }),
            Actions\CreateAction::make(),
        ];
    }
}
