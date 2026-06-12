<?php

namespace App\Filament\Pages;

use App\Models\AuditLog;
use App\Models\User;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Http;
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

    public bool $isGenerated = false;

    // Email blast state
    public string $sendToAllUsers = '1'; // '1' = all users, '0' = specific users

    public array $selectedEmailUsers = [];

    public ?array $emailSendResult = null;

    // Queue state for step-by-step email sending
    public array $queueUsers = [];
    public int $queueTotal = 0;
    public int $queueSent = 0;
    public int $queueFailed = 0;
    public bool $isQueueRunning = false;
    public ?string $currentProcessingName = null;

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
                Section::make('Retrieve & Manage Credentials')
                    ->description('Select a user and input the admin secret key to retrieve or generate their stored Mattermost password.')
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
        $this->isGenerated = false;

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

    public function generate(): void
    {
        $this->isGenerated = true;

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
            
            Log::warning("Unauthorized Mattermost password generation attempt", [
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
                'action' => 'generate_mattermost_password_failed',
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

        // Generate a new secure password
        $newPassword = \Illuminate\Support\Str::random(16) . '!Aa1';

        // Use MattermostService to sync the new password
        $mattermostService = app(\App\Services\MattermostService::class);
        $syncSuccess = $mattermostService->syncUserPassword($user, $newPassword);

        if (!$syncSuccess) {
            Notification::make()
                ->title('Sync Failed')
                ->body('Failed to sync the generated password to Mattermost. However, the password was saved locally.')
                ->warning()
                ->send();
        }

        // Log successful generation
        $admin = auth()->user();
        Log::info("Admin generated/updated Mattermost password", [
            'admin_id' => $admin->id,
            'admin_email' => $admin->email,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'ip' => request()->ip(),
            'sync_success' => $syncSuccess,
        ]);

        AuditLog::create([
            'user_id' => $admin->id,
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'action' => 'generate_mattermost_password',
            'field_changed' => 'mattermost_password',
            'old_value' => null,
            'new_value' => json_encode([
                'ip' => request()->ip(),
                'target_email' => $user->email,
                'sync_success' => $syncSuccess,
            ]),
        ]);

        $this->retrievedPassword = $newPassword;

        Notification::make()
            ->title('Password Generated & Synced Successfully')
            ->success()
            ->send();
    }

    /**
     * Start the step-by-step queue process.
     */
    public function startEmailBlast(): void
    {
        $this->emailSendResult = null;
        $this->queueUsers = [];
        $this->queueTotal = 0;
        $this->queueSent = 0;
        $this->queueFailed = 0;
        $this->currentProcessingName = null;
        $this->isQueueRunning = false;

        // Validate secret key from the main form
        $formData = $this->data;
        $secretKey = $formData['secret_key'] ?? null;
        $expectedKey = config('services.mattermost.password_secret');

        if (!$secretKey || !$expectedKey || $secretKey !== $expectedKey) {
            Notification::make()
                ->title('Invalid Secret Key')
                ->body('Please fill in a valid Admin Secret Key in the form above before sending emails.')
                ->danger()
                ->send();
            return;
        }

        // Determine which users to target
        $query = User::query()
            ->where('is_active', true)
            ->where('email', '!=', 'system@artslabcreatives.com')
            ->where('email', '!=', 'systemadmin@artslabcreatives.com')
            ->whereNotNull('mattermost_password');

        if ($this->sendToAllUsers === '0' && !empty($this->selectedEmailUsers)) {
            $query->whereIn('id', $this->selectedEmailUsers);
        } elseif ($this->sendToAllUsers === '0' && empty($this->selectedEmailUsers)) {
            Notification::make()
                ->title('No Users Selected')
                ->body('Please select at least one user or choose "All active users".')
                ->warning()
                ->send();
            return;
        }

        $users = $query->get();

        if ($users->isEmpty()) {
            Notification::make()
                ->title('No Eligible Users')
                ->body('No active users with stored Mattermost passwords were found to email.')
                ->warning()
                ->send();
            return;
        }

        // Setup the queue state
        $this->queueUsers = $users->pluck('id')->toArray();
        $this->queueTotal = count($this->queueUsers);
        $this->isQueueRunning = true;

        // Dispatch browser event to kick off the JavaScript loop
        $this->dispatch('start-email-queue');
    }

    /**
     * Send email for a single user in the queue.
     */
    public function sendEmailForUser(int $userId): bool
    {
        if (!$this->isQueueRunning) {
            return false;
        }

        $user = User::find($userId);
        if (!$user) {
            $this->queueFailed++;
            return false;
        }

        $this->currentProcessingName = "{$user->name} ({$user->email})";

        $webhookUrl   = config('services.mattermost.credentials_email_webhook_url');
        $webhookPass  = config('services.mattermost.credentials_email_webhook_pass');
        $serverUrl    = config('services.mattermost.url', 'https://collab.artslabcreatives.com');
        $downloadUrl  = config('app.url') . '/download-mattermost';
        $admin        = auth()->user();

        try {
            // Generate JWT for HS256 JWT Auth in n8n
            $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
            $payload = json_encode([
                'iss' => 'aura',
                'iat' => time(),
                'exp' => time() + 300,
            ]);

            $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
            $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $webhookPass, true);
            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            $jwt = $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $jwt,
                'Content-Type' => 'application/json',
            ])->timeout(12)->post($webhookUrl, [
                'to_email'            => $user->email,
                'name'                => $user->name,
                'mattermost_password' => $user->mattermost_password,
                'server_url'          => $serverUrl,
                'download_url'        => $downloadUrl,
            ]);

            if ($response->successful()) {
                $this->queueSent++;
                Log::info('Mattermost credentials email sent (step-by-step)', [
                    'admin_email' => $admin->email,
                    'user_email'  => $user->email,
                ]);
                return true;
            } else {
                $this->queueFailed++;
                Log::warning('Mattermost credentials email webhook failed (step-by-step)', [
                    'user_email' => $user->email,
                    'status'     => $response->status(),
                    'body'       => $response->body(),
                ]);
                return false;
            }
        } catch (\Throwable $e) {
            $this->queueFailed++;
            Log::error('Mattermost credentials email exception (step-by-step)', [
                'user_email' => $user->email,
                'error'      => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Finalize queue and clean up state.
     */
    public function finalizeQueue(): void
    {
        if (!$this->isQueueRunning) {
            return;
        }

        $admin = auth()->user();

        // Audit log the batch action
        AuditLog::create([
            'user_id'       => $admin->id,
            'entity_type'   => User::class,
            'entity_id'     => $admin->id,
            'action'        => 'send_mattermost_credentials_email',
            'field_changed' => 'mattermost_password',
            'old_value'     => null,
            'new_value'     => json_encode([
                'ip'           => request()->ip(),
                'sent_count'   => $this->queueSent,
                'failed_count' => $this->queueFailed,
                'send_to_all'  => $this->sendToAllUsers === '1',
                'selected_ids' => $this->sendToAllUsers === '1' ? 'all' : $this->selectedEmailUsers,
            ]),
        ]);

        $this->emailSendResult = [
            'sent'   => $this->queueSent,
            'failed' => $this->queueFailed,
        ];

        $sentCount   = $this->queueSent;
        $failedCount = $this->queueFailed;

        // Reset queue state
        $this->isQueueRunning = false;
        $this->currentProcessingName = null;
        $this->queueUsers = [];

        if ($failedCount === 0) {
            Notification::make()
                ->title("Emails Sent Successfully")
                ->body("Mattermost credentials sent to {$sentCount} user(s).")
                ->success()
                ->send();
        } else {
            Notification::make()
                ->title("Partial Success")
                ->body("Sent: {$sentCount} · Failed: {$failedCount}. Check logs for details.")
                ->warning()
                ->send();
        }
    }

    /**
     * Return active users (with stored passwords) for the multi-select dropdown.
     */
    public function getActiveUsersWithPasswordsProperty(): array
    {
        return User::where('is_active', true)
            ->where('email', '!=', 'system@artslabcreatives.com')
            ->where('email', '!=', 'systemadmin@artslabcreatives.com')
            ->whereNotNull('mattermost_password')
            ->orderBy('name')
            ->get()
            ->mapWithKeys(fn($u) => [$u->id => "{$u->name} ({$u->email})"])
            ->toArray();
    }
}
