<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TaskResource\Pages;
use App\Filament\Resources\TaskResource\RelationManagers;
use App\Models\Task;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class TaskResource extends Resource
{
    protected static ?string $model = Task::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationGroup = 'Project Management';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Task Details')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Textarea::make('description')
                            ->rows(3),
                        Forms\Components\Select::make('project_id')
                            ->relationship('project', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->live()
                            ->afterStateUpdated(fn (Forms\Set $set) => $set('project_stage_id', null)),
                        Forms\Components\Select::make('assignee_id')
                            ->relationship('assignee', 'name')
                            ->searchable()
                            ->preload(),
                    ])->columns(2),
                Forms\Components\Section::make('Status & Priority')
                    ->schema([
                        Forms\Components\Select::make('user_status')
                            ->options([
                                'pending' => 'Pending',
                                'in-progress' => 'In Progress',
                                'complete' => 'Complete',
                            ])
                            ->default('pending')
                            ->required(),
                        Forms\Components\Select::make('priority')
                            ->options([
                                'low' => 'Low',
                                'medium' => 'Medium',
                                'high' => 'High',
                            ])
                            ->default('medium')
                            ->required(),
                        Forms\Components\Select::make('project_stage_id')
                            ->relationship(
                                name: 'projectStage',
                                titleAttribute: 'title',
                                modifyQueryUsing: fn (Builder $query, Forms\Get $get) => $query->where('project_id', $get('project_id'))
                            )
                            ->searchable()
                            ->preload(),
                        Forms\Components\Toggle::make('is_in_specific_stage')
                            ->default(false),
                    ])->columns(2),
                Forms\Components\Section::make('Dates')
                    ->schema([
                        Forms\Components\DateTimePicker::make('start_date'),
                        Forms\Components\DatePicker::make('due_date'),
                        Forms\Components\DateTimePicker::make('completed_at')
                            ->disabled(),
                    ])->columns(3),
                Forms\Components\Section::make('Additional Information')
                    ->schema([
                        Forms\Components\TagsInput::make('tags')
                            ->placeholder('Add tags'),
                        Forms\Components\Textarea::make('revision_comment')
                            ->rows(2),
                    ]),
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
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('project.name')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('assignee.name')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('user_status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'in-progress' => 'info',
                        'complete' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('priority')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'low' => 'gray',
                        'medium' => 'warning',
                        'high' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('projectStage.title')
                    ->label('Stage'),
                Tables\Columns\TextColumn::make('due_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('project')
                    ->relationship('project', 'name'),
                Tables\Filters\SelectFilter::make('assignee')
                    ->relationship('assignee', 'name'),
                Tables\Filters\SelectFilter::make('user_status')
                    ->options([
                        'pending' => 'Pending',
                        'in-progress' => 'In Progress',
                        'complete' => 'Complete',
                    ]),
                Tables\Filters\SelectFilter::make('priority')
                    ->options([
                        'low' => 'Low',
                        'medium' => 'Medium',
                        'high' => 'High',
                    ]),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export_filtered_csv')
                    ->label('Export to CSV')
                    ->icon('heroicon-o-document-arrow-down')
                    ->action(function ($livewire) {
                        $records = $livewire->getFilteredTableQuery()
                            ->with(['project', 'assignee', 'projectStage'])
                            ->get();

                        return response()->streamDownload(function () use ($records) {
                            $handle = fopen('php://output', 'w');
                            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM for Excel UTF-8 support

                            fputcsv($handle, [
                                'ID',
                                'Title',
                                'Description',
                                'Project',
                                'Assignee',
                                'User Status',
                                'Priority',
                                'Stage',
                                'Due Date',
                                'Start Date',
                                'Completed At',
                                'Estimated Hours',
                                'Actual Hours Worked',
                                'Task Cost',
                                'Created At',
                            ]);

                            foreach ($records as $record) {
                                fputcsv($handle, [
                                    $record->id,
                                    $record->title,
                                    $record->description,
                                    $record->project?->name,
                                    $record->assignee?->name,
                                    $record->user_status,
                                    $record->priority,
                                    $record->projectStage?->title,
                                    $record->due_date?->toDateTimeString(),
                                    $record->start_date?->toDateTimeString(),
                                    $record->completed_at?->toDateTimeString(),
                                    $record->estimated_hours,
                                    $record->actual_hours_worked,
                                    $record->task_cost,
                                    $record->created_at?->toDateTimeString(),
                                ]);
                            }

                            fclose($handle);
                        }, 'tasks_export_' . now()->format('Y-m-d_H-i-s') . '.csv');
                    })
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('export_selected_csv')
                        ->label('Export Selected to CSV')
                        ->icon('heroicon-o-document-arrow-down')
                        ->action(function (\Illuminate\Support\Collection $records) {
                            return response()->streamDownload(function () use ($records) {
                                $handle = fopen('php://output', 'w');
                                fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM for Excel UTF-8 support

                                fputcsv($handle, [
                                    'ID',
                                    'Title',
                                    'Description',
                                    'Project',
                                    'Assignee',
                                    'User Status',
                                    'Priority',
                                    'Stage',
                                    'Due Date',
                                    'Start Date',
                                    'Completed At',
                                    'Estimated Hours',
                                    'Actual Hours Worked',
                                    'Task Cost',
                                    'Created At',
                                ]);

                                foreach ($records as $record) {
                                    fputcsv($handle, [
                                        $record->id,
                                        $record->title,
                                        $record->description,
                                        $record->project?->name,
                                        $record->assignee?->name,
                                        $record->user_status,
                                        $record->priority,
                                        $record->projectStage?->title,
                                        $record->due_date?->toDateTimeString(),
                                        $record->start_date?->toDateTimeString(),
                                        $record->completed_at?->toDateTimeString(),
                                        $record->estimated_hours,
                                        $record->actual_hours_worked,
                                        $record->task_cost,
                                        $record->created_at?->toDateTimeString(),
                                    ]);
                                }

                                fclose($handle);
                            }, 'tasks_export_selected_' . now()->format('Y-m-d_H-i-s') . '.csv');
                        }),
                ]),
            ]);
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
            'index' => Pages\ListTasks::route('/'),
            'create' => Pages\CreateTask::route('/create'),
            'edit' => Pages\EditTask::route('/{record}/edit'),
        ];
    }
}
