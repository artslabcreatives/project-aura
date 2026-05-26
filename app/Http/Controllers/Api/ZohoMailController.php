<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\ZohoAuthService;
use App\Services\ZohoMailService;
use App\Models\ZohoToken;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

class ZohoMailController extends Controller
{
    protected $authService;
    protected $mailService;

    public function __construct(ZohoAuthService $authService, ZohoMailService $mailService)
    {
        $this->authService = $authService;
        $this->mailService = $mailService;
    }

    #[OA\Get(
        path: "/zoho/auth-url",
        summary: "Get Zoho Mail OAuth URL",
        description: "Returns the Zoho OAuth authorization URL",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        responses: [new OA\Response(response: 200, description: "Authorization URL")]
    )]
    public function getAuthUrl()
    {
        $state = \Illuminate\Support\Str::random(40);
        \Illuminate\Support\Facades\Cache::put('zoho_oauth_state_' . $state, Auth::id(), now()->addMinutes(15));

        return response()->json([
            'url' => $this->authService->getAuthUrl($state)
        ]);
    }

    #[OA\Get(
        path: "/zoho/callback",
        summary: "Zoho OAuth callback",
        description: "Public endpoint. Handles Zoho OAuth callback, exchanges code for tokens.",
        tags: ["Zoho Mail"],
        parameters: [
            new OA\Parameter(name: "code", in: "query", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "state", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 302, description: "Redirect to app")]
    )]
    public function handleCallback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');

        if (!$code) {
            return response()->json(['error' => 'No code provided'], 400);
        }

        if (!$state) {
            return response()->json(['error' => 'No state parameter provided for CSRF validation'], 400);
        }

        // Pulling the state from cache deletes it immediately, preventing replay attacks
        $userId = \Illuminate\Support\Facades\Cache::pull('zoho_oauth_state_' . $state);

        if (!$userId) {
            return response()->json(['error' => 'Invalid or expired state token. Please try connecting again.'], 403);
        }

        $token = $this->authService->exchangeCodeForTokens($code, $userId);

        if (!$token) {
            return response()->json(['error' => 'Failed to exchange token'], 500);
        }

        return redirect()->away(config('app.url') . '/emails?connection=success');
    }

    #[OA\Get(
        path: "/zoho/status",
        summary: "Zoho Mail connection status",
        description: "Returns whether Zoho Mail is connected and lists mail accounts",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        responses: [new OA\Response(response: 200, description: "Connection status and accounts")]
    )]
    public function getStatus()
    {
        $userId = Auth::id();
        $token = ZohoToken::where('user_id', $userId)->first();
        $accounts = [];

        if ($token) {
            $accounts = $this->mailService->getAccounts($userId);
        }

        return response()->json([
            'connected' => !!$token,
            'email' => $token ? $token->zoho_user_account_id : null,
            'accounts' => $accounts
        ]);
    }

    #[OA\Get(
        path: "/zoho/folders",
        summary: "List Zoho Mail folders",
        description: "Returns mail folders for the connected account",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        parameters: [new OA\Parameter(name: "account_id", in: "query", required: false, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Folders list")]
    )]
    public function getFolders(Request $request)
    {
        $accountId = $request->query('account_id');
        if (!$accountId) {
            $accounts = $this->mailService->getAccounts(Auth::id());
            if (empty($accounts)) {
                return response()->json(['error' => 'No accounts found'], 404);
            }
            $accountId = $accounts[0]['accountId'];
        }

        $folders = $this->mailService->getFolders(Auth::id(), $accountId);
        return response()->json(['folders' => $folders]);
    }

    #[OA\Get(
        path: "/zoho/folders/{folderId}/messages",
        summary: "List folder messages",
        description: "Returns messages in a specific mail folder",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        parameters: [
            new OA\Parameter(name: "folderId", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "account_id", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 200, description: "Messages list")]
    )]
    public function getMessages(Request $request, $folderId)
    {
        $accountId = $request->query('account_id');
        if (!$accountId) {
            $accounts = $this->mailService->getAccounts(Auth::id());
            if (empty($accounts)) {
                return response()->json(['error' => 'No accounts found'], 404);
            }
            $accountId = $accounts[0]['accountId'];
        }

        $messages = $this->mailService->getMessages(Auth::id(), $accountId, $folderId, $request->all());
        return response()->json(['messages' => $messages]);
    }

    #[OA\Get(
        path: "/zoho/folders/{folderId}/messages/{messageId}/content",
        summary: "Get message content",
        description: "Returns full content and metadata of a specific email",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        parameters: [
            new OA\Parameter(name: "folderId", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "messageId", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "account_id", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [new OA\Response(response: 200, description: "Message content")]
    )]
    public function getMessageContent(Request $request, $folderId, $messageId)
    {
        $accountId = $request->query('account_id');
        if (!$accountId) {
            $accounts = $this->mailService->getAccounts(Auth::id());
            if (empty($accounts)) {
                return response()->json(['error' => 'No accounts found'], 404);
            }
            $accountId = $accounts[0]['accountId'];
        }

        $details = $this->mailService->getMessageDetails(Auth::id(), $accountId, $folderId, $messageId);
        $content = $this->mailService->getMessageBody(Auth::id(), $accountId, $folderId, $messageId);

        if ($details && $content) {
            $details['content'] = $content['content'] ?? '';
        }

        $finalData = $details ?? $content;
        Log::debug('Zoho Mail Final Combined Message Data', ['data' => $finalData]);

        return response()->json(['content' => $finalData]);
    }

    #[OA\Post(
        path: "/zoho/messages",
        summary: "Send email via Zoho",
        description: "Sends an email through the connected Zoho Mail account",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "account_id", type: "string"),
                    new OA\Property(property: "fromAddress", type: "string"),
                    new OA\Property(property: "toAddress", type: "string"),
                    new OA\Property(property: "ccAddress", type: "string"),
                    new OA\Property(property: "subject", type: "string"),
                    new OA\Property(property: "content", type: "string"),
                    new OA\Property(property: "mailFormat", type: "string", enum: ["html", "plaintext"]),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Send result"),
            new OA\Response(response: 400, description: "Failed to send"),
        ]
    )]
    public function sendMessage(Request $request)
    {
        $userId = Auth::id();
        $accounts = $this->mailService->getAccounts($userId);

        $accountId = $request->input('account_id');
        
        if (!$accountId) {
            if (empty($accounts)) {
                return response()->json(['error' => 'No accounts found'], 404);
            }
            $accountId = $accounts[0]['accountId'];
        }

        $data = $request->only([
            'fromAddress',
            'toAddress', 
            'ccAddress', 
            'bccAddress', 
            'subject', 
            'content', 
            'mailFormat', 
            'attachments',
            'askReceipt'
        ]);

        Log::debug('Zoho Mail Send Message Request Data', ['data' => $data, 'accountId' => $accountId]);
        Log::debug('Zoho Mail Accounts for Send', ['accounts' => $accounts]);

        if (empty($data['fromAddress'])) {
             // Find the account and use its email
             foreach ($accounts as $account) {
                 if (isset($account['accountId']) && strval($account['accountId']) === strval($accountId)) {
                     $data['fromAddress'] = $account['mailboxAddress'] 
                        ?? $account['accountAddress'] 
                        ?? $account['incomingUserName'] 
                        ?? ($account['emailAddress'][0]['mailId'] ?? null);
                     break;
                 }
             }
             
             // Last resort: use the first account's address
             if (empty($data['fromAddress']) && !empty($accounts)) {
                 $data['fromAddress'] = $accounts[0]['mailboxAddress'] 
                    ?? $accounts[0]['accountAddress'] 
                    ?? $accounts[0]['incomingUserName'] 
                    ?? ($accounts[0]['emailAddress'][0]['mailId'] ?? null);
             }
        }

        Log::debug('Zoho Mail Identified FromAddress', ['fromAddress' => $data['fromAddress']]);
        Log::debug('Zoho Mail Attachments Before Sanitization', ['attachments' => $data['attachments'] ?? null]);

        // Remove empty optional fields that Zoho might be picky about
        if (empty($data['ccAddress'])) unset($data['ccAddress']);
        if (empty($data['bccAddress'])) unset($data['bccAddress']);
        
        // Strictly check attachments - must be non-empty array of non-empty items
        if (empty($data['attachments']) || !is_array($data['attachments']) || count($data['attachments']) === 0) {
            unset($data['attachments']);
        } else {
            // Filter out any empty items that might have sneaked in
            $data['attachments'] = array_filter($data['attachments'], function($item) {
                return !empty($item);
            });
            if (count($data['attachments']) === 0) unset($data['attachments']);
        }

        if (empty($data['subject'])) $data['subject'] = '(No Subject)';
        if (empty($data['askReceipt'])) unset($data['askReceipt']);

        Log::debug('Zoho Mail Resulting Payload for Send', ['data' => $data]);

        $result = $this->mailService->sendMessage(Auth::id(), $accountId, $data);
        
        if (!$result) {
            return response()->json(['error' => 'Failed to send email. Check logs for details.'], 400);
        }

        return response()->json(['result' => $result]);
    }

    #[OA\Post(
        path: "/zoho/messages/attachments",
        summary: "Upload email attachment",
        description: "Uploads a file attachment for use in a Zoho Mail message (max 10MB)",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["file"],
                    properties: [new OA\Property(property: "file", type: "string", format: "binary")]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Attachment details"),
            new OA\Response(response: 500, description: "Upload failed"),
        ]
    )]
    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB limit
        ]);

        $accountId = $request->input('account_id');
        if (!$accountId) {
            $accounts = $this->mailService->getAccounts(Auth::id());
            if (empty($accounts)) {
                return response()->json(['error' => 'No accounts found'], 404);
            }
            $accountId = $accounts[0]['accountId'];
        }

        $result = $this->mailService->uploadAttachment(Auth::id(), $accountId, $request->file('file'));
        
        if (!$result) {
            return response()->json(['error' => 'Failed to upload attachment'], 500);
        }

        // Zoho returns an array of attachments even for single upload
        $attachment = is_array($result) && isset($result[0]) ? $result[0] : $result;

        return response()->json(['attachment' => $attachment]);
    }

    #[OA\Delete(
        path: "/zoho/folders/{folderId}/messages/{messageId}",
        summary: "Delete email",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        parameters: [
            new OA\Parameter(name: "folderId", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "messageId", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "account_id", in: "query", required: false, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Deleted successfully"),
            new OA\Response(response: 500, description: "Failed to delete"),
        ]
    )]
    public function deleteMessage(Request $request, $folderId, $messageId)
    {
        $accountId = $request->query('account_id');
        if (!$accountId) {
            $accounts = $this->mailService->getAccounts(Auth::id());
            if (empty($accounts)) {
                return response()->json(['error' => 'No accounts found'], 404);
            }
            $accountId = $accounts[0]['accountId'];
        }

        $result = $this->mailService->deleteMessage(Auth::id(), $accountId, $folderId, $messageId);

        if (!$result) {
            return response()->json(['error' => 'Failed to delete email'], 500);
        }

        return response()->json(['success' => true]);
    }

    #[OA\Post(
        path: "/zoho/unlink",
        summary: "Disconnect Zoho Mail",
        description: "Removes the stored Zoho OAuth tokens, disconnecting the mail integration",
        security: [["bearerAuth" => []]],
        tags: ["Zoho Mail"],
        responses: [new OA\Response(response: 200, description: "Disconnected")]
    )]
    public function unlink(Request $request)
    {
        $userId = Auth::id();
        $token = ZohoToken::where('user_id', $userId)->first();

        if ($token) {
            $token->delete();
        }

        return response()->json(['success' => true]);
    }
}
