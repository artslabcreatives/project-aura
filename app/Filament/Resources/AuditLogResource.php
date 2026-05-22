<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AuditLogResource\Pages;
use App\Filament\Resources\AuditLogResource\RelationManagers;
use App\Models\AuditLog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

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
                            ->formatStateUsing(fn (?string $state): ?string => $state ? class_basename($state) : null)
                            ->disabled(),
                        Forms\Components\TextInput::make('entity_id')
                            ->label('Entity ID')
                            ->disabled(),
                        Forms\Components\TextInput::make('field_changed')
                            ->label('Field Changed')
                            ->disabled(),
                    ])->columns(2),

                Forms\Components\Section::make('Value Comparison')
                    ->schema([
                        Forms\Components\Textarea::make('old_value')
                            ->label('Old Value')
                            ->placeholder('None (Created)')
                            ->rows(4)
                            ->disabled(),
                        Forms\Components\Textarea::make('new_value')
                            ->label('New Value')
                            ->placeholder('None (Deleted)')
                            ->rows(4)
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
                        'create_system_setting' => 'success',
                        'update_system_setting' => 'primary',
                        'reminder_override' => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => ucwords(str_replace('_', ' ', $state)))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('entity_type')
                    ->label('Entity')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('field_changed')
                    ->label('Field')
                    ->searchable()
                    ->sortable()
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('old_value')
                    ->label('Old Value')
                    ->limit(25)
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('new_value')
                    ->label('New Value')
                    ->limit(25)
                    ->placeholder('—'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                // No bulk actions to ensure audit trails cannot be deleted
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
            'index' => Pages\ListAuditLogs::route('/'),
            'view' => Pages\ViewAuditLog::route('/{record}'),
        ];
    }
}
