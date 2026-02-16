<?php

namespace App\Console\Commands;

//illuminate log
use Vluzrmos\SlackApi\Contracts\SlackApi;
use SlackUser;
use SlackChat;
use SlackChannel;
use App\Models\User;
use App\Services\MattermostService;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SlackMigrateMattermost extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:smm {--test-channel= : Test with a single channel ID} {--skip-users : Skip user migration} {--skip-existing : Skip channels that already exist with messages}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate Slack channels and messages to Mattermost';

    protected $mattermostService;
    protected $slackToMattermostUserMap = [];
    protected $slackToMattermostTokenMap = [];
    protected $slackUserIdToUsernameMap = [];
    protected $slackTsToMattermostPostMap = []; // Map Slack timestamps to Mattermost post IDs
    protected $deletedSlackUsers = []; // Track deleted users that were created temporarily
    protected $addedChannelMembers = []; // Track users already added to current channel
    protected $messageExportData = []; // Export data for JSON file (for backdating messages later)
    protected $jsonExportFilename = null; // Path to JSON export file

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('=== SLACK TO MATTERMOST MIGRATION STARTED ===');
        $this->info('=== SLACK TO MATTERMOST MIGRATION STARTED ===');
        
        $this->mattermostService = app(MattermostService::class);
        $slack = app(SlackApi::class);

        // Step 1: Migrate Users (skip if --skip-users flag is set)
        if (!$this->option('skip-users')) {
            Log::info('=== STEP 1: Migrating Users ===');
            $this->info('=== STEP 1: Migrating Users ===');
            $this->migrateUsers($slack);
            
            $this->line('');
            $this->line('');
        } else {
            Log::info('=== STEP 1: SKIPPED - User migration disabled ===');
            $this->info('=== STEP 1: SKIPPED - User migration disabled ===');
            $this->line('');
            
            // Build user maps from existing Mattermost users
            $this->buildUserMapsFromSlack($slack);
        }
        
        // Step 2: Migrate Channels
        if ($testChannel = $this->option('test-channel')) {
            // Initialize JSON export for test too
            $this->initializeJsonExport();
            
            Log::info('=== STEP 2: Migrating Test Channel ===');
            $this->info('=== STEP 2: Migrating Test Channel ===');
            $this->migrateChannelAndMessages($slack, $testChannel);
            
            // Finalize JSON export
            $this->finalizeJsonExport();
        } else {
            Log::info('=== STEP 2: Migrating All Channels and Messages ===');
            $this->info('=== STEP 2: Migrating All Channels and Messages ===');
            $this->migrateAllChannels($slack);
        }
        
        Log::info('=== MIGRATION COMPLETED SUCCESSFULLY ===');
        $this->info('');
        $this->info('Migration completed!');
        
        // Finalize JSON export file
        $this->finalizeJsonExport();
    }

    protected function migrateAllChannels($slack)
    {
        // Initialize JSON export file
        $this->initializeJsonExport();
        
        Log::info('Fetching all Slack channels using conversations.list API...');
        $this->info('Fetching all Slack channels using conversations.list API...');
        
        // Fetch all channels using conversations.list API with pagination
        $slackToken = config('services.slack.token') ?? env('SLACK_TOKEN');
        $allChannels = [];
        $cursor = '';
        $pageCount = 0;
        
        do {
            $pageCount++;
            $url = 'https://slack.com/api/conversations.list';
            $params = [
                'types' => 'public_channel,private_channel',
                'exclude_archived' => 'false',
                'limit' => 200
            ];
            
            if ($cursor) {
                $params['cursor'] = $cursor;
            }
            
            Log::info("Fetching page $pageCount of channels...");
            $this->info("Fetching page $pageCount of channels...");
            
            $response = Http::withToken($slackToken)
                ->get($url, $params);
            
            $data = $response->json();
            
            if (!isset($data['ok']) || !$data['ok']) {
                Log::error('Failed to fetch Slack channels: ' . ($data['error'] ?? 'Unknown error'));
                $this->error('Failed to fetch Slack channels: ' . ($data['error'] ?? 'Unknown error'));
                return;
            }
            
            if (isset($data['channels']) && is_array($data['channels'])) {
                $allChannels = array_merge($allChannels, $data['channels']);
                Log::info('Fetched ' . count($data['channels']) . ' channels (total so far: ' . count($allChannels) . ')');
            }
            
            $cursor = $data['response_metadata']['next_cursor'] ?? '';
            
            // Rate limiting between API calls
            if ($cursor) {
                usleep(100000); // 100ms delay
            }
            
        } while (!empty($cursor));
        
        $channelCount = count($allChannels);
        $activeCount = count(array_filter($allChannels, fn($ch) => !($ch['is_archived'] ?? false)));
        $archivedCount = $channelCount - $activeCount;
        
        Log::info("Found {$channelCount} total Slack channels ({$activeCount} active, {$archivedCount} archived)");
        $this->info("Found {$channelCount} total Slack channels ({$activeCount} active, {$archivedCount} archived)");
        $this->line('');
        
        $successCount = 0;
        $failCount = 0;
        $skippedArchived = 0;
        $skippedExisting = 0;
        
        foreach ($allChannels as $channel) {
            $channelId = $channel['id'] ?? null;
            $channelName = $channel['name'] ?? null;
            $isArchived = $channel['is_archived'] ?? false;
            
            if (!$channelId || !$channelName) {
                continue;
            }
            
            // Skip archived channels
            if ($isArchived) {
                Log::info("Skipping archived channel: $channelName");
                $this->comment("Skipping archived channel: $channelName");
                $skippedArchived++;
                continue;
            }
            
            Log::info("--- Processing channel: $channelName (ID: $channelId) ---");
            $this->info("--- Processing channel: $channelName ---");
            
            try {
                $wasProcessed = $this->migrateChannelAndMessages($slack, $channelId);
                if ($wasProcessed) {
                    $successCount++;
                } else {
                    $skippedExisting++;
                }
                $this->line('');
            } catch (\Exception $e) {
                Log::error("Failed to migrate channel $channelName: " . $e->getMessage());
                $this->error("Failed to migrate channel $channelName: " . $e->getMessage());
                $failCount++;
                $this->line('');
            }
            
            // Rate limiting between channels
            sleep(2);
        }
        
        Log::info("Channel migration summary: {$successCount} succeeded, {$failCount} failed, {$skippedArchived} archived skipped, {$skippedExisting} existing skipped");
        $this->info("Channel migration summary: {$successCount} succeeded, {$failCount} failed, {$skippedArchived} archived skipped, {$skippedExisting} existing skipped");
        
        // Finalize JSON export
        $this->finalizeJsonExport();
    }

    protected function buildUserMapsFromSlack($slack)
    {
        Log::info('Building user maps from Slack...');
        $this->info('Building user maps from Slack...');
        
        $userApi = $slack->load('User');
        $slackUsers = $userApi->lists();
        
        if (!isset($slackUsers->ok) || !$slackUsers->ok || !isset($slackUsers->members)) {
            Log::error('Failed to fetch Slack users for mapping');
            $this->error('Failed to fetch Slack users for mapping');
            return;
        }
        
        $mattermostUrl = config('services.mattermost.url');
        $mattermostToken = config('services.mattermost.token');
        
        foreach ($slackUsers->members as $slackUser) {
            $slackUserId = $slackUser->id ?? null;
            $username = $slackUser->name ?? null;
            $isBot = $slackUser->is_bot ?? false;
            $isDeleted = $slackUser->deleted ?? false;
            
            if (!$slackUserId || !$username) {
                continue;
            }
            
            // Store username mapping for mentions
            $this->slackUserIdToUsernameMap[$slackUserId] = $username;
            
            // Skip bots completely
            if ($isBot) {
                continue;
            }
            
            // For deleted users, check if they exist in Mattermost
            if ($isDeleted) {
                // Try to find existing user
                try {
                    $response = Http::withToken($mattermostToken)
                        ->get("$mattermostUrl/api/v4/users/username/$username");
                    
                    if ($response->successful()) {
                        $mattermostUser = $response->json();
                        $this->slackToMattermostUserMap[$slackUserId] = $mattermostUser['id'];
                        
                        // Get or create token
                        $tokenResponse = Http::withToken($mattermostToken)
                            ->post("$mattermostUrl/api/v4/users/{$mattermostUser['id']}/tokens", [
                                'description' => "Slack migration token for $username"
                            ]);
                        
                        if ($tokenResponse->successful()) {
                            $tokenData = $tokenResponse->json();
                            $this->slackToMattermostTokenMap[$mattermostUser['id']] = $tokenData['token'];
                        }
                    }
                } catch (\Exception $e) {
                    // User doesn't exist, will be created on-demand when posting messages
                }
                continue;
            }
            
            // Try to find Mattermost user by username first
            $email = $slackUser->profile->email ?? null;
            
            try {
                $response = Http::withToken($mattermostToken)
                    ->get("$mattermostUrl/api/v4/users/username/$username");
                
                if ($response->successful()) {
                    $mattermostUser = $response->json();
                    $this->slackToMattermostUserMap[$slackUserId] = $mattermostUser['id'];
                    
                    // Get or create token
                    $tokenResponse = Http::withToken($mattermostToken)
                        ->post("$mattermostUrl/api/v4/users/{$mattermostUser['id']}/tokens", [
                            'description' => "Slack migration token for $username"
                        ]);
                    
                    if ($tokenResponse->successful()) {
                        $tokenData = $tokenResponse->json();
                        $this->slackToMattermostTokenMap[$mattermostUser['id']] = $tokenData['token'];
                    }
                    continue;
                }
                
                // If not found by username, try by email
                if ($email) {
                    $response = Http::withToken($mattermostToken)
                        ->get("$mattermostUrl/api/v4/users/email/" . urlencode($email));
                    
                    if ($response->successful()) {
                        $mattermostUser = $response->json();
                        $this->slackToMattermostUserMap[$slackUserId] = $mattermostUser['id'];
                        
                        Log::info("  → Mapped Slack user $username to Mattermost user {$mattermostUser['username']} (via email $email)");
                        
                        // Get or create token
                        $tokenResponse = Http::withToken($mattermostToken)
                            ->post("$mattermostUrl/api/v4/users/{$mattermostUser['id']}/tokens", [
                                'description' => "Slack migration token for $email"
                            ]);
                        
                        if ($tokenResponse->successful()) {
                            $tokenData = $tokenResponse->json();
                            $this->slackToMattermostTokenMap[$mattermostUser['id']] = $tokenData['token'];
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Could not map user $username: " . $e->getMessage());
            }
        }
        
        Log::info('Mapped ' . count($this->slackToMattermostUserMap) . ' users from Slack');
        $this->info('Mapped ' . count($this->slackToMattermostUserMap) . ' users from Slack');
    }

    protected function createDeletedUser($slackUserId, $username, $channelId = null)
    {
        $mattermostUrl = config('services.mattermost.url');
        $mattermostToken = config('services.mattermost.token');
        
        if (!$username) {
            $username = 'deleted_user_' . substr($slackUserId, -8);
        }
        
        Log::info("Creating temporary account for deleted user: $username");
        $this->line("  → Creating account for deleted user: $username");
        
        try {
            // Check if user already exists
            $response = Http::withToken($mattermostToken)
                ->get("$mattermostUrl/api/v4/users/username/$username");
            
            if ($response->successful()) {
                $mattermostUser = $response->json();
                $userId = $mattermostUser['id'];
                $this->slackToMattermostUserMap[$slackUserId] = $userId;
                
                // Create token
                $tokenResponse = Http::withToken($mattermostToken)
                    ->post("$mattermostUrl/api/v4/users/$userId/tokens", [
                        'description' => "Slack migration token for deleted user $username"
                    ]);
                
                if ($tokenResponse->successful()) {
                    $tokenData = $tokenResponse->json();
                    $this->slackToMattermostTokenMap[$userId] = $tokenData['token'];
                }
                
                // Add to channel if channel ID provided
                if ($channelId) {
                    $this->addUserToChannel($userId, $channelId);
                }
                
                return $userId;
            }
            
            // Create new user
            $email = "deleted.$username@artslabcreatives.com";
            $password = 'DeletedUser!' . bin2hex(random_bytes(8)) . '@2026';
            
            $createResponse = Http::withToken($mattermostToken)
                ->post("$mattermostUrl/api/v4/users", [
                    'email' => $email,
                    'username' => $username,
                    'password' => $password,
                    'first_name' => 'Deleted',
                    'last_name' => 'User',
                ]);
            
            if ($createResponse->successful()) {
                $mattermostUser = $createResponse->json();
                $userId = $mattermostUser['id'];
                
                $this->slackToMattermostUserMap[$slackUserId] = $userId;
                $this->deletedSlackUsers[] = $userId;
                
                // Create token
                $tokenResponse = Http::withToken($mattermostToken)
                    ->post("$mattermostUrl/api/v4/users/$userId/tokens", [
                        'description' => "Slack migration token for deleted user $username"
                    ]);
                
                if ($tokenResponse->successful()) {
                    $tokenData = $tokenResponse->json();
                    $this->slackToMattermostTokenMap[$userId] = $tokenData['token'];
                }
                
                // Add to channel if channel ID provided
                if ($channelId) {
                    $this->addUserToChannel($userId, $channelId);
                }
                
                Log::info("  ✓ Created temporary account (will be disabled after migration)");
                return $userId;
            } else {
                Log::error("  ✗ Failed to create deleted user: " . $createResponse->body());
                return null;
            }
            
        } catch (\Exception $e) {
            Log::error("  ✗ Error creating deleted user: " . $e->getMessage());
            return null;
        }
    }

    protected function addUserToChannel($userId, $channelId)
    {
        $mattermostUrl = config('services.mattermost.url');
        $mattermostToken = config('services.mattermost.token');
        
        try {
            $response = Http::withToken($mattermostToken)
                ->post("$mattermostUrl/api/v4/channels/$channelId/members", [
                    'user_id' => $userId,
                ]);
            
            if ($response->successful()) {
                Log::info("  ✓ Added user to channel");
                // Rate limiting: Wait 100ms after adding member
                usleep(100000);
                return true;
            } else {
                Log::warning("  ⚠ Could not add user to channel: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("  ✗ Error adding user to channel: " . $e->getMessage());
            return false;
        }
    }

    protected function disableDeletedUsers()
    {
        if (empty($this->deletedSlackUsers)) {
            return;
        }
        
        $mattermostUrl = config('services.mattermost.url');
        $mattermostToken = config('services.mattermost.token');
        
        Log::info('Disabling temporarily created deleted users...');
        $this->info('Disabling temporarily created deleted users...');
        
        foreach ($this->deletedSlackUsers as $userId) {
            try {
                $response = Http::withToken($mattermostToken)
                    ->put("$mattermostUrl/api/v4/users/$userId/active", [
                        'active' => false
                    ]);
                
                if ($response->successful()) {
                    Log::info("  ✓ Disabled user $userId");
                } else {
                    Log::warning("  ⚠ Could not disable user $userId: " . $response->body());
                }
            } catch (\Exception $e) {
                Log::error("  ✗ Error disabling user $userId: " . $e->getMessage());
            }
        }
        
        $this->info("  ✓ Disabled " . count($this->deletedSlackUsers) . " deleted user accounts");
    }

    protected function initializeJsonExport()
    {
        $timestamp = date('Y-m-d_His');
        $this->jsonExportFilename = storage_path("logs/slack_message_mappings_{$timestamp}.json");
        
        // Create initial JSON structure
        $initialData = [
            'export_started' => date('Y-m-d H:i:s'),
            'export_completed' => null,
            'total_messages' => 0,
            'channels' => [],
            'postgresql_info' => [
                'table' => 'posts',
                'columns' => [
                    'id' => 'Mattermost post ID (26 chars)',
                    'createat' => 'Creation timestamp in milliseconds',
                    'updateat' => 'Update timestamp in milliseconds',
                ],
                'update_query_template' => "UPDATE posts SET createat = :original_timestamp * 1000, updateat = :original_timestamp * 1000 WHERE id = ':mattermost_post_id'",
                'batch_update_note' => "Mattermost stores timestamps in milliseconds (multiply by 1000)",
            ],
        ];
        
        file_put_contents($this->jsonExportFilename, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        Log::info("Initialized JSON export file: {$this->jsonExportFilename}");
    }
    
    protected function appendChannelDataToJson($channelName, $posted, $skipped, $botSkipped)
    {
        if (empty($this->messageExportData) || !$this->jsonExportFilename) {
            return;
        }
        
        // Read existing JSON
        $existingData = json_decode(file_get_contents($this->jsonExportFilename), true);
        
        // Add channel data
        $existingData['channels'][$channelName] = [
            'posted' => $posted,
            'skipped' => $skipped,
            'bot_skipped' => $botSkipped,
            'messages' => $this->messageExportData,
        ];
        
        // Update totals
        $existingData['total_messages'] += count($this->messageExportData);
        
        // Write back to file
        file_put_contents($this->jsonExportFilename, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        
        Log::info("Appended " . count($this->messageExportData) . " messages for channel $channelName to JSON");
        
        // Clear memory
        $this->messageExportData = [];
    }
    
    protected function finalizeJsonExport()
    {
        if (!$this->jsonExportFilename || !file_exists($this->jsonExportFilename)) {
            Log::info('No JSON export file to finalize');
            return;
        }
        
        // Read and update with completion timestamp
        $existingData = json_decode(file_get_contents($this->jsonExportFilename), true);
        $existingData['export_completed'] = date('Y-m-d H:i:s');
        
        file_put_contents($this->jsonExportFilename, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        
        Log::info("Finalized JSON export: {$this->jsonExportFilename}");
        Log::info("Total messages exported: {$existingData['total_messages']}");
        
        $this->info("\n✓ Message mappings exported to: {$this->jsonExportFilename}");
        $this->info("  Total messages: {$existingData['total_messages']}");
        $this->info("  Total channels: " . count($existingData['channels']));
        $this->info("  Use this file to backdate messages in PostgreSQL later");
    }

    protected function migrateUsers($slack)
    {
        Log::info('Fetching Slack users...');
        $this->info('Fetching Slack users...');
        
        $userApi = $slack->load('User');
        $slackUsers = $userApi->lists();
        
        if (!isset($slackUsers->ok) || !$slackUsers->ok) {
            Log::error('Failed to fetch Slack users');
            $this->error('Failed to fetch Slack users');
            return;
        }
        
        if (!isset($slackUsers->members) || !is_array($slackUsers->members)) {
            Log::error('No users found in Slack response');
            $this->error('No users found in Slack response');
            return;
        }
        
        $userCount = count($slackUsers->members);
        Log::info("Found {$userCount} Slack users");
        $this->info("Found {$userCount} Slack users");
        $this->line('');
        
        $mattermostUrl = config('services.mattermost.url');
        $mattermostToken = config('services.mattermost.token');
        
        foreach ($slackUsers->members as $slackUser) {
            // Skip bots and deleted users
            if (($slackUser->is_bot ?? false) || ($slackUser->deleted ?? false)) {
                continue;
            }
            
            $slackUserId = $slackUser->id ?? null;
            $username = $slackUser->name ?? null;
            $email = $slackUser->profile->email ?? null;
            $firstName = $slackUser->profile->first_name ?? '';
            $lastName = $slackUser->profile->last_name ?? '';
            
            if (!$slackUserId || !$username) {
                continue;
            }
            
            // Store username mapping for mentions
            $this->slackUserIdToUsernameMap[$slackUserId] = $username;
            
            Log::info("Processing user: $username (Slack ID: $slackUserId)");
            $this->line("Processing user: $username (Slack ID: $slackUserId)");
            
            // Check if user exists in Mattermost by email or username
            try {
                $response = Http::withToken($mattermostToken)
                    ->get("$mattermostUrl/api/v4/users/username/$username");
                
                if ($response->successful()) {
                    $mattermostUser = $response->json();
                    $this->slackToMattermostUserMap[$slackUserId] = $mattermostUser['id'];
                    Log::info("  ✓ User $username exists in Mattermost (ID: {$mattermostUser['id']})");
                    $this->line("  ✓ User exists in Mattermost (ID: {$mattermostUser['id']})");
                    
                    // Generate new password and update existing user
                    $password = 'Migrate!' . bin2hex(random_bytes(8)) . '@2026';
                    
                    // Get email if not set
                    if (!$email) {
                        $email = $mattermostUser['email'] ?? "$username@artslabcreatives.com";
                    }
                    
                    // Update user's password
                    $updateResponse = Http::withToken($mattermostToken)
                        ->put("$mattermostUrl/api/v4/users/{$mattermostUser['id']}/password", [
                            'new_password' => $password
                        ]);
                    
                    if ($updateResponse->successful()) {
                        Log::info("  ✓ Updated password for user $username");
                        Log::info("     CREDENTIALS - Email: $email | Password: $password");
                        $this->line("  ✓ Password updated");
                        $this->line("     Login: $email | Password: $password");
                    } else {
                        Log::warning("  ⚠ Could not update password for $username: " . $updateResponse->body());
                        $this->warn("  ⚠ Could not update password");
                    }
                    
                    // Create personal access token for this user
                    $this->createPersonalToken($mattermostUrl, $mattermostToken, $mattermostUser['id'], $username);
                    continue;
                }
                
                // User doesn't exist, create them
                if (!$email) {
                    $email = "$username@artslabcreatives.com"; // Fallback email
                }
                
                // Generate password that meets Mattermost requirements:
                // At least 16 characters, one uppercase, one symbol
                $password = 'Migrate!' . bin2hex(random_bytes(8)) . '@2026';
                
                $response = Http::withToken($mattermostToken)
                    ->post("$mattermostUrl/api/v4/users", [
                        'email' => $email,
                        'username' => $username,
                        'password' => $password,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                    ]);
                
                if ($response->successful()) {
                    $mattermostUser = $response->json();
                    $this->slackToMattermostUserMap[$slackUserId] = $mattermostUser['id'];
                    
                    // Log credentials for access
                    Log::info("  ✓ Created user $username in Mattermost (ID: {$mattermostUser['id']})");
                    Log::info("     CREDENTIALS - Email: $email | Password: $password");
                    $this->info("  ✓ Created user in Mattermost (ID: {$mattermostUser['id']})");
                    $this->line("     Login: $email | Password: $password");
                    
                    // Create personal access token for this user
                    $this->createPersonalToken($mattermostUrl, $mattermostToken, $mattermostUser['id'], $username);
                } else {
                    Log::error("  ✗ Failed to create user $username: " . $response->body());
                    $this->error("  ✗ Failed to create user: " . $response->body());
                }
                
            } catch (\Exception $e) {
                Log::error("  ✗ Error processing user $username: " . $e->getMessage());
                $this->error("  ✗ Error processing user: " . $e->getMessage());
            }
            
            // Rate limiting: Wait 150ms between user operations
            usleep(150000);
        }
        
        $this->line('');
        $mappedCount = count($this->slackToMattermostUserMap);
        Log::info("User migration complete. Mapped {$mappedCount} users.");
        $this->info("User migration complete. Mapped {$mappedCount} users.");
    }

    protected function createPersonalToken($mattermostUrl, $adminToken, $userId, $username)
    {
        try {
            $response = Http::withToken($adminToken)
                ->post("$mattermostUrl/api/v4/users/$userId/tokens", [
                    'description' => "Slack migration token for $username"
                ]);
            
            if ($response->successful()) {
                $tokenData = $response->json();
                $this->slackToMattermostTokenMap[$userId] = $tokenData['token'];
                Log::info("  ✓ Created personal access token for $username");
                $this->line("  ✓ Created personal access token");
            } else {
                Log::error("  ✗ Failed to create token for $username: " . $response->body());
                $this->error("  ✗ Failed to create token: " . $response->body());
            }
            
            // Rate limiting: Wait 100ms after token creation
            usleep(100000);
        } catch (\Exception $e) {
            Log::error("  ✗ Error creating token for $username: " . $e->getMessage());
            $this->error("  ✗ Error creating token: " . $e->getMessage());
        }
    }

    protected function convertSlackMentionsToMattermost($text)
    {
        // Replace Slack channel mention <!channel> with Mattermost @channel
        $text = preg_replace('/<!channel>/', '@channel', $text);
        
        // Replace Slack here mention <!here> with Mattermost @here
        $text = preg_replace('/<!here>/', '@here', $text);
        
        // Replace Slack everyone mention <!everyone> with Mattermost @all
        $text = preg_replace('/<!everyone>/', '@all', $text);
        
        // Replace Slack user mentions <@USERID> with Mattermost @username
        return preg_replace_callback('/<@([A-Z0-9]+)>/', function($matches) {
            $slackUserId = $matches[1];
            $username = $this->slackUserIdToUsernameMap[$slackUserId] ?? null;
            
            if ($username) {
                return "@$username";
            }
            
            return $matches[0]; // Keep original if not found
        }, $text);
    }

    /**
     * Migrate a single channel and its messages
     * 
     * @return bool True if channel was migrated, false if skipped
     */
    protected function migrateChannelAndMessages($slack, $slackChannelId)
    {
        $channelApi = $slack->load('Channel');
        
        // Get channel info
        Log::info("Fetching Slack channel info for $slackChannelId...");
        $this->info("Fetching Slack channel info for $slackChannelId...");
        $channelInfo = $channelApi->info($slackChannelId);
        
        if (!isset($channelInfo->ok) || !$channelInfo->ok) {
            Log::error('Failed to fetch channel info: ' . ($channelInfo->error ?? 'Unknown error'));
            $this->error('Failed to fetch channel info: ' . ($channelInfo->error ?? 'Unknown error'));
            return;
        }
        
        $channelName = $channelInfo->channel->name ?? 'migrated-channel';
        $channelPurpose = $channelInfo->channel->purpose->value ?? '';
        
        Log::info("Channel: $channelName");
        $this->info("Channel: $channelName");
        $this->line('');
        
        // Create or get Mattermost channel
        $mattermostUrl = config('services.mattermost.url');
        $mattermostToken = config('services.mattermost.token');
        $mattermostTeamId = config('services.mattermost.team_id');
        
        $mattermostChannelId = null;
        
        try {
            // Check if channel exists
            $response = Http::withToken($mattermostToken)
                ->get("$mattermostUrl/api/v4/teams/$mattermostTeamId/channels/name/$channelName");
            
            if ($response->successful()) {
                // Channel exists
                $existingChannel = $response->json();
                $mattermostChannelId = $existingChannel['id'];
                
                Log::info("  ✓ Channel $channelName exists (ID: $mattermostChannelId)");
                $this->info("  ✓ Channel exists (ID: $mattermostChannelId)");
                
                // Check if we should skip existing channels
                if ($this->option('skip-existing')) {
                    // Count messages in the channel
                    $postsResponse = Http::withToken($mattermostToken)
                        ->get("$mattermostUrl/api/v4/channels/$mattermostChannelId/posts", [
                            'per_page' => 1
                        ]);
                    
                    if ($postsResponse->successful()) {
                        $posts = $postsResponse->json();
                        $messageCount = $posts['total_count'] ?? 0;
                        
                        if ($messageCount > 0) {
                            Log::info("  → Skipping channel $channelName (already has $messageCount messages)");
                            $this->comment("  → Skipping (already has $messageCount messages)");
                            return false; // Channel skipped
                        }
                    }
                }
                
                // Delete existing messages if not skipping
                $this->info('  Deleting existing messages...');
                
                // Get all posts in the channel
                $postsResponse = Http::withToken($mattermostToken)
                    ->get("$mattermostUrl/api/v4/channels/$mattermostChannelId/posts", [
                        'per_page' => 10000
                    ]);
                
                if ($postsResponse->successful()) {
                    $posts = $postsResponse->json();
                    $postIds = $posts['order'] ?? [];
                    $deletedCount = 0;
                    
                    foreach ($postIds as $postId) {
                        $deleteResponse = Http::withToken($mattermostToken)
                            ->delete("$mattermostUrl/api/v4/posts/$postId");
                        
                        if ($deleteResponse->successful()) {
                            $deletedCount++;
                        }
                        
                        // Rate limiting for deletions
                        usleep(50000); // 50ms delay
                    }
                    
                    Log::info("  ✓ Deleted $deletedCount messages from channel $channelName");
                    $this->info("  ✓ Deleted $deletedCount messages");
                }
                
            } else {
                // Channel doesn't exist - create it
                $this->info('  Creating new channel in Mattermost...');
                
                $createResponse = Http::withToken($mattermostToken)
                    ->post("$mattermostUrl/api/v4/channels", [
                        'team_id' => $mattermostTeamId,
                        'name' => $channelName,
                        'display_name' => ucfirst(str_replace('-', ' ', $channelName)),
                        'purpose' => $channelPurpose,
                        'type' => 'O', // Open channel
                    ]);
                
                if ($createResponse->successful()) {
                    $mattermostChannel = $createResponse->json();
                    $mattermostChannelId = $mattermostChannel['id'];
                    Log::info("  ✓ Created channel $channelName (ID: $mattermostChannelId)");
                    $this->info("  ✓ Created channel (ID: $mattermostChannelId)");
                } else {
                    Log::error('Failed to create channel: ' . $createResponse->body());
                    $this->error('Failed to create channel: ' . $createResponse->body());
                    return;
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Error with channel: ' . $e->getMessage());
            $this->error('Error with channel: ' . $e->getMessage());
            return;
        }
        
        // Ensure we have a valid channel ID
        if (!$mattermostChannelId) {
            Log::error('No valid Mattermost channel ID obtained');
            $this->error('Failed to get or create channel');
            return;
        }
        
        $this->line('');
        
        // Get actual channel members from Slack using direct API call
        $this->info('Fetching channel members from Slack...');
        
        $slackToken = config('services.slack.token');
        $slackChannelMembers = [];
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $slackToken,
            ])->get('https://slack.com/api/conversations.members', [
                'channel' => $slackChannelId,
                'limit' => 1000
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    $slackChannelMembers = $data['members'] ?? [];
                } else {
                    Log::error('Slack API error: ' . ($data['error'] ?? 'Unknown error'));
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch Slack channel members: ' . $e->getMessage());
        }
        
        Log::info("Channel has " . count($slackChannelMembers) . " members in Slack");
        $this->info("Channel has " . count($slackChannelMembers) . " members in Slack");
        
        // Add only actual channel members to the Mattermost channel
        $this->info('Adding channel members to Mattermost...');
        $addedUsers = 0;
        $this->addedChannelMembers = []; // Reset for this channel
        
        foreach ($slackChannelMembers as $slackUserId) {
            $mattermostUserId = $this->slackToMattermostUserMap[$slackUserId] ?? null;
            
            if (!$mattermostUserId) {
                Log::warning("  ⚠ Slack user $slackUserId not mapped to Mattermost");
                continue;
            }
            try {
                $response = Http::withToken($mattermostToken)
                    ->post("$mattermostUrl/api/v4/channels/$mattermostChannelId/members", [
                        'user_id' => $mattermostUserId,
                    ]);
                
                if ($response->successful()) {
                    $addedUsers++;
                    $this->addedChannelMembers[$slackUserId] = true; // Track that this user was added
                } else {
                    $responseData = $response->json();
                    $errorId = $responseData['id'] ?? 'unknown';
                    
                    // Don't log 404 team member errors (expected for users not in team)
                    if ($errorId !== 'app.team.get_member.missing.app_error') {
                        $this->line("  ⚠ Could not add user $mattermostUserId: " . $response->body());
                    }
                }
            } catch (\Exception $e) {
                $this->line("  ⚠ Error adding user $mattermostUserId: " . $e->getMessage());
            }
            
            // Rate limiting: Wait 100ms between adding channel members
            usleep(100000);
        }
        
        Log::info("  ✓ Added $addedUsers users to channel $channelName");
        $this->info("  ✓ Added $addedUsers users to channel");
        $this->line('');
        
        // Get channel history
        Log::info('Fetching channel history...');
        $this->info('Fetching channel history...');
        $history = $channelApi->history($slackChannelId, 1000);
        
        if (!isset($history->ok) || !$history->ok || !isset($history->messages)) {
            Log::error('Failed to fetch channel history: ' . ($history->error ?? 'Unknown error'));
            $this->error('Failed to fetch channel history: ' . ($history->error ?? 'Unknown error'));
            $this->line('Response: ' . json_encode($history, JSON_PRETTY_PRINT));
            return;
        }
        
        $messages = array_reverse($history->messages); // Reverse to post in chronological order
        $messageCount = count($messages);
        Log::info("Found {$messageCount} messages in channel $channelName");
        $this->info("Found {$messageCount} messages");
        $this->line('');
        
        // Post messages to Mattermost
        Log::info('Posting messages to Mattermost...');
        $this->info('Posting messages to Mattermost...');
        $posted = 0;
        $skipped = 0;
        $botSkipped = 0;
        
        foreach ($messages as $message) {
            $slackUserId = $message->user ?? null;
            $text = $message->text ?? '';
            $messageTs = $message->ts ?? null;
            $threadTs = $message->thread_ts ?? null;
            $hasFiles = isset($message->files) && is_array($message->files) && count($message->files) > 0;
            
            // Skip if no user, no timestamp, and neither text nor files
            if (!$slackUserId || !$messageTs || (!$text && !$hasFiles)) {
                $skipped++;
                continue;
            }
            
            // Check if user is a bot by looking up in Slack data
            $username = $this->slackUserIdToUsernameMap[$slackUserId] ?? null;
            if ($username) {
                // Check if this is a bot by trying to find in our user API data
                $userApi = $slack->load('User');
                try {
                    $userInfo = $userApi->info($slackUserId);
                    if (isset($userInfo->user->is_bot) && $userInfo->user->is_bot) {
                        Log::warning("  ⚠ Skipping bot message from $slackUserId");
                        $botSkipped++;
                        continue;
                    }
                } catch (\Exception $e) {
                    // Continue if we can't check
                }
            }
            
            // Get Mattermost user ID (or create if deleted user)
            $mattermostUserId = $this->slackToMattermostUserMap[$slackUserId] ?? null;
            
            if (!$mattermostUserId) {
                // Try to create deleted user temporarily
                $mattermostUserId = $this->createDeletedUser($slackUserId, $username, $mattermostChannelId);
                
                if (!$mattermostUserId) {
                    $this->line("  ⚠ Skipping message: Slack user $slackUserId not mapped");
                    $skipped++;
                    continue;
                }
            }
            
            // Get user's personal token
            $userToken = $this->slackToMattermostTokenMap[$mattermostUserId] ?? null;
            
            if (!$userToken) {
                $this->line("  ⚠ Skipping message: No token for Mattermost user $mattermostUserId");
                $skipped++;
                continue;
            }
            
            // Ensure user is in the channel (they might have posted historically but left)
            if (!isset($this->addedChannelMembers[$slackUserId])) {
                // User posted but isn't in current members list - add them temporarily
                Log::info("  → Adding historical member $username ($slackUserId) to channel");
                if ($this->addUserToChannel($mattermostUserId, $mattermostChannelId)) {
                    $this->addedChannelMembers[$slackUserId] = true;
                }
            }
            
            // Convert Slack mentions to Mattermost mentions
            $convertedText = $this->convertSlackMentionsToMattermost($text);
            
            // Handle file attachments
            $fileIds = [];
            if (isset($message->files) && is_array($message->files)) {
                foreach ($message->files as $file) {
                    $fileId = $this->migrateFileAttachment($file, $mattermostChannelId, $userToken);
                    if ($fileId) {
                        $fileIds[] = $fileId;
                    }
                }
            }
            
            // Prepare post data
            $postData = [
                'channel_id' => $mattermostChannelId,
                'message' => $convertedText ?: '[File attachment]', // Default text if only files
            ];
            
            // Add file IDs if any were uploaded
            if (!empty($fileIds)) {
                $postData['file_ids'] = $fileIds;
            }
            
            // Check if this is a reply to another message
            if ($threadTs && $threadTs !== $messageTs) {
                // This is a reply, find the parent post
                $parentPostId = $this->slackTsToMattermostPostMap[$threadTs] ?? null;
                if ($parentPostId) {
                    $postData['root_id'] = $parentPostId;
                }
            }
            
            try {
                // Post using the user's own token so it appears as them
                $response = Http::withToken($userToken)
                    ->post("$mattermostUrl/api/v4/posts", $postData);
                
                if ($response->successful()) {
                    $postResponse = $response->json();
                    $mattermostPostId = $postResponse['id'];
                    
                    // Store the mapping for thread replies
                    $this->slackTsToMattermostPostMap[$messageTs] = $mattermostPostId;
                    
                    // Export data for JSON (for backdating later)
                    $this->messageExportData[] = [
                        'slack_channel_id' => $slackChannelId,
                        'slack_channel_name' => $channelName,
                        'slack_message_ts' => $messageTs,
                        'slack_thread_ts' => $threadTs,
                        'slack_user_id' => $slackUserId,
                        'slack_username' => $username,
                        'mattermost_post_id' => $mattermostPostId,
                        'mattermost_channel_id' => $mattermostChannelId,
                        'mattermost_user_id' => $mattermostUserId,
                        'original_timestamp' => (int)explode('.', $messageTs)[0], // Unix timestamp
                        'original_date' => date('Y-m-d H:i:s', (int)explode('.', $messageTs)[0]),
                        'message_text' => mb_substr($text, 0, 100), // First 100 chars for reference
                    ];
                    
                    $posted++;
                    // Log every 10 messages to avoid log spam
                    if ($posted % 10 === 0) {
                        Log::info("Progress: Posted $posted messages so far...");
                    }
                    
                    $fileInfo = !empty($fileIds) ? ' +' . count($fileIds) . ' file(s)' : '';
                    $replyInfo = ($threadTs && $threadTs !== $messageTs) ? ' (reply)' : '';
                    $this->line("  ✓ Posted message from user $slackUserId$replyInfo$fileInfo");
                } else {
                    Log::error("  ✗ Failed to post message from Slack user $slackUserId ($username): "  . $response->body());
                    $this->error("  ✗ Failed to post message: " . $response->body());
                    $skipped++;
                }
                
            } catch (\Exception $e) {
                Log::error("  ✗ Exception posting message from Slack user $slackUserId ($username): " . $e->getMessage());
                $this->error("  ✗ Error posting message: " . $e->getMessage());
                $skipped++;
            }
            
            // Rate limiting: Wait 200ms between message posts (critical to avoid hitting limits)
            usleep(200000);
        }
        
        $this->line('');
        Log::info("Message migration complete for channel $channelName: Posted $posted messages, skipped $skipped (including $botSkipped bot messages)");
        $this->info("Posted $posted messages, skipped $skipped (including $botSkipped bot messages)");
        
        // Disable any temporarily created deleted users
        $this->disableDeletedUsers();
        
        // Append message data to JSON file immediately (don't wait till end)
        $this->appendChannelDataToJson($channelName, $posted, $skipped, $botSkipped);
        
        return true; // Channel was successfully migrated
    }

    /**
     * Migrate a file attachment from Slack to Mattermost
     * 
     * @param object $file The Slack file object
     * @param string $mattermostChannelId The Mattermost channel ID
     * @param string $userToken The user's personal access token
     * @return string|null The Mattermost file ID or null on failure
     */
    protected function migrateFileAttachment($file, $mattermostChannelId, $userToken)
    {
        $mattermostUrl = config('services.mattermost.url');
        $slackToken = config('services.slack.token') ?? env('SLACK_TOKEN');
        
        $fileName = $file->name ?? 'file';
        $fileUrl = $file->url_private ?? $file->url_private_download ?? null;
        $mimeType = $file->mimetype ?? 'application/octet-stream';
        $fileSize = $file->size ?? 0;
        
        if (!$fileUrl) {
            Log::warning("  ⚠ File $fileName has no download URL, skipping");
            return null;
        }
        
        // Skip files larger than 50MB (Mattermost default limit)
        if ($fileSize > 50 * 1024 * 1024) {
            Log::warning("  ⚠ File $fileName is too large ({$fileSize} bytes), skipping");
            $this->line("  ⚠ Skipping large file: $fileName");
            return null;
        }
        
        try {
            // Download file from Slack
            Log::info("  → Downloading file: $fileName ($fileSize bytes)");
            
            $fileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $slackToken,
            ])->timeout(120)
              ->get($fileUrl);
            
            if (!$fileResponse->successful()) {
                Log::error("  ✗ Failed to download file from Slack: " . $fileResponse->status());
                return null;
            }
            
            $fileContent = $fileResponse->body();
            
            // Upload to Mattermost using multipart form data
            Log::info("  → Uploading file to Mattermost: $fileName");
            
            $uploadResponse = Http::withToken($userToken)
                ->timeout(120)
                ->attach('files', $fileContent, $fileName)
                ->post("$mattermostUrl/api/v4/files", [
                    'channel_id' => $mattermostChannelId,
                ]);
            
            if ($uploadResponse->successful()) {
                $uploadData = $uploadResponse->json();
                
                // The response contains an array of file_infos
                if (isset($uploadData['file_infos']) && is_array($uploadData['file_infos']) && count($uploadData['file_infos']) > 0) {
                    $fileId = $uploadData['file_infos'][0]['id'] ?? null;
                    
                    if ($fileId) {
                        Log::info("  ✓ Uploaded file: $fileName (ID: $fileId)");
                        $this->line("    ✓ Attached file: $fileName");
                        
                        // Rate limiting for file uploads
                        usleep(300000); // 300ms delay
                        
                        return $fileId;
                    }
                }
                
                Log::error("  ✗ Upload response missing file ID: " . json_encode($uploadData));
                return null;
            } else {
                Log::error("  ✗ Failed to upload file to Mattermost: " . $uploadResponse->body());
                $this->line("  ✗ Failed to upload file: $fileName");
                return null;
            }
            
        } catch (\Exception $e) {
            Log::error("  ✗ Exception migrating file $fileName: " . $e->getMessage());
            $this->line("  ✗ Error migrating file: " . $e->getMessage());
            return null;
        }
    }}