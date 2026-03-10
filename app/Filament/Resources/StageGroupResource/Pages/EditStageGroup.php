<?php

namespace App\Filament\Resources\StageGroupResource\Pages;

use App\Filament\Resources\StageGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditStageGroup extends EditRecord
{
    protected static string $resource = StageGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
