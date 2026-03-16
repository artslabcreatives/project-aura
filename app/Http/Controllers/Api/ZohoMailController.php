<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\ZohoAuthService;
use App\Services\ZohoMailService;
use App\Models\ZohoToken;
use Illuminate\Support\Facades\Log;

class ZohoMailController extends Controller
{
    protected $authService;
    protected $mailService;

    public function __construct(ZohoAuthService $authService, ZohoMailService $mailService)
    {
        $this->authService = $authService;
        $this->mailService = $mailService;
    }

    public function getAuthUrl()
    {
        return response()->json([
            'url' => $this->authService->getAuthUrl(Auth::id())
        ]);
    }

    public function handleCallback(Request $request)
    {
        $code = $request->query('code');
        $userId = Auth::id() ?? $request->query('state');

        if (!$code) {
            return response()->json(['error' => 'No code provided'], 400);
        }

        $token = $this->authService->exchangeCodeForTokens($code, $userId);

        if (!$token) {
            return response()->json(['error' => 'Failed to exchange token'], 500);
        }

        return redirect()->away(config('app.url') . '/emails?connection=success');
    }

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
}
