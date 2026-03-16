<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\ZohoAuthService;
use App\Services\ZohoMailService;
use App\Models\ZohoToken;

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
        $token = ZohoToken::where('user_id', Auth::id())->first();
        return response()->json([
            'connected' => !!$token,
            'email' => $token ? $token->zoho_user_account_id : null
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

        $content = $this->mailService->getMessageBody(Auth::id(), $accountId, $folderId, $messageId);
        return response()->json(['content' => $content]);
    }

    public function sendMessage(Request $request)
    {
        $accountId = $request->input('account_id');
        if (!$accountId) {
            $accounts = $this->mailService->getAccounts(Auth::id());
            if (empty($accounts)) {
                return response()->json(['error' => 'No accounts found'], 404);
            }
            $accountId = $accounts[0]['accountId'];
        }

        $result = $this->mailService->sendMessage(Auth::id(), $accountId, $request->all());
        return response()->json(['result' => $result]);
    }
}
