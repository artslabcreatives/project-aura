<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StageResource\Pages;
use App\Filament\Resources\StageResource\RelationManagers;
use App\Models\Stage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class StageResource extends Resource
{
    protected static ?string $model = Stage::class;

    protected static ?string $navigationIcon = 'heroicon-o-view-columns';

    protected static ?string $navigationGroup = 'Project Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Stage Details')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('color')
                            ->default('bg-gray-500')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('order')
                            ->numeric()
                            ->default(0),
                        Forms\Components\Select::make('type')
                            ->options([
                                'user' => 'User',
                                'project' => 'Project',
                            ])
                            ->default('project')
                            ->required(),
                        Forms\Components\Select::make('project_id')
                            ->relationship('project', 'name')
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('stage_group_id')
                            ->relationship('stageGroup', 'name')
                            ->searchable()
                            ->preload()
                            ->label('Stage Group'),
                        Forms\Components\Toggle::make('is_review_stage')
                            ->default(false),
                    ])->columns(2),
                Forms\Components\Section::make('Responsible Users')
                    ->schema([
                        Forms\Components\Select::make('main_responsible_id')
                            ->relationship('mainResponsible', 'name')
                            ->searchable()
                            ->preload()
                            ->label('Main Responsible'),
                        Forms\Components\Select::make('backup_responsible_id_1')
                            ->relationship('backupResponsible1', 'name')
                            ->searchable()
                            ->preload()
                            ->label('First Backup'),
                        Forms\Components\Select::make('backup_responsible_id_2')
                            ->relationship('backupResponsible2', 'name')
                            ->searchable()
                            ->preload()
                            ->label('Second Backup'),
                    ])->columns(3),
                Forms\Components\Section::make('Stage Linking')
                    ->schema([
                        Forms\Components\Select::make('linked_review_stage_id')
                            ->relationship('linkedReviewStage', 'title')
                            ->searchable()
                            ->preload()
                            ->label('Linked Review Stage'),
                        Forms\Components\Select::make('approved_target_stage_id')
                            ->relationship('approvedTargetStage', 'title')
                            ->searchable()
                            ->preload()
                            ->label('Approved Target Stage'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('project.name')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('stageGroup.name')
                    ->label('Stage Group')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'user' => 'info',
                        'project' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('order')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_review_stage')
                    ->boolean(),
                Tables\Columns\TextColumn::make('mainResponsible.name')
                    ->label('Main Responsible'),
                Tables\Columns\TextColumn::make('tasks_count')
                    ->counts('tasks')
                    ->label('Tasks'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('project')
                    ->relationship('project', 'name'),
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'user' => 'User',
                        'project' => 'Project',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('order');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStages::route('/'),
            'create' => Pages\CreateStage::route('/create'),
            'edit' => Pages\EditStage::route('/{record}/edit'),
        ];
    }
}
