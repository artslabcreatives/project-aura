<?php

namespace App\Filament\Resources\StageGroupResource\Pages;

use App\Filament\Resources\StageGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListStageGroups extends ListRecords
{
    protected static string $resource = StageGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
