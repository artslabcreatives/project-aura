# How to Connect Your Jothika Account to Aura

Follow these simple steps to automatically create reimbursements in Jothika from Aura.

## Step 1: Get Your Jothika API Token

### Option 1: Request from Admin
Contact your system administrator and provide them with your email address. They will generate a token for you.

### Option 2: Generate Yourself (if you have access)
1. Log into Jothika at https://jothika.artslabcreatives.com
2. Go to **Settings** → **API Tokens**
3. Click **"Generate New Token"**
4. Give it a name like "Aura Integration"
5. Copy the token (it will look like: `1|abc123def456...`)
6. **Important**: Save this token securely - you won't be able to see it again!

## Step 2: Connect in Aura

1. In Aura, navigate to a project with expenses
2. Go to the **Finance** tab
3. When you see a reimbursable expense (marked with 💰), click **"Create reimbursement in Jothika"**
4. If this is your first time:
   - Click **"Connect Jothika Account"**
   - Paste your token
   - Click **"Connect Account"**
5. You'll see a green checkmark when connected successfully

## Step 3: Create Reimbursements Automatically

Once connected:
1. Click **"Create Reimbursement"** button
2. Wait a few seconds (you'll see "Creating...")
3. Done! The reimbursement is created in Jothika automatically
4. You'll see a success message with the Jothika ID

## What Gets Sent to Jothika?

When you create a reimbursement, Aura automatically sends:
- ✅ Amount and currency
- ✅ Description of the expense
- ✅ Date of expense
- ✅ Client name
- ✅ Cost of Sales flag
- ✅ Reference ID (so you can track it back to Aura)

The reimbursement will appear in Jothika with status **"pending"** and await approval.

## Disconnecting Your Account

To disconnect your Jothika account from Aura:
1. Contact your administrator, or
2. The token will automatically be revoked if it becomes invalid

## Troubleshooting

**"No valid Jothika token found"**
- Your token may have expired or been revoked
- Get a new token and reconnect

**"Reimbursement already exists"**
- This expense was already submitted to Jothika
- Check your Jothika account to confirm

**"Failed to connect"**
- Check your internet connection
- Verify the token is correct (no extra spaces)
- Contact support if issue persists

## Security Note

🔒 Your Jothika token is stored securely and encrypted. Only you can use it to create reimbursements under your name in Jothika.

## Need Help?

Contact your system administrator or email support@artslabcreatives.com
