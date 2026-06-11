<?php

namespace App\Filament\Pages;

use App\Models\AuditLog;
use App\Models\User;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class MattermostPasswords extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-key';

    protected static ?string $navigationLabel = 'Mattermost Passwords';

    protected static ?string $title = 'Mattermost Passwords';

    protected static string $view = 'filament.pages.mattermost-passwords';

    protected static ?int $navigationSort = 13;

    public ?array $data = [];

    public ?string $retrievedPassword = null;

    public static function canAccess(): bool
    {
        return auth()->user()?->role === 'admin';
    }

    public function mount(): void
    {
        $this->form->fill();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Retrieve Credentials')
                    ->description('Select a user and input the admin secret key to retrieve their stored Mattermost password.')
                    ->schema([
                        Select::make('user_id')
                            ->label('Select User')
                            ->options(
                                User::where('email', '!=', 'system@artslabcreatives.com')
                                    ->where('email', '!=', 'systemadmin@artslabcreatives.com')
                                    ->pluck('email', 'id')
                            )
                            ->searchable()
                            ->required(),

                        TextInput::make('secret_key')
                            ->label('Admin Secret Key')
                            ->password()
                            ->revealable()
                            ->required(),
                    ])
                    ->columns(1),
            ])
            ->statePath('data');
    }

    public function retrieve(): void
    {
        // Calling getState() executes form validation
        $state = $this->form->getState();

        $userId = $state['user_id'];
        $secretKey = $state['secret_key'];

        // Get actual secret key
        $expectedKey = config('services.mattermost.password_secret');

        if (!$expectedKey || $secretKey !== $expectedKey) {
            // Log access failure
            $admin = auth()->user();
            $targetUser = User::find($userId);
            
            Log::warning("Unauthorized Mattermost password retrieval attempt", [
                'admin_id' => $admin?->id,
                'admin_email' => $admin?->email,
                'target_user_id' => $userId,
                'target_user_email' => $targetUser?->email,
                'ip' => request()->ip(),
            ]);

            AuditLog::create([
                'user_id' => auth()->id(),
                'entity_type' => User::class,
                'entity_id' => $userId,
                'action' => 'retrieve_mattermost_password_failed',
                'field_changed' => 'mattermost_password',
                'old_value' => null,
                'new_value' => json_encode([
                    'ip' => request()->ip(),
                    'target_email' => $targetUser?->email,
                    'reason' => 'Invalid secret key',
                ]),
            ]);

            Notification::make()
                ->title('Invalid Secret Key')
                ->body('The secret key you provided is incorrect.')
                ->danger()
                ->send();

            $this->retrievedPassword = null;
            return;
        }

        $user = User::find($userId);
        if (!$user) {
            Notification::make()
                ->title('User not found')
                ->danger()
                ->send();
            $this->retrievedPassword = null;
            return;
        }

        $password = $user->mattermost_password;

        if (!$password) {
            Notification::make()
                ->title('No Password Stored')
                ->body('This user does not have a synchronized Mattermost password stored yet.')
                ->warning()
                ->send();
            $this->retrievedPassword = null;
            return;
        }

        // Log successful access
        $admin = auth()->user();
        Log::info("Admin retrieved Mattermost password", [
            'admin_id' => $admin->id,
            'admin_email' => $admin->email,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'ip' => request()->ip(),
        ]);

        AuditLog::create([
            'user_id' => $admin->id,
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'action' => 'retrieve_mattermost_password',
            'field_changed' => 'mattermost_password',
            'old_value' => null,
            'new_value' => json_encode([
                'ip' => request()->ip(),
                'target_email' => $user->email,
                'success' => true,
            ]),
        ]);

        $this->retrievedPassword = $password;

        Notification::make()
            ->title('Password Retrieved Successfully')
            ->success()
            ->send();
    }
}
