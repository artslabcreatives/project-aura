<?php

namespace App\Filament\Resources\ProjectGroupResource\Pages;

use App\Filament\Resources\ProjectGroupResource;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditProjectGroup extends EditRecord
{
    protected static string $resource = ProjectGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make()
                ->before(function (Actions\DeleteAction $action, $record) {
                    if ($record->projects()->exists()) {
                        Notification::make()
                            ->danger()
                            ->title('Cannot delete project group')
                            ->body('There are projects assigned to this group. Please unassign them first.')
                            ->send();
                        
                        $action->cancel();
                    }
                    
                    if ($record->children()->exists()) {
                        Notification::make()
                            ->danger()
                            ->title('Cannot delete project group')
                            ->body('It has sub-groups. Please delete or move them first.')
                            ->send();
                        
                        $action->cancel();
                    }
                }),
        ];
    }
}
