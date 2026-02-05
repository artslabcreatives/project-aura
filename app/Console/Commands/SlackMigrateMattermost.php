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
    protected $signature = 'app:smm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

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
        $this->mattermostService = app(MattermostService::class);
        $slack = app(SlackApi::class);

        // Step 1: Migrate Users
        $this->info('=== STEP 1: Migrating Users ===');
        $this->migrateUsers($slack);
        
        $this->line('');
        $this->line('');
        
        // Step 2: Migrate Channel and Messages
        $this->info('=== STEP 2: Migrating Channel and Messages ===');
        $this->migrateChannelAndMessages($slack, 'C09NTG1CPQR');
        
        $this->info('');
        $this->info('Migration completed!');
    }

    protected function migrateUsers($slack)
    {
        $this->info('Fetching Slack users...');
        
        $userApi = $slack->load('User');
        $slackUsers = $userApi->lists();
        
        if (!isset($slackUsers->ok) || !$slackUsers->ok) {
            $this->error('Failed to fetch Slack users');
            return;
        }
        
        if (!isset($slackUsers->members) || !is_array($slackUsers->members)) {
            $this->error('No users found in Slack response');
            return;
        }
        
        $this->info('Found ' . count($slackUsers->members) . ' Slack users');
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
            
            $this->line("Processing user: $username (Slack ID: $slackUserId)");
            
            // Check if user exists in Mattermost by email or username
            try {
                $response = Http::withToken($mattermostToken)
                    ->get("$mattermostUrl/api/v4/users/username/$username");
                
                if ($response->successful()) {
                    $mattermostUser = $response->json();
                    $this->slackToMattermostUserMap[$slackUserId] = $mattermostUser['id'];
                    $this->line("  ✓ User exists in Mattermost (ID: {$mattermostUser['id']})");
                    
                    // Create personal access token for this user
                    $this->createPersonalToken($mattermostUrl, $mattermostToken, $mattermostUser['id'], $username);
                    continue;
                }
                
                // User doesn't exist, create them
                if (!$email) {
                    $email = "$username@migrated.local"; // Fallback email
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
                    $this->info("  ✓ Created user in Mattermost (ID: {$mattermostUser['id']})");
                    
                    // Create personal access token for this user
                    $this->createPersonalToken($mattermostUrl, $mattermostToken, $mattermostUser['id'], $username);
                } else {
                    $this->error("  ✗ Failed to create user: " . $response->body());
                }
                
            } catch (\Exception $e) {
                $this->error("  ✗ Error processing user: " . $e->getMessage());
            }
        }
        
        $this->line('');
        $this->info('User migration complete. Mapped ' . count($this->slackToMattermostUserMap) . ' users.');
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
                $this->line("  ✓ Created personal access token");
            } else {
                $this->error("  ✗ Failed to create token: " . $response->body());
            }
        } catch (\Exception $e) {
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
        $this->info("Fetching Slack channel info for $slackChannelId...");
        $channelInfo = $channelApi->info($slackChannelId);
        
        if (!isset($channelInfo->ok) || !$channelInfo->ok) {
            $this->error('Failed to fetch channel info: ' . ($channelInfo->error ?? 'Unknown error'));
            return;
        }
        
        $channelName = $channelInfo->channel->name ?? 'migrated-channel';
        $channelPurpose = $channelInfo->channel->purpose->value ?? '';
        
        $this->info("Channel: $channelName");
        $this->line('');
        
        // Create or get Mattermost channel
        $mattermostUrl = config('services.mattermost.url');
        $mattermostToken = config('services.mattermost.token');
        $mattermostTeamId = config('services.mattermost.team_id');
        
        $this->info('Deleting existing channel if present...');
        
        try {
            // Check if channel exists and delete it
            $response = Http::withToken($mattermostToken)
                ->get("$mattermostUrl/api/v4/teams/$mattermostTeamId/channels/name/$channelName");
            
            if ($response->successful()) {
                $existingChannel = $response->json();
                $existingChannelId = $existingChannel['id'];
                
                // Delete the channel
                $deleteResponse = Http::withToken($mattermostToken)
                    ->delete("$mattermostUrl/api/v4/channels/$existingChannelId");
                
                if ($deleteResponse->successful()) {
                    $this->info("  ✓ Deleted existing channel (ID: $existingChannelId)");
                } else {
                    $this->warn("  ⚠ Could not delete existing channel: " . $deleteResponse->body());
                }
            }
            
            $this->line('');
            $this->info('Creating channel in Mattermost...');
            
            // Create channel
            $response = Http::withToken($mattermostToken)
                ->post("$mattermostUrl/api/v4/channels", [
                    'team_id' => $mattermostTeamId,
                    'name' => $channelName,
                    'display_name' => ucfirst(str_replace('-', ' ', $channelName)),
                    'purpose' => $channelPurpose,
                    'type' => 'O', // Open channel
                ]);
            
            if ($response->successful()) {
                $mattermostChannel = $response->json();
                $mattermostChannelId = $mattermostChannel['id'];
                $this->info("  ✓ Created channel (ID: $mattermostChannelId)");
            } else {
                $this->error('Failed to create channel: ' . $response->body());
                return;
            }
            
        } catch (\Exception $e) {
            $this->error('Error with channel: ' . $e->getMessage());
            return;
        }
        
        $this->line('');
        
        // Add all migrated users to the channel
        $this->info('Adding users to channel...');
        $addedUsers = 0;
        
        foreach ($this->slackToMattermostUserMap as $slackUserId => $mattermostUserId) {
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
        }
        
        $this->info("  ✓ Added $addedUsers users to channel");
        $this->line('');
        
        // Get channel history
        $this->info('Fetching channel history...');
        $history = $channelApi->history($slackChannelId, 1000);
        
        if (!isset($history->ok) || !$history->ok || !isset($history->messages)) {
            $this->error('Failed to fetch channel history: ' . ($history->error ?? 'Unknown error'));
            $this->line('Response: ' . json_encode($history, JSON_PRETTY_PRINT));
            return;
        }
        
        $messages = array_reverse($history->messages); // Reverse to post in chronological order
        $this->info('Found ' . count($messages) . ' messages');
        $this->line('');
        
        // Post messages to Mattermost
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
                    $this->line("  ✓ Posted message from user $slackUserId" . ($threadTs && $threadTs !== $messageTs ? ' (reply)' : ''));
                } else {
                    $this->error("  ✗ Failed to post message: " . $response->body());
                    $skipped++;
                }
                
            } catch (\Exception $e) {
                $this->error("  ✗ Error posting message: " . $e->getMessage());
                $skipped++;
            }
        }
        
        $this->line('');
        $this->info("Posted $posted messages, skipped $skipped");
    }
}
