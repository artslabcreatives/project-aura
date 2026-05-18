# Architecture Plan: Twenty CRM & Laravel SSO Integration

## Executive Summary
This document outlines the architecture to integrate **Twenty CRM** with your existing **Laravel** application using **Single Sign-On (SSO)**.

**Goal**: Seamless authentication where users log in once and access both systems based on roles, without data duplication or SDK syncing.
**Strategy**: Implement **Keycloak** as the centralized Identity Provider (IdP). Keycloak will hold the "source of truth" for identities. Both Laravel and Twenty CRM will act as clients (Relying Parties) delegating authentication to Keycloak via **OpenID Connect (OIDC)**.

---

## 1. Architecture Overview

### Components
1.  **Identity Provider (IdP)**: **Keycloak**
    *   Handles all user login, registration, and session management.
    *   Managed centralized Roles (`client-manager`, `admin`, etc.).
2.  **Service A (Existing)**: **Laravel App**
    *   Authenticates via OIDC (using Socialite).
    *   Maps Keycloak roles to local Laravel roles/permissions.
3.  **Service B (New)**: **Twenty CRM**
    *   Authenticates via OIDC (Enterprise SSO / Generic OIDC config).
    *   Maps Keycloak roles (`client-manager`) to Twenty internal roles.

### Authentication Flow (OIDC)
1.  User accesses `app.yourdomain.com` (Laravel).
2.  Laravel sees unauthenticated user -> redirects to `auth.yourdomain.com` (Keycloak).
3.  User enters credentials in Keycloak.
4.  Keycloak redirects back to Laravel with `authorization_code`.
5.  Laravel exchanges code for `access_token` and `id_token`.
6.  Laravel creates a local session (seamlessly).
7.  User clicks "CRM" link -> `crm.yourdomain.com` (Twenty).
8.  Twenty sees unauthenticated user -> redirects to Keycloak.
9.  Keycloak detects valid session (SSO) -> redirects back to Twenty immediately (No-login).
10. Twenty grants access based on `client-manager` role in the token.

---

## 2. Protocol Selection: OIDC vs SAML

**Recommendation: OpenID Connect (OIDC)**

*   **Why OIDC?**
    *   **Modern Standard**: Built on OAuth 2.0, JSON-based (JWT), easier to debug than SAML's XML.
    *   **Twenty CRM Support**: Verification confirms Twenty focuses on OIDC (Google/Msft are OIDC wrappers). Generic OIDC is supported in self-hosted environments.
    *   **Laravel Ecosystem**: Laravel Socialite makes OIDC integration trivial (plug-and-play). SAML requires heavier libraries (`aacotroneo/laravel-saml2`) and complex XML configuration.
    *   **Mobile/API Friendly**: If you ever add a mobile app, OIDC is the native standard.

---

## 3. Identity Provider Recommendation

**Choice: Keycloak**

*   **Production-Ready**: Industry standard, supports high scale, comprehensive security features.
*   **User Migration**: Supports importing existing password hashes (bcrypt/argon2) so users **do not need to reset passwords**.
*   **Role Mapping**: Excellent support for mapping roles into OIDC tokens, which is critical for your `client-manager` requirement.
*   **Self-Hosted**: Docker-ready, fits your "self-host" constraint.

*Alternative: Authentik* (Good, but Keycloak is more standardized for "Senior Architect" requirements).

---

## 4. Step-by-Step Implementation Plan

### Phase 1: Infrastructure & Deployment
**Objective**: Deploy authentication service with SSL.

1.  **Domains**:
    *   Laravel: `app.example.com`
    *   Twenty: `crm.example.com`
    *   Keycloak: `auth.example.com`
2.  **Reverse Proxy**: Use Nginx or Traefik.
    *   Ensure SSL/TLS termination for all subdomains (Critical for OIDC).
    *   Forward headers (`X-Forwarded-For`, `X-Forwarded-Proto`) correctly to Keycloak.
3.  **Deploy Keycloak**:
    *   Use standard Docker image (`quay.io/keycloak/keycloak`).
    *   Database: Postgres (Recommended).

### Phase 2: User Migration (The "No Double Login" Key)
**Objective**: Move users to Keycloak without forcing password resets.

*Constraint Check: Laravel uses `bcrypt` or `argon2` by default.*
Keycloak supports importing these hashes.

1.  **Export Users**: Write a Laravel Artisan command to export `users` table to JSON.
    *   Include: `email`, `username`, `password_hash`, `algorithm` (e.g., bcrypt), `role`.
2.  **Import to Keycloak**:
    *   Use Keycloak's "Partial Import" JSON format.
    *   Map Laravel `role` column to Keycloak **Realm Roles**.
3.  **Result**: Users can log in to `auth.example.com` using their *existing* Laravel password.

### Phase 3: Connect Laravel (as OIDC Client)
**Objective**: Replace Laravel local auth with Keycloak.

1.  **Package**: Install `socialiteproviders/keycloak`.
    ```bash
    composer require socialiteproviders/keycloak
    ```
2.  **Configuration** (`config/services.php`):
    ```php
    'keycloak' => [
        'client_id' => env('KEYCLOAK_CLIENT_ID'),
        'client_secret' => env('KEYCLOAK_CLIENT_SECRET'),
        'redirect' => env('KEYCLOAK_REDIRECT_URI'),
        'base_url' => env('KEYCLOAK_BASE_URL'), // https://auth.example.com
        'realms' => 'my-realm',
    ],
    ```
3.  **Auth Logic**:
    *   Create a `LoginController` that redirects to `Socialite::driver('keycloak')->redirect()`.
    *   Handle Callback:
        ```php
        $kcUser = Socialite::driver('keycloak')->user();
        // Find local user by email OR create if missing (JIT Provisioning)
        $user = User::updateOrCreate(
            ['email' => $kcUser->getEmail()],
            ['name' => $kcUser->getName(), 'keycloak_id' => $kcUser->getId()]
        );
        Auth::login($user); // Create local session
        ```
    *   **Role Sync**: In the callback, inspect `$kcUser->user['roles']` and update the local Laravel role if needed.

### Phase 4: Connect Twenty CRM (as OIDC Client)
**Objective**: SSO for Twenty.

1.  **Environment Config**: Configure Twenty's server variables (usually `.env` or Admin Settings).
    *   `AUTH_OIDC_ENABLED=true`
    *   `AUTH_OIDC_ISSUER=https://auth.example.com/realms/my-realm`
    *   `AUTH_OIDC_CLIENT_ID=twenty-crm`
    *   `AUTH_OIDC_CLIENT_SECRET=...`
2.  **Role Mapping**:
    *   In Keycloak, create a **Client Scope** named `roles`. Add a mapper to include "Realm Roles" in the ID Token.
    *   In Twenty, configure "SSO Role Mapping" (if available in UI) or use the default "New users are Standard/Admin" setting.
    *   *Workaround if mapping missing in UI*: Twenty's OIDC implementation should allow checking claims. If strict mapping is needed, ensure the `client-manager` group in Keycloak corresponds to a Workspace Member in Twenty.

### Phase 5: Role Constraint Implementation
**Constraint**: "Client-Manager role... access Laravel and Twenty".

1.  **Keycloak**: Create Role `client-manager`. Assign to relevant users.
2.  **Laravel**: Middleware `CheckRole` validates if `Auth::user()->role === 'client-manager'`.
3.  **Twenty**:
    *   Configuration matches OIDC users to a Workspace.
    *   *Security*: Ensure only users with `client-manager` (or `admin`) are assigned to the Twenty Client in Keycloak. You can restrict access at Keycloak level so users *without* the role cannot even log in to Twenty.

---

## 5. Security Considerations & Common Mistakes

1.  **HTTPS is Mandatory**: OIDC will fail or be insecure on HTTP.
2.  **Redirect URIs**: Whitelist *exact* URIs in Keycloak (`https://app.example.com/callback`, `https://crm.example.com/auth/callback`). Do not use wildcard `*`.
3.  **Token Lifetimes**: Set Access Token lifespan short (e.g., 5-15 mins) and Refresh Token longer.
4.  **Session Logout**: Implement **Back-Channel Logout**. When user logs out of Laravel, Laravel calls Keycloak to end session. Keycloak then notifies Twenty to kill its session.
5.  **Clock Skew**: Ensure all servers (Keycloak, App, CRM) are NTP synchronized. OIDC tokens have timestamps; drift causes login failures.

---

## 6. Summary of Workflows

| Action | User Experience | Background System |
| :--- | :--- | :--- |
| **Login** | User clicks "Login" on Laravel | Redirect to `auth.example.com`. User enters credentials once. Redirect back. |
| **Access CRM** | User clicks "CRM" link on Dashboard | Redirect to `crm.example.com`. Transparent redirect to Keycloak. Keycloak sees session. Redirect back. **Instant Access.** |
| **Role Change** | Admin promotes user to `client-manager` in Keycloak | Next login/refresh, both Laravel and Twenty receive updated role in Token. |
