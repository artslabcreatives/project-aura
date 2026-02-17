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

            return $this->deleteChannelById($channelId, $project->name);
        } catch (\Exception $e) {
            Log::error('Exception deleting Mattermost channel', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Delete a Mattermost channel by ID
     */
    public function deleteChannelById(string $channelId, ?string $projectName = null): bool
    {
        try {
            // Try permanent delete first (works for both deleted and non-deleted)
            $url = "{$this->baseUrl}/api/v4/channels/{$channelId}?permanent=true";
            $response = Http::withToken($this->token)
                ->accept('application/json')
                ->delete($url);

            if ($response->successful()) {
                Log::info("Permanently deleted channel" . ($projectName ? " for: {$projectName}" : ""), [
                    'channel_id' => $channelId,
                ]);
                return true;
            }
            
            // If permanent delete failed, try soft delete first then permanent
            $softUrl = "{$this->baseUrl}/api/v4/channels/{$channelId}";
            $softResponse = Http::withToken($this->token)
                ->accept('application/json')
                ->delete($softUrl);
                
            if ($softResponse->successful()) {
                // Now try permanent delete
                $permResponse = Http::withToken($this->token)
                    ->accept('application/json')
                    ->delete($url);
                    
                if ($permResponse->successful()) {
                    Log::info("Soft deleted then permanently deleted channel", [
                        'channel_id' => $channelId,
                    ]);
                    return true;
                }
            }

            Log::error('Failed to delete channel', [
                'channel_id' => $channelId,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Exception deleting channel by ID', [
                'channel_id' => $channelId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get all channels for the team (with pagination)
     */
    public function getAllTeamChannels(): array
    {
        try {
            $allChannels = [];
            $page = 0;
            $perPage = 200;
            
            Log::info('Fetching all channels INCLUDING DELETED from Mattermost API');
            
            do {
                $url = "{$this->baseUrl}/api/v4/channels";
                
                $response = Http::withToken($this->token)
                    ->accept('application/json')
                    ->get($url, [
                        'page' => $page,
                        'per_page' => $perPage,
                        'include_deleted' => true,  // INCLUDE DELETED
                    ]);

                if (!$response->successful()) {
                    Log::error('Failed to fetch channels', [
                        'status' => $response->status(),
                        'page' => $page,
                        'body' => $response->body(),
                    ]);
                    break;
                }

                $channels = $response->json();
                
                // Filter by team_id if it exists
                $teamChannels = array_filter($channels, function($ch) {
                    return isset($ch['team_id']) && $ch['team_id'] === $this->teamId;
                });
                
                $allChannels = array_merge($allChannels, $teamChannels);
                
                $page++;
                
                if (count($channels) < $perPage) {
                    break;
                }
            } while ($page < 10);

            Log::info('Fetched all channels INCLUDING DELETED', [
                'count' => count($allChannels),
                'channels' => array_map(fn($ch) => $ch['name'], $allChannels)
            ]);

            return $allChannels;
        } catch (\Exception $e) {
            Log::error('Exception fetching channels', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get channel by name
     */
    public function getChannelByName(string $channelName): ?array
    {
        try {
            $response = $this->makeRequest('GET', "/api/v4/teams/{$this->teamId}/channels/name/{$channelName}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Delete all project-related channels from Mattermost
     */
    public function deleteAllProjectChannels(): int
    {
        $deleted = 0;
        
        // First, get visible channels and delete them
        $channels = $this->getAllTeamChannels();
        
        Log::info('Deleting visible channels', ['count' => count($channels)]);
        
        foreach ($channels as $channel) {
            if (!in_array($channel['name'], ['town-square', 'off-topic'])) {
                if ($this->deleteChannelById($channel['id'], $channel['display_name'])) {
                    $deleted++;
                }
            }
        }
        
        // Then, try to delete channels by project name
        $projects = \App\Models\Project::where('is_archived', false)->get();
        
        Log::info('Attempting to delete channels by project names', ['project_count' => $projects->count()]);
        
        foreach ($projects as $project) {
            $channelName = $this->generateChannelName($project);
            
            // Try to fetch the channel by name
            $channel = $this->getChannelByName($channelName);
            
            if ($channel) {
                Log::info('Found channel by name, deleting', [
                    'project_id' => $project->id,
                    'channel_name' => $channelName,
                    'channel_id' => $channel['id']
                ]);
                
                if ($this->deleteChannelById($channel['id'], $channel['display_name'])) {
                    $deleted++;
                }
            }
        }
        
        Log::info('Total channels deleted', ['deleted' => $deleted]);
        
        return $deleted;
    }

    /**
     * Add project participants to the channel
     */
    protected function addProjectParticipants(Project $project, string $channelId): void
    {
        $users = $this->getProjectUsers($project);

        foreach ($users as $user) {
            $this->addUserToChannel($user, $channelId);
        }
    }

    /**
     * Get all unique users associated with a project
     */
    public function getProjectUsers(Project $project): \Illuminate\Support\Collection
    {
        $userIds = collect();

        // Get users from project tasks (primary assignees)
        $taskUserIds = $project->tasks()
            ->whereNotNull('assignee_id')
            ->pluck('assignee_id');
        $userIds = $userIds->merge($taskUserIds);

        // Get users from task_assignees junction table (multiple assignees per task)
        $taskAssigneeIds = \DB::table('task_assignees')
            ->join('tasks', 'task_assignees.task_id', '=', 'tasks.id')
            ->where('tasks.project_id', $project->id)
            ->pluck('task_assignees.user_id');
        $userIds = $userIds->merge($taskAssigneeIds);

        // Get users from stages (main and backup responsibles)
        foreach ($project->stages as $stage) {
            if ($stage->main_responsible_id) {
                $userIds->push($stage->main_responsible_id);
            }
            if ($stage->backup_responsible_id_1) {
                $userIds->push($stage->backup_responsible_id_1);
            }
            if ($stage->backup_responsible_id_2) {
                $userIds->push($stage->backup_responsible_id_2);
            }
        }

        // Also add project creator
        if ($project->created_by) {
            $userIds->push($project->created_by);
        }

        // Return unique users
        return User::whereIn('id', $userIds->unique())->get();
    }

    /**
     * Sync channel members to match project users
     */
    public function syncChannelMembers(Project $project, ?string $channelId = null): array
    {
        $channelId = $channelId ?? $this->getProjectChannelId($project);
        
        if (!$channelId) {
            Log::warning('No Mattermost channel ID found for project sync', [
                'project_id' => $project->id,
            ]);
            return ['added' => 0, 'failed' => 0];
        }

        $users = $this->getProjectUsers($project);
        $added = 0;
        $failed = 0;

        foreach ($users as $user) {
            if ($this->addUserToChannel($user, $channelId)) {
                $added++;
            } else {
                $failed++;
            }
        }

        // Remove channel creator if they're not part of the project team
        $this->removeChannelCreatorIfNotInTeam($project, $channelId);

        Log::info("Synced members for project channel", [
            'project_id' => $project->id,
            'channel_id' => $channelId,
            'added' => $added,
            'failed' => $failed,
        ]);

        return ['added' => $added, 'failed' => $failed];
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
     * Remove a user from a channel
     */
    public function removeUserFromChannel(string $mattermostUserId, string $channelId): bool
    {
        try {
            $response = $this->makeRequest('DELETE', "/api/v4/channels/{$channelId}/members/{$mattermostUserId}");

            if ($response->successful()) {
                Log::debug('Removed user from channel', [
                    'mattermost_user_id' => $mattermostUserId,
                    'channel_id' => $channelId,
                ]);
                return true;
            }

            Log::warning('Failed to remove user from channel', [
                'mattermost_user_id' => $mattermostUserId,
                'channel_id' => $channelId,
                'response' => $response->json(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Exception removing user from Mattermost channel', [
                'mattermost_user_id' => $mattermostUserId,
                'channel_id' => $channelId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get channel members
     */
    public function getChannelMembers(string $channelId): array
    {
        try {
            $response = $this->makeRequest('GET', "/api/v4/channels/{$channelId}/members");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to fetch channel members', [
                'channel_id' => $channelId,
                'response' => $response->json(),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exception fetching channel members', [
                'channel_id' => $channelId,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Remove channel creator if they are not part of the project team
     */
    public function removeChannelCreatorIfNotInTeam(Project $project, string $channelId): bool
    {
        try {
            // Get all channel members
            $members = $this->getChannelMembers($channelId);
            
            if (empty($members)) {
                return false;
            }

            // Get project users' Mattermost IDs
            $projectUsers = $this->getProjectUsers($project);
            $projectMattermostUserIds = $projectUsers->pluck('mattermost_user_id')->filter()->toArray();

            // Check each member and remove if not in project team
            $removed = 0;
            foreach ($members as $member) {
                $memberId = $member['user_id'] ?? null;
                
                if ($memberId && !in_array($memberId, $projectMattermostUserIds)) {
                    if ($this->removeUserFromChannel($memberId, $channelId)) {
                        $removed++;
                        Log::info('Removed non-team member from channel', [
                            'mattermost_user_id' => $memberId,
                            'channel_id' => $channelId,
                            'project_id' => $project->id,
                        ]);
                    }
                }
            }

            if ($removed > 0) {
                Log::info("Removed {$removed} non-team member(s) from channel", [
                    'project_id' => $project->id,
                    'channel_id' => $channelId,
                ]);
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Exception removing non-team members from channel', [
                'project_id' => $project->id,
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
            // First check if we already have the Mattermost ID stored
            if ($user->mattermost_user_id) {
                Log::debug('User already has Mattermost ID stored', [
                    'user_id' => $user->id,
                    'mattermost_user_id' => $user->mattermost_user_id
                ]);
                return ['id' => $user->mattermost_user_id];
            }
            
            // Check if user exists in Mattermost by email
            $existingUser = $this->getUserByEmail($user->email);

            if ($existingUser) {
                Log::info('Found existing Mattermost user, storing ID', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'mattermost_user_id' => $existingUser['id']
                ]);
                
                // Store the ID
                $this->storeMattermostUserId($user, $existingUser['id']);
                
                // Update existing user info
                return $this->updateMattermostUser($user, $existingUser['id']);
            } else {
                // Create new user
                Log::info('Creating new Mattermost user', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
                return $this->createMattermostUser($user, $password);
            }
        } catch (\Exception $e) {
            Log::error('Exception syncing user with Mattermost', [
                'user_id' => $user->id,
                'email' => $user->email,
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

        $http = Http::withToken($token)->accept('application/json');

        // For DELETE requests, don't send data in the body
        if (strtoupper($method) === 'DELETE') {
            return $http->delete($url);
        }

        return $http->$method($url, $data);
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

    /**
     * Login to Mattermost and get session token
     */
    public function loginUser(string $email, string $password): ?array
    {
        try {
            $response = Http::acceptJson()
                ->post("{$this->baseUrl}/api/v4/users/login", [
                    'login_id' => $email,
                    'password' => $password,
                ]);

            if ($response->successful()) {
                $userData = $response->json();
                $token = $response->header('Token');
                
                Log::info('Mattermost user login successful', [
                    'email' => $email,
                    'user_id' => $userData['id'] ?? null,
                ]);

                return [
                    'user' => $userData,
                    'token' => $token,
                ];
            }

            Log::warning('Mattermost login failed', [
                'email' => $email,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception during Mattermost login', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Update Mattermost user password
     */
    public function updateUserPassword(string $mattermostUserId, string $newPassword): bool
    {
        try {
            $response = $this->makeRequest('PUT', "/api/v4/users/{$mattermostUserId}/password", [
                'new_password' => $newPassword,
            ]);

            if ($response->successful()) {
                Log::info('Mattermost password updated successfully', [
                    'mattermost_user_id' => $mattermostUserId,
                ]);
                return true;
            }

            Log::error('Failed to update Mattermost password', [
                'mattermost_user_id' => $mattermostUserId,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Exception updating Mattermost password', [
                'mattermost_user_id' => $mattermostUserId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Sync user password with Mattermost
     */
    public function syncUserPassword(User $user, string $plaintextPassword): bool
    {
        // Store encrypted password in our database
        $user->mattermost_password = $plaintextPassword;
        $user->save();

        // Update Mattermost password if user exists
        if ($user->mattermost_user_id) {
            return $this->updateUserPassword($user->mattermost_user_id, $plaintextPassword);
        } else {
            // Sync user to Mattermost with the password
            $result = $this->syncUser($user, $plaintextPassword);
            return $result !== null;
        }
    }

    /**
     * Generate JWT token for Mattermost plugin auto-login
     * 
     * @param User $user
     * @return string|null
     */
    public function generatePluginJWT(User $user): ?string
    {
        try {
            $secret = config('services.mattermost.jwt_secret');
            
            if (!$secret) {
                Log::error('Mattermost JWT secret not configured');
                return null;
            }

            $mattermostUserId = $this->getMattermostUserId($user);
            
            // If no stored Mattermost ID, try to fetch it from Mattermost by email
            if (!$mattermostUserId) {
                $mattermostUser = $this->getUserByEmail($user->email);
                
                if ($mattermostUser && isset($mattermostUser['id'])) {
                    $mattermostUserId = $mattermostUser['id'];
                    
                    // Store the ID for future use
                    $this->storeMattermostUserId($user, $mattermostUserId);
                    
                    Log::info('Found and stored Mattermost user ID for JWT', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'mattermost_user_id' => $mattermostUserId,
                    ]);
                } else {
                    Log::warning('User has no Mattermost account', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                    ]);
                    return null;
                }
            }

            // Extract just the domain from APP_URL (remove https://)
            $appUrl = config('app.url');
            $issuer = parse_url($appUrl, PHP_URL_HOST) ?: $appUrl;

            $payload = [
                'sub' => $mattermostUserId,
                'email' => $user->email,
                'iss' => $issuer,
                'exp' => time() + 60, // 60 seconds expiration
            ];

            $jwt = \Firebase\JWT\JWT::encode($payload, $secret, 'HS256');

            Log::info('Generated Mattermost plugin JWT', [
                'user_id' => $user->id,
                'mattermost_user_id' => $mattermostUserId,
                'issuer' => $issuer,
                'expires_at' => date('Y-m-d H:i:s', $payload['exp']),
            ]);

            return $jwt;
        } catch (\Exception $e) {
            Log::error('Exception generating Mattermost plugin JWT', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Generate Mattermost plugin auto-login URL with JWT
     * 
     * @param User $user
     * @return string|null
     */
    public function generatePluginAutoLoginUrl(User $user): ?string
    {
        $jwt = $this->generatePluginJWT($user);
        
        if (!$jwt) {
            return null;
        }

        $pluginId = config('services.mattermost.plugin_id');
        
        if (!$pluginId) {
            Log::error('Mattermost plugin ID not configured');
            return null;
        }

        return "{$this->baseUrl}/plugins/{$pluginId}/auto-login?token={$jwt}";
    }
}
