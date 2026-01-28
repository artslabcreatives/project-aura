<?php

namespace App\Filament\Resources;

use App\Filament\Resources\FeedbackResource\Pages;
use App\Filament\Resources\FeedbackResource\RelationManagers;
use App\Models\Feedback;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class FeedbackResource extends Resource
{
    protected static ?string $model = Feedback::class;

    protected static ?string $navigationIcon = 'heroicon-o-bug-ant';
    protected static ?string $navigationLabel = 'Bug Reports';
    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Report Details')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->label('Reported By')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('type')
                            ->options([
                                'bug_report' => 'Bug Report',
                                'feature_request' => 'Feature Request',
                                'general' => 'General Feedback',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'reviewed' => 'Reviewed',
                                'resolved' => 'Resolved',
                                'wont_fix' => 'Won\'t Fix',
                            ])
                            ->required()
                            ->native(false),
                        Forms\Components\Textarea::make('description')
                            ->required()
                            ->columnSpanFull()
                            ->rows(5),
                    ])->columns(3),
                
                Forms\Components\Section::make('Attachments & Meta')
                    ->schema([
                        Forms\Components\FileUpload::make('screenshot_path')
                            ->image()
                            ->disk('public')
                            ->directory('feedback-screenshots')
                            ->visibility('public')
                            ->label('Screenshot (Legacy)')
                            ->openable()
                            ->downloadable(),
                        Forms\Components\FileUpload::make('images')
                            ->image()
                            ->disk('public')
                            ->multiple()
                            ->directory('feedback-screenshots')
                            ->visibility('public')
                            ->label('Additional Images')
                            ->openable()
                            ->downloadable()
                            ->reorderable()
                            ->appendFiles(),
                        Forms\Components\KeyValue::make('device_info')
                            ->label('Device Metadata')
                            ->columnSpanFull(),
                    ])->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Reported By')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'bug_report' => 'danger',
                        'feature_request' => 'info',
                        'general' => 'gray',
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'reviewed' => 'info',
                        'resolved' => 'success',
                        'wont_fix' => 'gray',
                    }),
                Tables\Columns\TextColumn::make('description')
                    ->limit(50)
                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
                        return $column->getState();
                    }),
                Tables\Columns\ImageColumn::make('screenshot_path')
                    ->label('Screen')
                    ->disk('public')
                    ->openUrlInNewTab(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'reviewed' => 'Reviewed',
                        'resolved' => 'Resolved',
                        'wont_fix' => 'Won\'t Fix',
                    ]),
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'bug_report' => 'Bug Report',
                        'feature_request' => 'Feature Request',
                        'general' => 'General Feedback',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('resolve')
                    ->label('Resolve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->action(fn (Feedback $record) => $record->update(['status' => 'resolved']))
                    ->visible(fn (Feedback $record) => $record->status !== 'resolved'),
                Tables\Actions\Action::make('wont_fix')
                    ->label("Won't Fix")
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->action(fn (Feedback $record) => $record->update(['status' => 'wont_fix']))
                    ->visible(fn (Feedback $record) => $record->status !== 'wont_fix'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
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
            'index' => Pages\ListFeedback::route('/'),
            'create' => Pages\CreateFeedback::route('/create'),
            'edit' => Pages\EditFeedback::route('/{record}/edit'),
        ];
    }
}
