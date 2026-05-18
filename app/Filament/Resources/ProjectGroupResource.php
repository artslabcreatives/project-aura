<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectGroupResource\Pages;
use App\Filament\Resources\ProjectGroupResource\RelationManagers;
use App\Models\ProjectGroup;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ProjectGroupResource extends Resource
{
    protected static ?string $model = ProjectGroup::class;

    protected static ?string $navigationIcon = 'heroicon-o-folder-open';

    protected static ?string $navigationGroup = 'Project Management';

    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Project Group Details')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('department_id')
                            ->relationship('department', 'name')
                            ->required()
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('parent_id')
                            ->relationship('parent', 'name')
                            ->label('Parent Group')
                            ->searchable()
                            ->preload()
                            ->default(null),
                    ])->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('department.name')
                    ->sortable()
                    ->searchable()
                    ->label('Department'),
                Tables\Columns\TextColumn::make('parent.name')
                    ->sortable()
                    ->searchable()
                    ->label('Parent Group'),
                Tables\Columns\TextColumn::make('projects_count')
                    ->counts('projects')
                    ->label('Projects'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('department')
                    ->relationship('department', 'name'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function (Tables\Actions\DeleteAction $action, $record) {
                        if ($record->projects()->exists()) {
                            \Filament\Notifications\Notification::make()
                                ->danger()
                                ->title('Cannot delete project group')
                                ->body('There are projects assigned to this group. Please unassign them first.')
                                ->send();
                            
                            $action->cancel();
                        }
                        
                        if ($record->children()->exists()) {
                            \Filament\Notifications\Notification::make()
                                ->danger()
                                ->title('Cannot delete project group')
                                ->body('It has sub-groups. Please delete or move them first.')
                                ->send();
                            
                            $action->cancel();
                        }
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->action(function (Tables\Actions\DeleteBulkAction $action, \Illuminate\Database\Eloquent\Collection $records) {
                            $deletedCount = 0;
                            $failedCount = 0;
                            
                            foreach ($records as $record) {
                                if ($record->projects()->exists() || $record->children()->exists()) {
                                    $failedCount++;
                                    continue;
                                }
                                $record->delete();
                                $deletedCount++;
                            }

                            if ($failedCount > 0) {
                                \Filament\Notifications\Notification::make()
                                    ->warning()
                                    ->title('Some groups could not be deleted')
                                    ->body("{$failedCount} group(s) have projects or sub-groups and were skipped.")
                                    ->send();
                            }

                            if ($deletedCount > 0) {
                                \Filament\Notifications\Notification::make()
                                    ->success()
                                    ->title('Groups deleted')
                                    ->body("{$deletedCount} group(s) deleted successfully.")
                                    ->send();
                            }
                            
                            $action->success();
                        }),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
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
            'index' => Pages\ListProjectGroups::route('/'),
            'create' => Pages\CreateProjectGroup::route('/create'),
            'edit' => Pages\EditProjectGroup::route('/{record}/edit'),
        ];
    }
}
