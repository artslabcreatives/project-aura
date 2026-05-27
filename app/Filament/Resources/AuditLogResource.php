<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AuditLogResource\Pages;
use App\Models\AuditLog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class AuditLogResource extends Resource
{
    protected static ?string $model = AuditLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationLabel = 'Audit Logs';

    protected static ?int $navigationSort = 12;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Audit Details')
                    ->schema([
                        Forms\Components\DateTimePicker::make('created_at')
                            ->label('Timestamp')
                            ->disabled(),
                        Forms\Components\TextInput::make('user.name')
                            ->label('Performed By')
                            ->default('System')
                            ->disabled(),
                        Forms\Components\TextInput::make('action')
                            ->formatStateUsing(fn (?string $state): ?string => $state ? ucwords(str_replace('_', ' ', $state)) : null)
                            ->disabled(),
                        Forms\Components\TextInput::make('entity_type')
                            ->label('Entity Type')
                            ->disabled(),
                        Forms\Components\TextInput::make('entity_id')
                            ->label('Entity ID')
                            ->disabled(),
                        Forms\Components\TextInput::make('field_changed')
                            ->label('AI Action / Field Changed')
                            ->disabled(),
                    ])->columns(2),

                Forms\Components\Section::make('Value / Payload')
                    ->schema([
                        Forms\Components\Textarea::make('old_value')
                            ->label('Old Value')
                            ->placeholder('None (Created)')
                            ->rows(4)
                            ->disabled(),
                        Forms\Components\Textarea::make('new_value')
                            ->label('New Value / Payload')
                            ->placeholder('None (Deleted)')
                            ->rows(6)
                            ->disabled(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Timestamp')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->default('System'),
                Tables\Columns\TextColumn::make('action')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'ai_action'              => 'danger',
                        'create_system_setting'  => 'success',
                        'update_system_setting'  => 'primary',
                        'reminder_override'      => 'warning',
                        default                  => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => ucwords(str_replace('_', ' ', $state)))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('entity_type')
                    ->label('Entity')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('field_changed')
                    ->label('AI Action / Field')
                    ->searchable()
                    ->sortable()
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('entity_id')
                    ->label('Entity ID')
                    ->sortable()
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('new_value')
                    ->label('Payload / New Value')
                    ->limit(40)
                    ->placeholder('—')
                    ->tooltip(fn ($record) => $record?->new_value),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('action')
                    ->label('Action Type')
                    ->options([
                        'ai_action'             => '🤖 AI Action',
                        'create_system_setting' => '➕ Create System Setting',
                        'update_system_setting' => '✏️ Update System Setting',
                        'reminder_override'     => '⏰ Reminder Override',
                    ]),
                Tables\Filters\Filter::make('ai_only')
                    ->label('AI Actions Only')
                    ->query(fn (Builder $query) => $query->where('action', 'ai_action'))
                    ->toggle(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                // No bulk actions — audit trails must be immutable
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAuditLogs::route('/'),
            'view'  => Pages\ViewAuditLog::route('/{record}'),
        ];
    }
}
