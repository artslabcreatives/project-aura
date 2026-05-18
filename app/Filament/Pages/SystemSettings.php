<?php

namespace App\Filament\Pages;

use App\Models\SystemSetting;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Filament\Notifications\Notification;

class SystemSettings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'System Settings';

    protected static ?string $title = 'System Settings';

    protected static string $view = 'filament.pages.system-settings';

    protected static ?int $navigationSort = 10;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'enable_chatbot' => SystemSetting::isEnabled('enable_chatbot', true),
            'enable_ai_scenarios' => SystemSetting::isEnabled('enable_ai_scenarios', true),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('AI & Chatbot Configuration')
                    ->description('Enable or disable artificial intelligence features globally in the application.')
                    ->schema([
                        Toggle::make('enable_chatbot')
                            ->label('Enable AI Chatbot / Work Agent')
                            ->helperText('If enabled, all users can use the chatbot floating popup helper to perform tasks, upload files, and chat.')
                            ->default(true),
                        Toggle::make('enable_ai_scenarios')
                            ->label('Enable AI Scenarios')
                            ->helperText('If enabled, users can view and use the AI scenario planning dashboard.')
                            ->default(true),
                    ])
                    ->columns(1),
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save settings')
                ->submit('save')
                ->keyBindings(['mod+s']),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();

        SystemSetting::set('enable_chatbot', $data['enable_chatbot'] ? 'true' : 'false');
        SystemSetting::set('enable_ai_scenarios', $data['enable_ai_scenarios'] ? 'true' : 'false');

        Notification::make()
            ->title('Settings saved successfully.')
            ->success()
            ->send();
    }
}
