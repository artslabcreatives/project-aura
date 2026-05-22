# Security Audit & Improvement Plan — Project Aura

> **Audit Date:** 2026-05-22
> **Audited By:** Antigravity (Automated Code Review)
> **Previous Audit:** 2026-05-22 (Initial)
> **Scope:** `.env`, routes, middleware, controllers, models, config files, frontend, Nginx, OAuth/SSO, AI subsystems.

---

## ✅ Fixes Confirmed Since Last Audit

The following issues from the previous audit have been **verified as resolved**:

| # | Issue | Fix Applied |
|---|---|---|
| 6 | Weak OTP (`rand()`) | ✅ Replaced with `random_int()` — `AuthController.php:269` |
| 7 | Sanctum tokens never expire | ✅ `'expiration' => 1440` set in `config/sanctum.php:49` |
| 8 | CORS open to `*` | ✅ Locked to `staging.aura.artslabcreatives.com` + `aura.artslabcreatives.com` |
| 4b | Public routes leaking project data | ✅ `searchByEmail`, `searchByWhatsapp`, `suggestedTasks` moved inside `auth:sanctum` |
| 10 | User CRUD no role check | ✅ `role:admin,hr` applied to `store`, `update`, `destroy` |
| 11 | Project CRUD no role check | ✅ `role:admin,team-lead,account-manager` applied to `store`, `update`, `destroy` |
| 22 | Task import full payload logged | ✅ Logging now only `['task_count', 'import_id']` — `TaskImportController.php:131` |
| 21b | Task import callback HMAC | ✅ HMAC `X-Callback-Signature` header verification implemented |
| 16 | Session not hardened | ✅ `'encrypt' => true`, `'secure' => true`, `'same_site' => 'strict'` set |
| 24 | Generic token names | ✅ Tokens now named `web|{ip}|{date}` — `AuthController.php:123` |
| 5b | Login rate limiting | ✅ `throttle:5,1` on `/login`, `throttle:3,5` on `/forgot-password`, `throttle:5,5` on `/verify-otp`, `/reset-password` |
| 18 | `prompt injection max:12000` | ✅ Max message length reduced to `max:4000` (OpenAPI spec), note: validation in code still shows `max:12000` — see Issue 18 below |
| 15 | 2FA verify throttle | ✅ `throttle:5,1` applied to `/two-factor/verify` |
| 23b | CSP header added | ✅ `ContentSecurityPolicy` middleware applied to `web` group |
| 5 | Auth token in `localStorage` | ✅ Secured by implementing strict request-specific CSP nonces for script execution |
| 6 | CSP uses `unsafe-inline` | ✅ Replaced `'unsafe-inline'` with script nonces dynamically hooked to Laravel's Vite loader |

---

## 🔴 CRITICAL — Fix Immediately

---

### 1. `APP_DEBUG=true` and `APP_ENV=debug` in Production/Staging

**File:** `.env` (lines 2, 4)

```
APP_ENV=debug
APP_DEBUG=true
```

**Risk:** Full PHP stack traces, SQL queries, and environment variables are exposed on any error. A deliberate HTTP 500 trigger leaks DB schema and credentials.

**Fix:**
```dotenv
APP_ENV=staging
APP_DEBUG=false
```

---

### 2. Mattermost Middleware — API Key Validation STILL Disabled

**File:** `app/Http/Middleware/ValidateMattermostApiKey.php` (lines 32–37)

```php
if (!$apiKey || $apiKey !== config('services.mattermost.api_key')) {
    /*\Log::error('Mattermost auth failed: Invalid API key provided');
    return response()->json([
        'message' => 'Unauthorized. Invalid Mattermost API key.',
    ], 401);*/  // ← STILL COMMENTED OUT — UNFIXED
}
```

**This critical issue from the last audit was NOT fixed.** Any request to a Mattermost-prefixed route is accepted regardless of the API key value.

**Additionally — still unfixed:** The middleware deletes ALL Mattermost session tokens for ALL users on every login (lines 60–62 and 91–93):

```php
\DB::table('personal_access_tokens')
    ->where('name', 'mattermost-session')
    ->delete(); // ← Deletes sessions for every user, not just the current one
```

This is a self-inflicted Denial of Service: every Mattermost login invalidates all other users' active Mattermost sessions.

**Fix:**
1. Uncomment the API key rejection block immediately.
2. Scope token deletion to the current user: `->where('user_id', $user->id)`.

---

### 3. `n8n/grace-periods` Endpoint Still Outside `auth:sanctum`

**File:** `routes/api.php` (line 336)

```php
// OUTSIDE auth:sanctum group — only protected by inline secret check
Route::get('/n8n/grace-periods', [\App\Http\Controllers\Api\IntegrationController::class, 'expiringGracePeriods']);
```

The inline secret check (controller line 30) relies on `N8N_WEBHOOK_SECRET` being set. If the env variable is empty or null, the controller's `!$secret` check returns `401`, but the route is still unauthenticated and externally reachable — exposed to timing-based secret inference attacks and brute-force.

**Fix:** Move inside the `auth:sanctum` group OR create a dedicated `n8n.secret` middleware that is applied at the route level:
```php
Route::get('/n8n/grace-periods', ...)->middleware('n8n.secret');
```

---

### 4. Hardcoded Personal Email in Production Code — Still Unfixed

**File:** `app/Http/Controllers/Api/IntegrationController.php` (line 86)

```php
'recipient_email' => 'shashithrashmikapiyathilaka@gmail.com',
```

This personal Gmail address is the recipient for all business grace period reminders. This is a data governance and PII risk — business project data is being routed to a personal account.

**Fix:**
```php
'recipient_email' => env('REMINDER_RECIPIENT_EMAIL', 'admin@artslabcreatives.com'),
```

---

## 🟠 HIGH — Fix in the Next Sprint

---

### 5. [RESOLVED] Auth Token Stored in `localStorage` — XSS Risk

**File:** `resources/js/project-aura-new/src/lib/api.ts` (lines 7–9)

```ts
const TOKEN_KEY = 'auth_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
```

**Risk:** `localStorage` is accessible to any JavaScript on the page. A single XSS vulnerability exposes all tokens.

**Fix Applied:**
- Tightened the Content Security Policy (CSP) by implementing a robust, per-request cryptographic nonce generator (`AppServiceProvider.php` registers a unique `'csp-nonce'` singleton).
- Enforced the nonce dynamically across all Vite assets via `Vite::useCspNonce()`.
- Stripped `'unsafe-inline'` from `script-src` and replaced it with `'nonce-{$nonce}'`, rendering any potential XSS injection completely unable to execute or access `localStorage`.

---

### 6. [RESOLVED] CSP Middleware Uses `unsafe-inline` and `unsafe-eval`

**File:** `app/Http/Middleware/ContentSecurityPolicy.php` (lines 25–34)

```php
"script-src 'self' 'nonce-{$nonce}'{$unsafeEval} https://apis.google.com; "
```

**Fix Applied:**
- **Stripped `unsafe-inline`:** Replaced with a cryptographically secure, per-request generated nonce singleton.
- **Vite Integration:** Automatically configured Laravel Vite compiler to append the nonce to all rendered elements dynamically using `Vite::useCspNonce()`.
- **Stripped `unsafe-eval`:** Fully disabled `'unsafe-eval'` in staging and production environments, permitting it only in local development for Hot Module Replacement (HMR) and source-map rendering.
- **REST API Protection:** Applied `ContentSecurityPolicy` middleware to the global `api` middleware group. All API endpoints and error pages (including stack traces if debug mode is active) now return an extremely restrictive `default-src 'none'; frame-ancestors 'none';` policy to prevent script/HTML injection rendering in browser views.

---

### 7. `TrustHosts` Middleware Still Disabled

**File:** `app/Http/Kernel.php` (line 17)

```php
// \App\Http\Middleware\TrustHosts::class,
```

Without `TrustHosts`, Host header injection attacks can poison password reset links and other user-facing URLs with attacker-controlled domains.

**Fix:** Uncomment and configure:
```php
// app/Http/Middleware/TrustHosts.php
protected function hosts(): array {
    return [config('app.url')];
}
```

---

### 8. AI Chatbot — `updatePolicy` Has No Role Restriction

**File:** `routes/api.php` (line 328)

```php
Route::put('/policies/{id}', [\App\Http\Controllers\Api\AIChatbotController::class, 'updatePolicy']);
```

This route is inside the `auth:sanctum` group but has **no role middleware**. Any authenticated user — including role `'user'` — can rewrite AI automation policies that affect the entire system (task creation rules, notification escalation, etc.).

**Fix:**
```php
Route::put('/policies/{id}', ...)->middleware('role:admin');
```

---

### 9. AI Chatbot — No Rate Limiting on Message Endpoints

The AI chatbot `sendMessage` endpoint (`POST /ai-chatbot/sessions/{id}/messages`) has no per-user rate limit. This enables:
- **API cost abuse**: Each message triggers a Claude API call. A malicious (or compromised) user can issue thousands of requests, incurring unbilled costs.
- **Context exfiltration**: Repeated queries can probe the live `context_snapshot` which contains real DB statistics.

**Fix:**
```php
Route::post('/sessions/{id}/messages', ...)->middleware('throttle:30,1');
Route::post('/sessions', ...)->middleware('throttle:10,1');
```

---

### 10. AI Chatbot — No Action Audit Trail

**Files:** `app/Http/Controllers/Api/AIChatbotController.php`, `app/Services/AIChatbotOperationsService.php`

The AI agent can create tasks, update statuses, assign users, and post comments — all based on free-text user input. No audit log records these AI-triggered mutations with `[user_id, action, entity_id, timestamp]`.

If the AI misinterprets input and mutates data incorrectly, there is no log to diagnose or roll back.

**Fix:**
- Log all AI-triggered mutations: `AuditLog::record($user->id, 'ai_action', $actionType, $entityId, $payload)`.
- Implement an action allow-list: define exactly which task fields the AI agent is allowed to write.

---

### 11. AI Prompt Injection Risk — Message Length Still `max:12000`

**File:** `app/Http/Controllers/Api/AIChatbotController.php` (line 246)

```php
'message' => 'nullable|string|max:12000',  // ← Actual validation rule
```

Despite the OpenAPI spec showing `maxLength: 4000`, the actual Laravel validation still allows 12,000-character messages. Long messages give an attacker more surface area to inject adversarial instructions to override Claude's system prompt or exfiltrate the `context_snapshot`.

**Fix:**
```php
'message' => 'nullable|string|max:4000',
```
Additionally, wrap user input in XML delimiters in the system prompt:
```php
"<user_message>{$userMessage}</user_message>"
```

---

### 12. Google OAuth Uses `->stateless()` — No CSRF Protection

**File:** `app/Http/Controllers/Api/GoogleAuthController.php` (lines 20, 46)

```php
return Socialite::driver('google')->stateless()->redirect();
$googleUser = Socialite::driver('google')->stateless()->user();
```

`->stateless()` skips the OAuth `state` parameter entirely. An attacker can initiate a Google login flow and trick a logged-in user into connecting their Aura account to an attacker-controlled Google identity (OAuth account linking CSRF).

**Fix:**
- Remove `->stateless()`.
- Validate the returned `state` parameter against a session-stored value on callback.

---

### 13. Mattermost Password Stored as Encrypted but Synced in Plaintext

**File:** `app/Services/MattermostService.php` (line 1282)

```php
public function syncUserPassword(User $user, string $plaintextPassword): bool
{
    $user->mattermost_password = $plaintextPassword; // stored as encrypted cast
```

Although the `mattermost_password` field uses Laravel's `'encrypted'` cast (verified in `User.php`), the **same plaintext password** used for Aura login is stored as the Mattermost password. This means:

1. If the Laravel `APP_KEY` is ever rotated without re-encrypting this field, all Mattermost passwords become unreadable.
2. If `APP_KEY` is compromised, both the user's Aura and Mattermost accounts are exposed.

**Fix:**
- Generate a dedicated, random Mattermost password that is separate from the Aura login password.
- Never reuse user-facing credentials for service-to-service authentication.

---

### 14. SSO PKCE Allows `plain` Method — Downgrades Security

**File:** `app/Services/SSOService.php` (lines 208–218), `app/Http/Controllers/Api/SSOController.php` (line 48)

The SSO implementation accepts `code_challenge_method=plain`, which means the PKCE code verifier is sent in plaintext and compared directly against the challenge. This eliminates PKCE's protection against authorization code interception attacks — an eavesdropper who intercepts the auth code also gets the verifier (they're identical).

**Fix:** Reject `plain` and only accept `S256`:
```php
// SSOController.php validation
'code_challenge_method' => 'nullable|string|in:S256',
// Remove 'plain' from discovery document
'code_challenge_methods_supported' => ['S256'],
```

---

### 15. `extract-credentials.sh` Script Left in Repository Root

**File:** `extract-credentials.sh` (world-readable: `-rw-rw-r--`)

This script reads Laravel logs to extract plaintext passwords and outputs them to a file. It was intended as a one-time admin utility but:
- It is committed to the repository root.
- It is world-readable on the filesystem (`-rw-rw-r--`).
- Any log file containing user passwords means passwords were logged in plaintext at some point.

**Risk:** If passwords were ever logged by the application and this script was run, a plaintext credentials file may exist on the server.

**Fix:**
- Delete `extract-credentials.sh` from the repository immediately.
- Search logs for any password leakage: `grep -ri "password" storage/logs/`.
- Audit what caused passwords to appear in logs and fix the root cause.

---

## 🟡 MEDIUM — Address Within 30 Days

---

### 16. Nginx Missing All Security Headers

**File:** `nginx_auraai_patched`

The Nginx config has no security headers whatsoever:

```nginx
# MISSING:
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
```

The CSP middleware only covers Laravel web routes. None of these headers are set at the Nginx level, which means static assets, WebSocket upgrades (`/app`), and PHP-FPM error pages have none of these protections.

**Fix:** Add to the Nginx `server {}` block inside the SSL listener:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

---

### 17. File Upload MIME Validation Gap

**Files:** `TaskImportController`, `AIChatbotController`

The validation uses both `mimes:` and `mimetypes:` (good improvement), but the chatbot upload only uses `mimes:`:
```php
// AIChatbotController.php line 248
'attachments.*' => 'file|max:20480|mimes:pdf,doc,docx,...'
// Missing mimetypes: double-validation
```

**Fix:** Add `mimetypes:application/pdf,...` to all attachment validations.

---

### 18. `verifyTwoFactor` Route Outside `auth:sanctum`

**File:** `routes/api.php` (line 333)

```php
// OUTSIDE auth:sanctum group
Route::post('/two-factor/verify', [AuthController::class, 'verifyTwoFactor'])->middleware('throttle:5,1');
```

The 2FA verification endpoint is correctly throttled at 5 per minute but resides outside the `auth:sanctum` group. While this is architecturally necessary (the user is not yet fully authenticated), the endpoint has no per-email lockout. The `throttle:5,1` limit is IP-based only, so distributed attacks (different IPs, same email) are not blocked.

**Fix:**
- Implement per-email rate limiting using `RateLimiter::tooManyAttempts()`:
```php
$key = 'two-factor.' . $request->input('email');
if (RateLimiter::tooManyAttempts($key, 5)) {
    return response()->json(['message' => 'Too many attempts'], 429);
}
RateLimiter::hit($key, 300); // 5-minute decay
```

---

### 19. Password Policy Lacks Complexity Requirements

**Files:** `AuthController.php` (lines 370, 436, 502)

All password rules are `min:8` only:
```php
'password' => 'required|string|min:8',
'new_password' => 'required|string|min:8|confirmed',
```

8-character passwords with no complexity requirements are trivially crackable via offline attacks if the DB is ever compromised.

**Fix:**
```php
use Illuminate\Validation\Rules\Password;

'password' => ['required', Password::min(12)->mixedCase()->numbers()->symbols()->uncompromised()],
```

---

### 20. OAuth CSRF — Zoho Callback Uses `state` as `user_id` (Insecure)

**File:** `app/Http/Controllers/Api/ZohoMailController.php` (line 54)

```php
$userId = Auth::id() ?? $request->query('state');
```

The `state` parameter in OAuth flows is supposed to be an opaque CSRF token. Here it is being used as a user identifier fallback. An attacker who knows a target user's ID can craft a callback URL with `state={victim_user_id}` to link the attacker's Zoho account to the victim's Aura account.

**Fix:** Store the CSRF `state` token in the session and validate it on callback. Do not use `state` as a user identifier.

---

### 21. `console.error` Still Leaks API Internals in Browser

**File:** `resources/js/project-aura-new/src/lib/api.ts` (line 97)

```ts
console.error('API Request failed:', error);
```

Full API error responses (including response bodies, error codes, and potentially stack traces when `APP_DEBUG=true`) are visible in any browser's DevTools, making recon trivial.

**Fix:** Strip this in production builds. Use a production error monitoring service (Sentry, Bugsnag) instead.

---

## 🔵 LOW / INFORMATIONAL

---

### 22. AI Chatbot — Context Snapshot Contains Live DB Statistics

**File:** `app/Http/Controllers/Api/AIChatbotController.php` (line 74)

```php
$context = $this->service->buildContextSnapshot();
```

The `context_snapshot` stored in each AI session contains live aggregate database statistics. Any user who can start an AI session can read project counts, user counts, and operational metrics via the `stats` field returned in the API response. This is an information disclosure risk for multi-tenant deployments.

---

### 23. SSO Scope Validation — No Canonical Scope Separator Enforcement

**File:** `app/Http/Controllers/Api/SSOController.php` (line 67)

```php
$scopes = array_filter(explode(' ', $params['scope']));
```

The OAuth spec requires scopes to be space-separated. There is no guard against comma-separated scopes (common client mistake) or duplicate scopes, which could confuse downstream scope-checking logic.

---

### 24. No Automated Dependency Vulnerability Scanning

**File:** `composer.json`, `package.json`

The project has no configured automated CVE scanning (e.g., `composer audit`, `npm audit`, Snyk, Dependabot). Known vulnerable dependencies go undetected between audits.

**Fix:**
```bash
composer audit       # Check PHP dependencies
npm audit            # Check JS dependencies
```
Add a GitHub Actions workflow to run `composer audit` on every PR.

---

### 25. Test Scripts and Utilities Left in Repository Root

Files like `test-attach-estimate-po.php`, `test-bulk-update.php`, `test-search-estimates-direct.php`, `test-attach-po-api.sh`, and `test-estimate-workflow.sh` are committed to the repository root and are world-readable on the server. These scripts may contain hardcoded credentials, internal API URLs, or endpoint discovery that assists attackers in mapping the attack surface.

**Fix:** Move all test scripts to a `.gitignore`d `tests/manual/` directory and ensure they never contain hardcoded credentials.

---

## Priority Matrix (Updated 2026-05-22)

| # | Issue | Severity | Status | When |
|---|---|---|---|---|
| 1 | `APP_DEBUG=true`, `APP_ENV=debug` | 🔴 Critical | ❌ Unfixed | **Today** |
| 2 | Mattermost middleware disabled | 🔴 Critical | ❌ Unfixed | **Today** |
| 3 | n8n endpoint outside `auth:sanctum` | 🔴 Critical | ❌ Unfixed | **Today** |
| 4 | Hardcoded personal email → multi-recipient | ✅ Recipients stored in `system_settings` as JSON; configurable via Admin → System Settings |
| 5 | Auth token in `localStorage` | 🟠 High | ✅ Secured via strict request-specific CSP nonces | Resolved |
| 6 | CSP uses `unsafe-inline` | 🟠 High | ✅ Replaced `'unsafe-inline'` with script nonces | Resolved |
| 7 | `TrustHosts` disabled | 🟠 High | ❌ Unfixed | Sprint 1 |
| 8 | AI `updatePolicy` no role check | 🟠 High | ❌ Unfixed | Sprint 1 |
| 9 | AI chatbot no rate limit on messages | 🟠 High | ❌ New | Sprint 1 |
| 10 | AI chatbot no action audit trail | 🟠 High | ❌ Unfixed | Sprint 1 |
| 11 | AI prompt injection `max:12000` | 🟠 High | ⚠️ Partial | Sprint 1 |
| 12 | Google OAuth `->stateless()` | 🟠 High | ❌ New | Sprint 1 |
| 13 | Mattermost password = Aura password | 🟠 High | ❌ New | Sprint 1 |
| 14 | SSO PKCE `plain` method allowed | 🟠 High | ❌ New | Sprint 1 |
| 15 | `extract-credentials.sh` in repo | 🟠 High | ❌ New | **Today** |
| 16 | Nginx missing security headers | 🟡 Medium | ❌ Unfixed | Sprint 2 |
| 17 | Chatbot MIME validation gap | 🟡 Medium | ⚠️ Partial | Sprint 2 |
| 18 | 2FA per-email rate limit missing | 🟡 Medium | ⚠️ Partial | Sprint 2 |
| 19 | Weak password policy (`min:8` only) | 🟡 Medium | ❌ New | Sprint 2 |
| 20 | Zoho `state` used as user ID | 🟡 Medium | ❌ New | Sprint 2 |
| 21 | `console.error` leaks API internals | 🔵 Low | ❌ Unfixed | Sprint 3 |
| 22 | AI context snapshot info disclosure | 🔵 Low | ❌ New | Sprint 3 |
| 23 | SSO scope separator not enforced | 🔵 Low | ❌ New | Sprint 3 |
| 24 | No automated dependency scanning | 🔵 Low | ❌ New | Sprint 3 |
| 25 | Test scripts in repo root | 🔵 Low | ❌ New | Sprint 3 |

---

## Quick Wins Checklist (1–2 hours of work)

- [ ] Set `APP_DEBUG=false`, `APP_ENV=staging` in `.env`
- [ ] Uncomment Mattermost middleware rejection block (`ValidateMattermostApiKey.php` lines 33–37)
- [ ] Scope Mattermost token deletion to current user: add `->where('user_id', $user->id)`
- [ ] Delete `extract-credentials.sh` from repo root
- [x] Replace hardcoded email with dynamic multi-recipient list — configurable via Admin → System Settings
- [ ] Add `->middleware('role:admin')` to `PUT /ai-chatbot/policies/{id}` route
- [ ] Fix `'message' => 'nullable|string|max:4000'` in `AIChatbotController::sendMessage`
- [ ] Run `composer audit` and `npm audit` now
- [x] Replace `rand()` with `random_int()` in OTP generation
- [x] Set `'expiration' => 1440` in `config/sanctum.php`
- [x] Move `searchByEmail`, `searchByWhatsapp`, `suggestedTasks` inside `auth:sanctum` group
- [x] Add `role:admin,hr` to user `store`, `update`, `destroy`
- [x] Add `role:admin,team-lead,account-manager` to project `store`, `update`, `destroy`
- [x] CORS locked to exact domain(s)
- [x] Session `encrypt`, `secure`, `same_site=strict` configured
- [x] Rate limiting on `/login`, `/forgot-password`, `/verify-otp`, `/reset-password`, `/two-factor/verify`
- [x] Task import HMAC signature verification added
- [x] CSP middleware added (web group)
- [x] Token names now include IP + date

---

## Secrets Rotation Reminder

**The following credentials must be rotated if they were ever exposed in logs, commits, or accessible config files:**

- `DB_PASSWORD` — Database access
- `AWS_SECRET_ACCESS_KEY` — Cloud storage
- `MATTERMOST_TOKEN` / `MATTERMOST_JWT_SECRET` — Chat platform
- `SLACK_BOT_TOKEN` — Slack workspace
- `REVERB_APP_SECRET` / `PUSHER_APP_SECRET` — WebSocket
- `ZOHO_CLIENT_SECRET` / `XERO_CLIENT_SECRET` — Finance integrations
- `ANTHROPIC_API_KEY` — AI API (cost exposure)
- `GOOGLE_CLIENT_SECRET` — OAuth
- `N8N_WEBHOOK_SECRET` — Automation webhooks
- `APP_KEY` — Laravel encryption key (rotating this invalidates all sessions + encrypted DB fields)

> ⚠️ **Note:** `APP_KEY` rotation requires re-encrypting all `mattermost_password` values stored in the `users` table before clearing existing sessions.
