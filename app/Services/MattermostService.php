<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MattermostService
{
    protected string $baseUrl;
    protected string $token;
    protected string $teamId;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.mattermost.url'), '/');
        $this->token = config('services.mattermost.token');
        $this->teamId = config('services.mattermost.team_id');
    }

    /**
     * Create a Mattermost channel for a project
     */
    public function createChannelForProject(Project $project): ?array
    {
        try {
            $channelName = $this->generateChannelName($project);
            $displayName = Str::limit($project->name, 64);

            $response = $this->makeRequest('POST', '/api/v4/channels', [
                'team_id' => $this->teamId,
                'name' => $channelName,
                'display_name' => $displayName,
                'type' => 'P', // P = Private, O = Open/Public
                'purpose' => Str::limit($project->description ?? "Project channel for {$project->name}", 250),
            ]);

            if ($response->successful()) {
                $channelData = $response->json();
                
                // Store channel ID in project metadata
                $this->updateProjectChannelId($project, $channelData['id']);

                // Add project participants
                $this->addProjectParticipants($project, $channelData['id']);

                Log::info("Mattermost channel created for project: {$project->name}", [
                    'project_id' => $project->id,
                    'channel_id' => $channelData['id'],
                ]);

                return $channelData;
            }

            Log::error('Failed to create Mattermost channel', [
                'project_id' => $project->id,
                'response' => $response->json(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception creating Mattermost channel', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Archive a Mattermost channel when project is deleted/archived
     */
    public function archiveChannelForProject(Project $project): bool
    {
        try {
            $channelId = $this->getProjectChannelId($project);
            
            if (!$channelId) {
                Log::warning('No Mattermost channel ID found for project', [
                    'project_id' => $project->id,
                ]);
                return false;
            }

            $response = $this->makeRequest('DELETE', "/api/v4/channels/{$channelId}");

            if ($response->successful()) {
                Log::info("Mattermost channel archived for project: {$project->name}", [
                    'project_id' => $project->id,
                    'channel_id' => $channelId,
                ]);
                return true;
            }

            Log::error('Failed to archive Mattermost channel', [
                'project_id' => $project->id,
                'channel_id' => $channelId,
                'response' => $response->json(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Exception archiving Mattermost channel', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Add project participants to the channel
     */
    protected function addProjectParticipants(Project $project, string $channelId): void
    {
        // Get unique users from project tasks
        $userIds = $project->tasks()
            ->whereNotNull('assignee_id')
            ->pluck('assignee_id')
            ->unique();

        // Also add project creator
        if ($project->created_by) {
            $userIds->push($project->created_by);
        }

        $users = User::whereIn('id', $userIds->unique())->get();

        foreach ($users as $user) {
            $this->addUserToChannel($user, $channelId);
        }
    }

    /**
     * Add a user to a channel
     */
    public function addUserToChannel(User $user, string $channelId): bool
    {
        try {
            $mattermostUserId = $this->getMattermostUserId($user);
            
            if (!$mattermostUserId) {
                Log::warning('No Mattermost user ID found for user', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
                return false;
            }

            // Use user's personal token if available
            $response = $this->makeRequest('POST', "/api/v4/channels/{$channelId}/members", [
                'user_id' => $mattermostUserId,
            ], $user);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Exception adding user to Mattermost channel', [
                'user_id' => $user->id,
                'channel_id' => $channelId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Sync user with Mattermost (create or update)
     */
    public function syncUser(User $user, ?string $password = null): ?array
    {
        try {
            // Check if user exists in Mattermost by email
            $existingUser = $this->getUserByEmail($user->email);

            if ($existingUser) {
                // Update existing user
                return $this->updateMattermostUser($user, $existingUser['id']);
            } else {
                // Create new user
                return $this->createMattermostUser($user, $password);
            }
        } catch (\Exception $e) {
            Log::error('Exception syncing user with Mattermost', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Create a new Mattermost user
     */
    protected function createMattermostUser(User $user, ?string $password = null): ?array
    {
        $username = $this->generateUsername($user->email);
        $password = $password ?? Str::random(32). '!Aa1';

        $response = $this->makeRequest('POST', '/api/v4/users', [
            'email' => $user->email,
            'username' => $username,
            'password' => $password,
            'first_name' => $this->getFirstName($user->name),
            'last_name' => $this->getLastName($user->name),
            'nickname' => $user->name,
        ]);

        if ($response->successful()) {
            $mattermostUser = $response->json();
            
            // Store Mattermost user ID in our database
            $this->storeMattermostUserId($user, $mattermostUser['id']);

            // Add user to team
            $this->addUserToTeam($mattermostUser['id']);

            // Generate and store personal access token for the user
            $this->generateAndStoreUserToken($user, $mattermostUser['id']);

            Log::info('Mattermost user created', [
                'user_id' => $user->id,
                'mattermost_user_id' => $mattermostUser['id'],
            ]);

            return $mattermostUser;
        }

        Log::error('Failed to create Mattermost user', [
            'user_id' => $user->id,
            'response' => $response->json(),
        ]);

        return null;
    }

    /**
     * Update existing Mattermost user
     */
    protected function updateMattermostUser(User $user, string $mattermostUserId): ?array
    {
        $response = $this->makeRequest('PUT', "/api/v4/users/{$mattermostUserId}", [
            'id' => $mattermostUserId,
            'email' => $user->email,
            'first_name' => $this->getFirstName($user->name),
            'last_name' => $this->getLastName($user->name),
            'nickname' => $user->name,
        ]);

        if ($response->successful()) {
            $mattermostUser = $response->json();
            
            // Store/update Mattermost user ID
            $this->storeMattermostUserId($user, $mattermostUser['id']);

            // Regenerate personal access token if not exists
            if (!$user->mattermost_token) {
                $this->generateAndStoreUserToken($user, $mattermostUser['id']);
            }

            return $mattermostUser;
        }

        return null;
    }

    /**
     * Add user to the Mattermost team
     */
    protected function addUserToTeam(string $mattermostUserId): bool
    {
        $response = $this->makeRequest('POST', "/api/v4/teams/{$this->teamId}/members", [
            'team_id' => $this->teamId,
            'user_id' => $mattermostUserId,
        ]);

        return $response->successful();
    }

    /**
     * Get Mattermost user by email
     */
    public function getUserByEmail(string $email): ?array
    {
        try {
            $response = $this->makeRequest('GET', "/api/v4/users/email/{$email}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate magic link token for user authentication
     */
    public function generateMagicLinkToken(User $user): ?string
    {
        try {
            $mattermostUserId = $this->getMattermostUserId($user);
            
            if (!$mattermostUserId) {
                return null;
            }

            // Use the stored personal access token if available
            if ($user->mattermost_token) {
                return $user->mattermost_token;
            }

            // Otherwise generate a new token and store it
            return $this->generateAndStoreUserToken($user, $mattermostUserId);
        } catch (\Exception $e) {
            Log::error('Exception generating Mattermost magic link token', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Generate magic link URL
     */
    public function generateMagicLinkUrl(User $user): ?string
    {
        $token = $this->generateMagicLinkToken($user);
        
        if (!$token) {
            return null;
        }

        return "{$this->baseUrl}/login?token={$token}";
    }

    /**
     * Make HTTP request to Mattermost API
     */
    protected function makeRequest(string $method, string $endpoint, array $data = [], ?User $user = null)
    {
        $url = $this->baseUrl . $endpoint;
        
        // Use user's personal token if provided and available, otherwise use admin token
        $token = ($user && $user->mattermost_token) ? $user->mattermost_token : $this->token;

        return Http::withToken($token)
            ->accept('application/json')
            ->$method($url, $data);
    }

    /**
     * Generate a valid Mattermost channel name from project
     */
    protected function generateChannelName(Project $project): string
    {
        // Mattermost channel names: lowercase, alphanumeric, dashes, underscores, max 64 chars
        $name = Str::slug($project->name, '-');
        $name = preg_replace('/[^a-z0-9\-_]/', '', $name);
        $name = Str::limit($name, 60, '');
        
        // Add project ID to ensure uniqueness
        $name .= '-' . $project->id;
        
        return $name;
    }

    /**
     * Generate username from email
     */
    protected function generateUsername(string $email): string
    {
        $username = Str::before($email, '@');
        $username = preg_replace('/[^a-z0-9.\-_]/', '', strtolower($username));
        return Str::limit($username, 64, '');
    }

    /**
     * Get first name from full name
     */
    protected function getFirstName(string $fullName): string
    {
        return Str::before($fullName, ' ') ?: $fullName;
    }

    /**
     * Get last name from full name
     */
    protected function getLastName(string $fullName): string
    {
        $lastName = Str::after($fullName, ' ');
        return $lastName !== $fullName ? $lastName : '';
    }

    /**
     * Get project's Mattermost channel ID
     */
    protected function getProjectChannelId(Project $project): ?string
    {
        return $project->mattermost_channel_id ?? null;
    }

    /**
     * Update project's Mattermost channel ID
     */
    protected function updateProjectChannelId(Project $project, string $channelId): void
    {
        $project->update(['mattermost_channel_id' => $channelId]);
    }

    /**
     * Get user's Mattermost ID
     */
    protected function getMattermostUserId(User $user): ?string
    {
        return $user->mattermost_user_id ?? null;
    }

    /**
     * Store user's Mattermost ID
     */
    protected function storeMattermostUserId(User $user, string $mattermostUserId): void
    {
        $user->update(['mattermost_user_id' => $mattermostUserId]);
    }

    /**
     * Generate and store personal access token for user
     */
    protected function generateAndStoreUserToken(User $user, string $mattermostUserId): ?string
    {
        try {
            // Create a personal access token for the user
            $response = $this->makeRequest('POST', "/api/v4/users/{$mattermostUserId}/tokens", [
                'description' => 'Personal API Token - Generated ' . now()->toDateTimeString(),
            ]);

            if ($response->successful()) {
                $tokenData = $response->json();
                $token = $tokenData['token'];
                
                // Store token in database
                $user->update(['mattermost_token' => $token]);

                Log::info('Generated personal access token for user', [
                    'user_id' => $user->id,
                    'mattermost_user_id' => $mattermostUserId,
                ]);

                return $token;
            }

            Log::error('Failed to generate personal access token for user', [
                'user_id' => $user->id,
                'mattermost_user_id' => $mattermostUserId,
                'response' => $response->json(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception generating personal access token for user', [
                'user_id' => $user->id,
                'mattermost_user_id' => $mattermostUserId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get user's Mattermost token
     */
    protected function getMattermostToken(User $user): ?string
    {
        return $user->mattermost_token ?? null;
    }
}
