# Security Audit & Improvement Plan — Project Aura

> Comprehensive analysis of all layers: `.env`, routes, middleware, controllers, models, and frontend.

---

## 🔴 CRITICAL — Fix Immediately

---

### 1. `.env` File Contains Plaintext Production Secrets (Committed / Exposed)

**File:** `.env`

The `.env` file contains live, plaintext credentials for every major service:

| Secret | Risk |
|---|---|
| DB Password | Full database access |
| AWS S3 Secret | Cloud storage access/deletion |
| Mattermost Token | Read/write all messages |
| Mattermost JWT Secret | Forge auth tokens |
| Slack Bot Token | Full Slack workspace access |
| Reverb / Pusher Secrets | WebSocket hijacking |
| Zoho / Xero Secrets | Finance system access |
| Claude API Key | Unbilled AI API usage |
| Google OAuth Secret | OAuth impersonation |
| N8N Webhook Secret: `miyuru2026` | **Trivially guessable** |

**Risk:** Anyone with server access or who finds the `.env` in logs/backups can compromise every integrated service.

**Fix Plan:**
- Rotate ALL secrets immediately after reading this audit.
- Move secrets to a vault (HashiCorp Vault, AWS Secrets Manager).
- Ensure `.env` is in `.gitignore` and NEVER committed.
- Set `APP_ENV=production`, `APP_DEBUG=false` (currently `APP_ENV=debug`, `APP_DEBUG=true`).

---

### 2. `APP_DEBUG=true` in Production/Staging

**File:** `.env` (line 4)

```
APP_DEBUG=true
```

**Risk:** Full stack traces, SQL queries, and environment variables are exposed to end users on any error. A deliberate 500 error trigger leaks DB structure and credentials.

**Fix:** Set `APP_DEBUG=false` in staging and production.

---

### 3. Mattermost Middleware — API Key Validation is DISABLED (Commented Out)

**File:** `app/Http/Middleware/ValidateMattermostApiKey.php` (lines 33–37)

```php
if (!$apiKey || $apiKey !== config('services.mattermost.api_key')) {
    /*\Log::error('...');
    return response()->json([
        'message' => 'Unauthorized. Invalid Mattermost API key.',
    ], 401);*/  // ← ENTIRE BLOCK IS COMMENTED OUT
}
```

**Risk:** The `mattermost.api-key` middleware does NOT reject invalid or missing API keys. Any user who knows the `/mattermost/` prefix can authenticate as ANY user by passing their `mattermost_user_id` in the URL with no key — **unauthenticated user impersonation**.

**Additionally:** The middleware deletes ALL Mattermost session tokens for ALL users when a new one is created — a self-inflicted DoS on every login.

**Fix:**
- Uncomment the authentication rejection block immediately.
- Scope token deletion to the current user only: `->where('user_id', $user->id)`.

---

### 4. Public Routes Expose Project/User Data Without Authentication

**File:** `routes/api.php` (lines 59–70)

These routes are **outside** the `auth:sanctum` middleware group:

```php
Route::get('projects/{project}/suggested-tasks', ...);
Route::post('projects/{project}/suggested-tasks', ...);
Route::get('projects/search/email', ...);
Route::get('projects/search/whatsapp', ...);
Route::get('users/search/exist', ...);
Route::get('/users/{user}/avatar', ...);
Route::post('/task-import-callback', ...);
Route::post('/ai-chatbot/mattermost/webhook', ...);
```

**Specific Risks:**
- `GET /api/projects/search/email?email=x@x.com` → Full project + task data, no login.
- `GET /api/projects/search/whatsapp?group_id=X` → Full project + task data, no login.
- `GET /api/users/search/exist?email=x@x.com` → Unauthenticated user enumeration.
- Task import callback: secret is in the request body (not a header), trivially replayable.

**Fix:**
- Move `searchByEmail`, `searchByWhatsapp`, `suggestedTasks` behind `auth:sanctum`.
- Rate-limit `users/search/exist` and `check-email`.
- Secure the task import callback with a header-based HMAC signature.

---

### 5. No Rate Limiting on Authentication Endpoints

**File:** `routes/api.php`, `app/Http/Kernel.php`

The API group throttle is **60 requests per minute per IP** — easily bypassed. No extra throttling on:

- `POST /api/login`
- `POST /api/forgot-password`
- `POST /api/verify-otp`
- `POST /api/reset-password`
- `POST /api/check-email`
- `POST /api/two-factor/verify`

**Risk:** Brute-force attacks. A 6-digit OTP has 1,000,000 combinations — at 60/min, crackable in ~11.5 days from one IP. Distributed across many IPs, it's crackable in seconds.

**Fix:**
```php
Route::post('/login', ...)->middleware('throttle:5,1');
Route::post('/forgot-password', ...)->middleware('throttle:3,5');
Route::post('/verify-otp', ...)->middleware('throttle:5,5');
```
- Add account lockout after N consecutive failures (store counter in cache keyed by email).
- Implement per-email rate limiting, not just per-IP.

---

### 6. OTP is Cryptographically Weak

**File:** `app/Http/Controllers/Api/AuthController.php` (line 269)

```php
$otp = (string) rand(100000, 999999);
```

`rand()` is not a CSPRNG (Cryptographically Secure Pseudo-Random Number Generator). In some environments, the seed can be predicted.

**Fix:**
```php
$otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
```

---

## 🟠 HIGH — Fix in the Next Sprint

---

### 7. Sanctum Tokens Never Expire

**File:** `config/sanctum.php` (line 49)

```php
'expiration' => null,
```

**Risk:** Stolen tokens are valid forever. No expiry = no time-bound damage limitation.

**Fix:** Set a reasonable expiry: `'expiration' => 1440` (24 hours).

---

### 8. Auth Token Stored in `localStorage` — XSS Risk

**File:** `resources/js/project-aura-new/src/lib/api.ts` (lines 7–9)

```ts
const TOKEN_KEY = 'auth_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
```

**Risk:** `localStorage` is accessible to any JavaScript on the page. One XSS vulnerability anywhere (user-generated content, third-party scripts, markdown rendering) exposes all tokens.

**Fix:**
- Store tokens in `HttpOnly` cookies (not accessible to JavaScript).
- If `localStorage` is kept short-term, implement a strict Content Security Policy (CSP).

---

### 9. CORS Policy is Fully Open

**File:** `config/cors.php` (line 22)

```php
'allowed_origins' => ['*'],
'supports_credentials' => true,
```

`'*'` + `supports_credentials: true` is a CORS misconfiguration. Browsers block this, but if ever corrected carelessly, it enables cross-site authenticated requests.

**Fix:**
```php
'allowed_origins' => ['https://staging.aura.artslabcreatives.com'],
```

---

### 10. Any Authenticated User Can Create/Delete Users and Change Roles (Privilege Escalation)

**File:** `app/Http/Controllers/Api/UserController.php` (lines 132–353)

The `store`, `update`, and `destroy` methods have no role checks. Any logged-in user can:
- `POST /api/users` → Create a new admin account.
- `PUT /api/users/{id}` → Promote themselves to admin.
- `DELETE /api/users/{id}` → Delete any user.

**Fix:**
```php
Route::apiResource('users', UserController::class)->middleware('role:admin,hr');
```

---

### 11. Any Authenticated User Can Create, Update, and Delete Projects

**File:** `app/Http/Controllers/Api/ProjectController.php` — `store`, `update`, `destroy`

No role check prevents a `role: 'user'` account from:
- Creating projects.
- Deleting projects.
- Changing financial fields (`budget_allocated`, `po_number`, `is_internal_project`).

**Fix:** Gate project mutation behind `role:admin,team-lead,account-manager`.

---

### 12. `n8n/grace-periods` Has No Auth Middleware

**File:** `routes/api.php` (line 333)

```php
// OUTSIDE auth:sanctum group
Route::get('/n8n/grace-periods', [IntegrationController::class, 'expiringGracePeriods']);
```

If `N8N_WEBHOOK_SECRET` is empty or null, the controller's check passes with any token. Exposes sensitive project financial data.

**Fix:** Move inside the `auth:sanctum` group, or implement a dedicated `n8n.secret` middleware instead of inline controller validation.

---

### 13. AI Chatbot — No Scope Limitation or Audit Trail

**File:** `app/Http/Controllers/Api/AIChatbotController.php`

- The `operations` mode lets AI perform **real database mutations** (create tasks, update statuses, assign users) based on free-text user input.
- `updatePolicy` (PUT `/ai-chatbot/policies/{id}`) has **no role restriction** — any user can rewrite AI policies.
- No per-action audit log exists.

**Fix:**
- Restrict `updatePolicy` to admin only.
- Log all AI-triggered mutations with `[user_id, action, entity_id, timestamp]`.
- Implement an action allow-list for what the AI agent can do.

---

### 14. Hardcoded Personal Email in Production Code

**File:** `app/Http/Controllers/Api/IntegrationController.php` (line 86)

```php
'recipient_email' => 'shashithrashmikapiyathilaka@gmail.com',
```

Business reminder data is being sent to a personal Gmail. This is a data governance risk.

**Fix:** Move to `env('REMINDER_RECIPIENT_EMAIL', 'admin@yourdomain.com')`.

---

## 🟡 MEDIUM — Address Within 30 Days

---

### 15. 2FA: No Rate Limiting on OTP/Recovery Code Guessing

**File:** `app/Http/Controllers/Api/AuthController.php` (lines 69–93)

No brute-force protection on `two_factor_code` or `two_factor_recovery_code`. An attacker with a valid password can cycle through TOTP windows.

**Fix:** Apply `throttle:5,1` per email to the `verifyTwoFactor` route.

---

### 16. File Upload MIME Validation Gap

**Files:** `TaskImportController`, `DocumentController`, `ProjectController`

```php
'file' => 'required|file|mimes:pdf,doc,...'
```

`mimes:` checks both extension and magic bytes, but doesn't prevent all polyglot file attacks. Uploads to S3 mitigate execution risk, but malicious payloads could be stored.

**Fix:** Add `mimetypes:application/pdf,...` alongside `mimes:` for double validation. Ensure no uploads go to the web-accessible `public/` folder.

---

### 17. Session Security Not Hardened

**File:** `config/session.php`

```php
'secure' => env('SESSION_SECURE_COOKIE'),  // Defaults to null = false
'encrypt' => false,
'same_site' => 'lax',
```

**Fix:**
```php
'secure' => true,
'encrypt' => true,
'same_site' => 'strict',
```

---

### 18. AI Prompt Injection Risk

**File:** `app/Http/Controllers/Api/AIChatbotController.php` (line 264)

User messages are passed directly to Claude with the full system context. A crafted message can override instructions or exfiltrate the `context_snapshot` (which contains live DB statistics and project data).

**Fix:**
- Use XML-delimited user input in the system prompt: `<user_message>{$userMessage}</user_message>`.
- Reduce `max:12000` message length to `max:4000`.
- Never include sensitive data counts directly in the context visible to user-injected content.

---

### 19. `TrustHosts` Middleware is Disabled

**File:** `app/Http/Kernel.php` (line 17)

```php
// \App\Http\Middleware\TrustHosts::class,
```

Without `TrustHosts`, Host header injection attacks can poison password reset links with malicious domains.

**Fix:** Uncomment and configure:
```php
protected function hosts(): array {
    return [config('app.url')];
}
```

---

### 20. OAuth CSRF — No `state` Parameter Validated in Zoho/Xero Callbacks

**File:** `routes/api.php` (lines 65–66)

Zoho and Xero OAuth flows lack `state` parameter validation. An attacker can trick a logged-in user into connecting their Aura account to an attacker-controlled OAuth account.

**Fix:** Generate a CSRF `state` token, store in session, and validate on callback.

---

## 🔵 LOW / INFORMATIONAL

---

### 21. Full Task Payloads Logged at INFO Level

**File:** `app/Http/Controllers/Api/TaskImportController.php` (line 114)

```php
Log::info('TaskImport: callback received', ['tasks' => $tasks]);
```

Full business data (potentially with PII) is logged. Logs may be stored insecurely.

**Fix:** Log only `['task_count' => count($tasks), 'import_id' => $importId]`.

---

### 22. `console.error` Leaks API Internals in Browser

**File:** `resources/js/project-aura-new/src/lib/api.ts` (line 97)

```ts
console.error('API Request failed:', error);
```

Full API error responses visible in browser DevTools.

**Fix:** Remove in production builds. Use Sentry or similar for error monitoring.

---

### 23. No HTTP Security Headers in Nginx

Review `nginx_auraai_patched` and ensure these headers are present:

```nginx
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; ...";
```

---

### 24. Generic Token Names

**File:** `app/Http/Controllers/Api/AuthController.php` (line 123)

```php
$token = $user->createToken('auth-token')->plainTextToken;
```

All tokens are identical in name — impossible to audit, identify, or revoke per device.

**Fix:**
```php
$user->createToken('web|' . request()->ip() . '|' . now()->toDateString())
```

---

## Priority Matrix

| # | Issue | Severity | Effort | When |
|---|---|---|---|---|
| 1 | `.env` secrets / `APP_DEBUG=true` | 🔴 Critical | Low | **Today** |
| 2 | Mattermost middleware disabled | 🔴 Critical | Low | **Today** |
| 3 | Public routes leaking data | 🔴 Critical | Low | **Today** |
| 4 | No rate limiting on auth | 🔴 Critical | Low | **Today** |
| 5 | Weak OTP (`rand()`) | 🔴 Critical | Low | **Today** |
| 6 | Tokens never expire | 🟠 High | Low | Sprint 1 |
| 7 | Token in localStorage (XSS) | 🟠 High | High | Sprint 1 |
| 8 | CORS open to `*` | 🟠 High | Low | Sprint 1 |
| 9 | User CRUD no role check | 🟠 High | Low | Sprint 1 |
| 10 | Project CRUD no role check | 🟠 High | Low | Sprint 1 |
| 11 | n8n endpoint outside auth | 🟠 High | Low | Sprint 1 |
| 12 | AI chatbot no audit/scope | 🟠 High | Medium | Sprint 2 |
| 13 | Hardcoded email | 🟠 High | Low | Sprint 1 |
| 14 | 2FA OTP no rate limit | 🟡 Medium | Low | Sprint 2 |
| 15 | File MIME validation gap | 🟡 Medium | Low | Sprint 2 |
| 16 | Session not hardened | 🟡 Medium | Low | Sprint 2 |
| 17 | AI prompt injection | 🟡 Medium | Medium | Sprint 2 |
| 18 | TrustHosts disabled | 🟡 Medium | Low | Sprint 2 |
| 19 | OAuth CSRF state missing | 🟡 Medium | Medium | Sprint 2 |
| 20 | Sensitive data in logs | 🔵 Low | Low | Sprint 3 |
| 21 | No security headers | 🔵 Low | Low | Sprint 3 |
| 22 | Generic token names | 🔵 Low | Low | Sprint 3 |

---

## Quick Wins Checklist (1–2 hours of work)

- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Uncomment Mattermost middleware rejection block (`ValidateMattermostApiKey.php` lines 33–37)
- [x] Replace `rand()` with `random_int()` in OTP generation
- [ ] Add `->middleware('throttle:5,1')` to `/login`, `/forgot-password`, `/verify-otp`
- [x] Change `'allowed_origins' => ['*']` to your exact domain in `cors.php`
- [x] Set `'expiration' => 1440` in `config/sanctum.php`
- [x] Move `searchByEmail`, `searchByWhatsapp`, `suggestedTasks` inside `auth:sanctum` group
- [x] Add `->middleware('role:admin,hr')` to user `store`, `update`, `destroy`
- [ ] Replace hardcoded email with `env('REMINDER_RECIPIENT_EMAIL')` in `IntegrationController`
- [ ] Set `'secure' => true`, `'encrypt' => true` in `config/session.php`
- [ ] Rotate ALL credentials in `.env` (DB, AWS, Mattermost, Slack, Zoho, Xero, Claude, Google)
