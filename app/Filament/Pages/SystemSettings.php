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

    // Define the roles for rate limiting configuration
    protected array $roles = ['admin', 'team-lead', 'hr', 'account-manager', 'user'];

    public function mount(): void
    {
        // Load recipients from DB; fall back to env defaults
        $recipients = SystemSetting::getJson('grace_period_reminder_recipients');
        if (empty($recipients)) {
            $fallbackEmail = env('AUTOMATED_REMINDER_RECIPIENT_EMAIL', 'admin@artslabcreatives.com');
            $fallbackName  = env('AUTOMATED_REMINDER_RECIPIENT_NAME', 'Admin');
            $recipients    = [['email' => $fallbackEmail, 'name' => $fallbackName]];
        }

        $this->form->fill(array_merge([
            'enable_chatbot'                   => SystemSetting::isEnabled('enable_chatbot', true),
            'enable_ai_scenarios'              => SystemSetting::isEnabled('enable_ai_scenarios', true),
            'grace_period_reminder_recipients' => $recipients,
        ], $this->getRateLimitSettings()));
    }

    protected function getRateLimitSettings(): array
    {
        $settings = [];
        foreach ($this->roles as $role) {
            $defaultSessionLimit = $role === 'admin' ? 50 : ($role === 'user' ? 10 : 30);
            $defaultMessageLimit = $role === 'admin' ? 100 : ($role === 'user' ? 30 : 60);
            $defaultTokenLimit   = $role === 'admin' ? 8192 : ($role === 'user' ? 2048 : 4096);

            $settings["ai_rate_limit_session_{$role}"] = SystemSetting::get("ai_rate_limit_session_{$role}", $defaultSessionLimit);
            $settings["ai_rate_limit_message_{$role}"] = SystemSetting::get("ai_rate_limit_message_{$role}", $defaultMessageLimit);
            $settings["ai_token_limit_{$role}"]         = SystemSetting::get("ai_token_limit_{$role}", $defaultTokenLimit);
        }
        return $settings;
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

                Section::make('AI Chatbot Rate Limiting (per minute)')
                    ->description('Set the maximum number of requests allowed per minute for each user role.')
                    ->schema([
                        Section::make('Session Creation Rate Limits')
                            ->schema(
                                collect($this->roles)->map(function ($role) {
                                    $default = $role === 'admin' ? 50 : ($role === 'user' ? 10 : 30);
                                    return TextInput::make("ai_rate_limit_session_{$role}")
                                        ->label(ucwords(str_replace('-', ' ', $role)) . ' (Sessions/min)')
                                        ->numeric()
                                        ->default($default)
                                        ->required();
                                })->toArray()
                            )->columns(2),
                        Section::make('Message Sending Rate Limits')
                            ->schema(
                                collect($this->roles)->map(function ($role) {
                                    $default = $role === 'admin' ? 100 : ($role === 'user' ? 30 : 60);
                                    return TextInput::make("ai_rate_limit_message_{$role}")
                                        ->label(ucwords(str_replace('-', ' ', $role)) . ' (Messages/min)')
                                        ->numeric()
                                        ->default($default)
                                        ->required();
                                })->toArray()
                            )->columns(2),
                        Section::make('Max Output Token Limit per Response')
                            ->description('Controls how long Claude\'s reply can be. Higher = more detailed but more expensive.')
                            ->schema(
                                collect($this->roles)->map(function ($role) {
                                    $default = $role === 'admin' ? 8192 : ($role === 'user' ? 2048 : 4096);
                                    return TextInput::make("ai_token_limit_{$role}")
                                        ->label(ucwords(str_replace('-', ' ', $role)) . ' (Max tokens)')
                                        ->numeric()
                                        ->default($default)
                                        ->required()
                                        ->helperText('Claude Sonnet max is 16,000');
                                })->toArray()
                            )->columns(2),
                    ])
                    ->collapsible(),

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

        foreach ($this->roles as $role) {
            SystemSetting::set("ai_rate_limit_session_{$role}", $data["ai_rate_limit_session_{$role}"] ?? 10);
            SystemSetting::set("ai_rate_limit_message_{$role}", $data["ai_rate_limit_message_{$role}"] ?? 30);
            SystemSetting::set("ai_token_limit_{$role}",         $data["ai_token_limit_{$role}"] ?? 4096);
        }

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

