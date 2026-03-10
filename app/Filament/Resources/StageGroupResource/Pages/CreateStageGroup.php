<?php

namespace App\Filament\Resources\StageGroupResource\Pages;

use App\Filament\Resources\StageGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateStageGroup extends CreateRecord
{
    protected static string $resource = StageGroupResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
