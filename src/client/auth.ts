/**
 * Google Calendar API Authentication
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

const TOKEN_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.config/gcalendar/token.json');
const CREDENTIALS_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.config/gcalendar/credentials.json');

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Load credentials from environment or file
 */
export function loadCredentials(): GoogleAuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback';

  if (clientId && clientSecret) {
    return { clientId, clientSecret, redirectUri };
  }

  // Try loading from file
  if (fs.existsSync(CREDENTIALS_PATH)) {
    try {
      const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
      const creds = JSON.parse(content);
      return {
        clientId: creds.client_id,
        clientSecret: creds.client_secret,
        redirectUri: creds.redirect_uris?.[0] || redirectUri,
      };
    } catch {
      throw new Error('Failed to parse credentials file');
    }
  }

  throw new Error(
    'Google credentials not found. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables, ' +
    'or create a credentials file at ' + CREDENTIALS_PATH
  );
}

/**
 * Create OAuth2 client
 */
export function createOAuth2Client(config?: GoogleAuthConfig): OAuth2Client {
  const creds = config || loadCredentials();
  return new google.auth.OAuth2(
    creds.clientId,
    creds.clientSecret,
    creds.redirectUri
  );
}

/**
 * Get auth URL for OAuth consent
 */
export function getAuthUrl(oauth2Client: OAuth2Client): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(
  oauth2Client: OAuth2Client,
  code: string
): Promise<string> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Ensure directory exists
  const dir = path.dirname(TOKEN_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save tokens
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

  return TOKEN_PATH;
}

/**
 * Load saved tokens
 */
export function loadTokens(oauth2Client: OAuth2Client): void {
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      oauth2Client.setCredentials(tokens);
    } catch {
      throw new Error('Failed to load saved tokens');
    }
  }
}

/**
 * Refresh access token if needed
 */
export async function ensureValidToken(oauth2Client: OAuth2Client): Promise<void> {
  const credentials = oauth2Client.credentials;

  if (!credentials.access_token) {
    throw new Error('No access token available. Please authenticate first.');
  }

  // Check if token is expired or about to expire
  const expiryDate = credentials.expiry_date || 0;
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

  if (expiryDate < fiveMinutesFromNow) {
    try {
      const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(newCredentials);

      // Save updated tokens
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(newCredentials, null, 2));
    } catch (error) {
      throw new Error('Failed to refresh access token. Please re-authenticate.');
    }
  }
}

/**
 * Initialize authenticated calendar API
 */
export async function getAuthenticatedClient(): Promise<{
  oauth2Client: OAuth2Client;
  calendar: calendar_v3.Calendar;
}> {
  const oauth2Client = createOAuth2Client();

  try {
    loadTokens(oauth2Client);
    await ensureValidToken(oauth2Client);
  } catch (error) {
    throw error;
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  return { oauth2Client, calendar };
}

/**
 * Check if authenticated
 */
export function isAuthenticated(): boolean {
  if (!fs.existsSync(TOKEN_PATH)) {
    return false;
  }

  try {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    return !!(tokens.access_token || tokens.refresh_token);
  } catch {
    return false;
  }
}

/**
 * Get token info
 */
export function getTokenInfo(): { email?: string; expiry?: number } | null {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }

  try {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    return {
      expiry: tokens.expiry_date,
    };
  } catch {
    return null;
  }
}
