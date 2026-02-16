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
    protected $signature = 'app:smm {--test-channel= : Test with a single channel ID} {--skip-users : Skip user migration}';

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
            Log::info('=== STEP 2: Migrating Test Channel ===');
            $this->info('=== STEP 2: Migrating Test Channel ===');
            $this->migrateChannelAndMessages($slack, $testChannel);
        } else {
            Log::info('=== STEP 2: Migrating All Channels and Messages ===');
            $this->info('=== STEP 2: Migrating All Channels and Messages ===');
            $this->migrateAllChannels($slack);
        }
        
        Log::info('=== MIGRATION COMPLETED SUCCESSFULLY ===');
        $this->info('');
        $this->info('Migration completed!');
    }

    protected function migrateAllChannels($slack)
    {
        Log::info('Fetching all Slack channels...');
        $this->info('Fetching all Slack channels...');
        
        $channelApi = $slack->load('Channel');
        $channelsResponse = $channelApi->lists(1, []); // Get all channels, exclude archived (1), empty options array
        
        if (!isset($channelsResponse->ok) || !$channelsResponse->ok) {
            Log::error('Failed to fetch Slack channels: ' . ($channelsResponse->error ?? 'Unknown error'));
            $this->error('Failed to fetch Slack channels');
            return;
        }
        
        if (!isset($channelsResponse->channels) || !is_array($channelsResponse->channels)) {
            Log::error('No channels found in Slack response');
            $this->error('No channels found in Slack response');
            return;
        }
        
        $channels = $channelsResponse->channels;
        $channelCount = count($channels);
        Log::info("Found {$channelCount} Slack channels to migrate");
        $this->info("Found {$channelCount} Slack channels to migrate");
        $this->line('');
        
        $successCount = 0;
        $failCount = 0;
        
        foreach ($channels as $channel) {
            $channelId = $channel->id ?? null;
            $channelName = $channel->name ?? null;
            
            if (!$channelId || !$channelName) {
                continue;
            }
            
            Log::info("--- Processing channel: $channelName (ID: $channelId) ---");
            $this->info("--- Processing channel: $channelName ---");
            
            try {
                $this->migrateChannelAndMessages($slack, $channelId);
                $successCount++;
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
        
        Log::info('Channel migration summary: {$successCount} succeeded, {$failCount} failed');
        $this->info("Channel migration summary: {$successCount} succeeded, {$failCount} failed");
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
            if (($slackUser->is_bot ?? false) || ($slackUser->deleted ?? false)) {
                continue;
            }
            
            $slackUserId = $slackUser->id ?? null;
            $username = $slackUser->name ?? null;
            
            if (!$slackUserId || !$username) {
                continue;
            }
            
            // Store username mapping
            $this->slackUserIdToUsernameMap[$slackUserId] = $username;
            
            // Try to find Mattermost user
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
                Log::warning("Could not map user $username: " . $e->getMessage());
            }
        }
        
        Log::info('Mapped ' . count($this->slackToMattermostUserMap) . ' users from Slack');
        $this->info('Mapped ' . count($this->slackToMattermostUserMap) . ' users from Slack');
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
                // Channel exists - delete all messages
                $existingChannel = $response->json();
                $mattermostChannelId = $existingChannel['id'];
                
                Log::info("  ✓ Channel $channelName exists (ID: $mattermostChannelId)");
                $this->info("  ✓ Channel exists (ID: $mattermostChannelId)");
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
                } else {
                    $this->line("  ⚠ Could not add user $mattermostUserId: " . $response->body());
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
        
        foreach ($messages as $message) {
            $slackUserId = $message->user ?? null;
            $text = $message->text ?? '';
            $messageTs = $message->ts ?? null;
            $threadTs = $message->thread_ts ?? null;
            
            if (!$slackUserId || !$text || !$messageTs) {
                $skipped++;
                continue;
            }
            
            // Get Mattermost user ID
            $mattermostUserId = $this->slackToMattermostUserMap[$slackUserId] ?? null;
            
            if (!$mattermostUserId) {
                $this->line("  ⚠ Skipping message: Slack user $slackUserId not mapped");
                $skipped++;
                continue;
            }
            
            // Get user's personal token
            $userToken = $this->slackToMattermostTokenMap[$mattermostUserId] ?? null;
            
            if (!$userToken) {
                $this->line("  ⚠ Skipping message: No token for Mattermost user $mattermostUserId");
                $skipped++;
                continue;
            }
            
            // Convert Slack mentions to Mattermost mentions
            $convertedText = $this->convertSlackMentionsToMattermost($text);
            
            // Prepare post data
            $postData = [
                'channel_id' => $mattermostChannelId,
                'message' => $convertedText,
            ];
            
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
                    
                    $posted++;
                    // Log every 10 messages to avoid log spam
                    if ($posted % 10 === 0) {
                        Log::info("Progress: Posted $posted messages so far...");
                    }
                    $this->line("  ✓ Posted message from user $slackUserId" . ($threadTs && $threadTs !== $messageTs ? ' (reply)' : ''));
                } else {
                    Log::error("  ✗ Failed to post message: " . $response->body());
                    $this->error("  ✗ Failed to post message: " . $response->body());
                    $skipped++;
                }
                
            } catch (\Exception $e) {
                $this->error("  ✗ Error posting message: " . $e->getMessage());
                $skipped++;
            }
            
            // Rate limiting: Wait 200ms between message posts (critical to avoid hitting limits)
            usleep(200000);
        }
        
        $this->line('');
        Log::info("Message migration complete for channel $channelName: Posted $posted messages, skipped $skipped");
        $this->info("Posted $posted messages, skipped $skipped");
    }
}
