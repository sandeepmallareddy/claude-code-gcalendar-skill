# Authentication Guide

## OAuth 2.0 Setup

This skill uses Google OAuth 2.0 for secure authentication. The first time you run any command, you'll be prompted to authenticate.

## Initial Authentication

### Step 1: Run Auth Command

```bash
npm run auth
```

This will:
1. Generate an authentication URL
2. Open your default browser (or display the URL)
3. Prompt for the authorization code

### Step 2: Grant Access

1. Sign in with your Google account
2. Review the requested permissions
3. Click "Allow" to grant access

### Step 3: Enter Authorization Code

Copy the code from the browser and paste it into the terminal.

## Setting Up Google Cloud Credentials

If you need to create new credentials:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select existing
3. Enter a name and click "Create"

### Step 2: Enable Google Calendar API

1. Navigate to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click the result and click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Navigate to **OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - App name (e.g., "Google Calendar Skill")
   - User support email
   - Developer contact email
4. Click **Save and Continue**

### Step 4: Add Scopes

1. Click "Add or remove scopes"
2. Add: `.../auth/calendar`
3. Add: `.../auth/calendar.events`
4. Click "Save and Continue"

### Step 5: Create Credentials

1. Navigate to **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add to **Authorized redirect URIs**:
   - `http://localhost:3000/callback`
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

## Credential Storage

Credentials are stored in one of two locations:

### Option 1: Environment Variables

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REDIRECT_URI="http://localhost:3000/callback"
```

### Option 2: Credentials File

```
~/.config/gcalendar/credentials.json
```

```json
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "redirect_uris": ["http://localhost:3000/callback"]
}
```

## Token Management

### Token Storage

Tokens are stored at:
```
~/.config/gcalendar/token.json
```

### Token Refresh

Tokens automatically refresh when needed. If refresh fails, you'll need to re-authenticate.

### Re-authenticate

```bash
rm ~/.config/gcalendar/token.json
npm run auth
```

## Troubleshooting

### "access_denied" Error

The user denied access. Run `npm run auth` and grant access.

### "invalid_client" Error

The Client ID or Secret is incorrect. Verify your credentials.

### "redirect_uri_mismatch" Error

The redirect URI in your credentials doesn't match. Update your OAuth client settings.

### Token Expiry

Tokens expire periodically. Run `npm run auth` to get new tokens.

### Multiple Accounts

To switch accounts:
1. Delete the token file
2. Run `npm run auth`
3. Sign in with the desired account

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** in CI/CD
3. **Rotate credentials** periodically
4. **Limit OAuth scopes** to minimum required
5. **Review connected apps** in Google Account settings
