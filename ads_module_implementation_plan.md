# Ads Module & Analytics Integration Plan

This document outlines a **6-week implementation plan** to build a centralized Ads & Analytics module. Based on your requirements, the system will feature strict Admin-controlled access via email whitelisting, allow users to create Client Profiles, and let them connect multiple ad accounts (Google, TikTok, LinkedIn, SEMrush) to each profile for unified reporting.

---

## 🏗️ Core Workflow & Architecture

1. **Admin Access Control:** A backend interface where the Admin can whitelist specific user emails. Only these users will see the "Ads Module" in their frontend sidebar.
2. **Client Profiles:** Whitelisted users can create multiple profiles (e.g., "Client A", "Client B").
3. **OAuth 2.0 Connection Manager:** Inside a Client Profile, the user can authenticate and connect multiple ad platforms (Google, TikTok, LinkedIn).
4. **Unified Data Dashboard:** When viewing a Client Profile, the dashboard aggregates metrics (Spend, Impressions, Clicks, CPC, etc.) from all connected accounts into a single, unified view.

### Database Schema Additions
*   `ads_module_access`: Stores whitelisted emails (`email`).
*   `ad_profiles`: Stores the client profiles created by users (`id`, `user_id`, `client_name`).
*   `ad_connections`: Stores the OAuth tokens linked to a specific profile (`id`, `ad_profile_id`, `platform`, `account_id`, `access_token`, `refresh_token`).
*   `ad_metrics`: Stores daily synced data (`date`, `ad_connection_id`, `spend`, `impressions`, `clicks`, `conversions`).

---

## 📅 Timeline & Phases (6 Weeks)

### Phase 1: Access Control & Client Profiles (Week 1)
**Goal:** Build the access gatekeeper and the profile management system.

*   **Backend & Admin:**
    *   Create CRUD APIs for Admins to add/remove emails from the `ads_module_access` table.
    *   Create middleware to block unauthorized access to any Ads APIs.
*   **Frontend Sidebar & Profiles:**
    *   Update `AppSidebar.tsx` to conditionally render the "Ads" tab only if the authenticated user's email exists in the whitelist.
    *   Build the Ads Module landing page where users can Create, Edit, and Select **Client Profiles**.
    *   Build the Profile Dashboard shell (empty state prompting users to connect accounts).

### Phase 2: OAuth & Google/LinkedIn Integrations (Week 2)
**Goal:** Set up the connection manager inside a profile and integrate the first two platforms.

*   **Connection Manager UI:**
    *   Build the "Integrations" tab inside a Client Profile with "Connect" buttons for each platform.
*   **Google Analytics 4 & Google Ads API:**
    *   Implement OAuth flow tied to the specific `ad_profile_id`.
    *   Develop service to fetch Google Ad Campaign metrics.
*   **LinkedIn Marketing API:**
    *   Implement LinkedIn OAuth flow and fetch standard ad metrics.
*   **Token Management:** Develop a background job to handle automatic `refresh_token` cycling for connected accounts.

### Phase 3: TikTok & SEMrush Integrations (Week 3)
**Goal:** Complete the platform integrations.

*   **TikTok Marketing API:**
    *   Implement OAuth flow and metric fetching for TikTok Ads.
*   **SEMrush API:**
    *   Implement API key / connection flow for SEMrush.
    *   Fetch Domain Analytics and Traffic data.
*   **Data Normalization:** Write mappers to convert all four APIs' unique JSON responses into the standardized `ad_metrics` schema.

### Phase 4: Data Aggregation & Automation (Week 4)
**Goal:** Automate the data pipeline to keep Client Profiles up to date daily.

*   **Scheduled Synchronization:**
    *   Create Laravel Console Commands (`php artisan ads:sync-metrics`).
    *   Schedule cron jobs to run nightly, iterating through all active `ad_profiles` and their respective `ad_connections` to fetch the previous day's metrics.
*   **Rate Limiting & Error Handling:**
    *   Implement retry logic and exponential backoff.
    *   Display visual alerts in the Client Profile if a token expires and requires the user to reconnect.

### Phase 5: Unified Profile Dashboard (Week 5)
**Goal:** Build the interactive, aggregated dashboard for a Client Profile.

*   **Aggregated Metrics:**
    *   Calculate and display combined Total Spend, Total Impressions, Blended CPC, and Total Conversions across all connected platforms for the selected Client Profile.
*   **Charting & Visualization:**
    *   Build time-series line charts for performance over time (Recharts/Chart.js).
    *   Build comparison charts (e.g., pie charts showing Spend breakdown by platform: 40% Google, 35% TikTok, 25% LinkedIn).
*   **Filtering:**
    *   Add date range pickers (Last 7 Days, Last 30 Days).
    *   Add multi-select toggles to quickly filter the dashboard to specific platforms within the profile.

### Phase 6: QA, Optimization & Deployment (Week 6)
**Goal:** Final testing, performance optimization, and go-live.

*   **Performance Optimization:** Implement Redis caching on the profile dashboard endpoints so aggregated calculations load instantly.
*   **Data Verification:** Cross-reference the unified dashboard data against native platforms to ensure accuracy.
*   **UAT & Deployment:** Internal team review of the access control, profile creation, and connection flow, followed by deployment to production.

---

## 🛠️ Next Steps & Prerequisites
Before starting development, we need to handle these external dependencies:
1. **Developer Accounts:** Register apps and request API access for Google Cloud, LinkedIn Marketing, and TikTok for Business.
2. **App Approvals:** Some platforms require business verification (e.g., LinkedIn company page verification) to issue production API keys.
