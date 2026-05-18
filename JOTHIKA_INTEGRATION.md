# Jothika Reimbursement Integration

This document describes the integration between Aura and Jothika for automatic reimbursement creation.

## Overview

The Jothika integration allows Aura users to automatically create reimbursement entries in Jothika directly from approved project expenses, eliminating the need for manual data entry.

## Features

- ✅ Automatic reimbursement creation from project expenses
- ✅ Secure token-based authentication per user
- ✅ Visual feedback in the UI for connection status
- ✅ Error handling and validation
- ✅ Support for duplicate prevention via reference IDs
- ✅ Cost of Sales tracking
- ✅ Client name association

## How It Works

### 1. User Flow

1. **Connect Jothika Account** (one-time setup):
   - User navigates to an approved, reimbursable expense in Aura
   - Clicks "Create reimbursement in Jothika" button
   - If not connected, prompted to enter Jothika API token
   - Token is securely stored and associated with their account

2. **Create Reimbursement**:
   - Once connected, click "Create Reimbursement" button
   - Aura automatically sends expense data to Jothika API
   - Reimbursement is created in Jothika with status "pending"
   - Expense is marked as "reimbursement_noted" in Aura

### 2. Getting a Jothika API Token

Users can obtain their API token in two ways:

#### Option A: Via Jothika UI (when available)
1. Log into Jothika at https://jothika.artslabcreatives.com
2. Navigate to Settings → API Tokens
3. Click "Generate New Token"
4. Copy the token and paste it into Aura

#### Option B: Via Laravel Tinker (developer/admin only)
```bash
# SSH into Jothika server
cd /path/to/jothika
php artisan tinker

# Generate token for a user
$user = User::where('email', 'user@example.com')->first();
$token = $user->createToken('aura-integration')->plainTextToken;
echo $token;
```

The token will look like: `1|abc123def456...`

### 3. Technical Architecture

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│  Aura   │  POST /api/jothika │ Jothika  │  POST /api/        │ Jothika │
│ Frontend├───────────────────>│  Service ├────reimbursements─>│   API   │
│         │  (via React)       │ (Laravel)│  (Bearer Token)    │         │
└─────────┘                    └──────────┘                    └─────────┘
                                     │
                                     ▼
                           ┌──────────────────┐
                           │ jothika_tokens   │
                           │ - user_id        │
                           │ - access_token   │
                           │ - expires_at     │
                           │ - is_active      │
                           └──────────────────┘
```

### 4. API Endpoints

All endpoints require `auth:sanctum` middleware (user must be logged in to Aura).

#### Check Token Status
```http
GET /api/jothika/token/status
```

Response:
```json
{
  "has_token": true,
  "is_valid": true
}
```

#### Store Jothika Token
```http
POST /api/jothika/token
Content-Type: application/json

{
  "token": "1|abc123def456...",
  "expires_at": "2027-04-06T00:00:00Z" // optional
}
```

Response:
```json
{
  "message": "Jothika token stored successfully",
  "has_token": true
}
```

#### Revoke Token
```http
DELETE /api/jothika/token
```

Response:
```json
{
  "message": "Jothika connection removed successfully"
}
```

#### Create Reimbursement from Expense
```http
POST /api/jothika/reimbursement/create-from-expense
Content-Type: application/json

{
  "project_id": 42,
  "expense_id": 123
}
```

Response:
```json
{
  "message": "Reimbursement created successfully in Jothika",
  "jothika_id": 456,
  "status": "pending"
}
```

#### Create Custom Reimbursement
```http
POST /api/jothika/reimbursement
Content-Type: application/json

{
  "amount": 250.00,
  "currency": "USD",
  "description": "Vendor payment for project materials",
  "expense_date": "2026-04-06",
  "client_name": "Acme Corporation",
  "is_cost_of_sales": true,
  "reference": "CUSTOM-REF-001"
}
```

Response:
```json
{
  "message": "Reimbursement created successfully in Jothika",
  "jothika_id": 789,
  "status": "pending"
}
```

## Database Schema

### Table: `jothika_tokens`

```sql
CREATE TABLE jothika_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    access_token TEXT NOT NULL,
    expires_at TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    UNIQUE KEY unique_user_id (user_id),
    KEY idx_is_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Error Handling

The integration handles various error scenarios:

### Token Errors
- **No token**: Prompts user to connect their Jothika account
- **Invalid token**: Shows error, deactivates token, prompts reconnection
- **Expired token**: Automatically marked as inactive

### API Errors
- **Duplicate reference** (409): Shows error message
- **Validation error** (422): Displays specific field errors
- **Network error**: Shows generic connection error message

## Security Considerations

1. **Token Storage**: Tokens are encrypted at rest in the database
2. **Per-User Tokens**: Each user has their own token (no shared credentials)
3. **HTTPS Required**: All API communication uses HTTPS
4. **Token Scope**: Tokens have limited permissions (reimbursement creation only)
5. **Revocation**: Tokens can be revoked by user or admin at any time

## Configuration

Add to `.env`:

```env
# Jothika Reimbursement Integration
JOTHIKA_URL=https://jothika.artslabcreatives.com
```

## Testing

To test the integration:

1. **Create a test user in both systems**:
   - Aura: user@example.com
   - Jothika: user@example.com (same email)

2. **Generate a Jothika token** (see "Getting a Token" above)

3. **In Aura**:
   - Create a project with a client
   - Add an expense marked as reimbursable
   - Approve the expense
   - Click "Create reimbursement in Jothika"
   - Enter the token when prompted
   - Click "Create Reimbursement"

4. **Verify in Jothika**:
   - Log into Jothika
   - Check reimbursements list
   - Verify the new entry with reference `AURA-EXP-{id}`

## Troubleshooting

### "No valid Jothika token found"
- **Cause**: User hasn't connected their account or token expired
- **Solution**: Connect/reconnect Jothika account via the modal

### "A reimbursement with this reference already exists"
- **Cause**: Trying to create duplicate reimbursement for same expense
- **Solution**: Check Jothika to confirm if entry already exists, or manually dismiss in Aura

### "Failed to connect to Jothika"
- **Cause**: Network issue or Jothika server down
- **Solution**: Check network connectivity, verify JOTHIKA_URL in .env

### "Jothika token is invalid"
- **Cause**: Token was revoked in Jothika or user was deleted
- **Solution**: Generate a new token and reconnect account

## Future Enhancements

Potential improvements:
- [ ] OAuth2 integration (eliminate manual token entry)
- [ ] Webhook integration for status updates from Jothika back to Aura
- [ ] Bulk reimbursement creation
- [ ] Receipt file attachment support
- [ ] Reimbursement status synchronization
- [ ] Admin interface for managing user connections
- [ ] Token expiration warnings

## Support

For issues or questions:
- Check the API documentation at `/api/documentation`
- Review logs at `storage/logs/laravel.log`
- Search for "Jothika" in error messages
