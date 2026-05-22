<?php

namespace App\Filament\Pages;

use App\Models\SystemSetting;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
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
        // Load recipients from DB; fall back to env defaults
        $recipients = SystemSetting::getJson('grace_period_reminder_recipients');
        if (empty($recipients)) {
            $fallbackEmail = env('AUTOMATED_REMINDER_RECIPIENT_EMAIL', 'admin@artslabcreatives.com');
            $fallbackName  = env('AUTOMATED_REMINDER_RECIPIENT_NAME', 'Admin');
            $recipients    = [['email' => $fallbackEmail, 'name' => $fallbackName]];
        }

        $this->form->fill([
            'enable_chatbot'                   => SystemSetting::isEnabled('enable_chatbot', true),
            'enable_ai_scenarios'              => SystemSetting::isEnabled('enable_ai_scenarios', true),
            'grace_period_reminder_recipients' => $recipients,
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

                Section::make('Grace Period Reminder — Notification Recipients')
                    ->description('These email addresses will receive automated notifications when a project\'s grace period is about to expire. Add as many recipients as needed.')
                    ->schema([
                        Repeater::make('grace_period_reminder_recipients')
                            ->label('Recipients')
                            ->helperText('Each recipient listed here will receive a separate reminder email for every qualifying project.')
                            ->schema([
                                TextInput::make('email')
                                    ->label('Email Address')
                                    ->email()
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('recipient@example.com'),
                                TextInput::make('name')
                                    ->label('Display Name')
                                    ->maxLength(255)
                                    ->placeholder('Finance Team'),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add recipient')
                            ->minItems(1)
                            ->defaultItems(1)
                            ->reorderable()
                            ->collapsible()
                            ->cloneable(),
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

        // Sanitise and persist the recipients list as a JSON array.
        // Strip any entries that have no email address (Repeater may leave empty rows).
        $recipients = collect($data['grace_period_reminder_recipients'] ?? [])
            ->filter(fn($row) => !empty($row['email']))
            ->map(fn($row) => [
                'email' => trim(strtolower($row['email'])),
                'name'  => trim($row['name'] ?? 'Admin'),
            ])
            ->values()
            ->all();

        SystemSetting::set('grace_period_reminder_recipients', json_encode($recipients));

        Notification::make()
            ->title('Settings saved successfully.')
            ->success()
            ->send();
    }
}

