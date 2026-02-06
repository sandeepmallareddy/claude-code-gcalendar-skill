# Installation Guide

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- A Google Account with Google Calendar enabled
- Google Cloud Console access (for OAuth credentials)

## Quick Installation

### 1. Clone the Repository

```bash
cd ~/.claude/skills/
git clone https://github.com/yourusername/claude-code-gcalendar-skill.git gcalendar
cd gcalendar
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google OAuth Credentials

#### Option A: Using Environment Variables

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REDIRECT_URI="http://localhost:3000/callback"
```

#### Option B: Using Credentials File

```bash
mkdir -p ~/.config/gcalendar
cat > ~/.config/gcalendar/credentials.json << EOF
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uris": ["http://localhost:3000/callback"]
}
EOF
```

### 4. Authenticate

```bash
npm run auth
```

This will open your browser for OAuth consent. Follow the prompts to grant access.

### 5. Verify Installation

```bash
npm run build
npm test
```

## Google Cloud Console Setup

### Creating OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add `http://localhost:3000/callback` to authorized redirect URIs
7. Copy Client ID and Client Secret

### Enabling Google Calendar API

1. Go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

## Project-Level Installation

For project-specific skills, copy to `.claude/skills/gcalendar/`:

```bash
mkdir -p your-project/.claude/skills
cp -r ~/.claude/skills/gcalendar your-project/.claude/skills/
```

## Docker (Optional)

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "run", "auth"]
```

## Troubleshooting

### "No credentials found" Error

Ensure you've set up credentials via environment variables or the credentials file.

### "Invalid redirect URI" Error

Make sure your OAuth credentials include `http://localhost:3000/callback` in authorized redirect URIs.

### "Token expired" Error

Run `npm run auth` to re-authenticate.

### Port 3000 in use

Set a different redirect URI:

```bash
export GOOGLE_REDIRECT_URI="http://localhost:3001/callback"
```
