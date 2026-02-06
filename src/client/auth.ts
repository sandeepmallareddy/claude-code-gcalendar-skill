/**
 * Google Calendar API Authentication
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

// Project root paths (where credentials.json and token.json will be stored)
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const PROJECT_CREDENTIALS_PATH = path.join(PROJECT_ROOT, 'credentials.json');
const PROJECT_TOKEN_PATH = path.join(PROJECT_ROOT, 'token.json');

// Fallback to user's home directory
const HOME_CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.config/gcalendar');
const HOME_CREDENTIALS_PATH = path.join(HOME_CONFIG_DIR, 'credentials.json');
const HOME_TOKEN_PATH = path.join(HOME_CONFIG_DIR, 'token.json');

// Use project root as primary, home config as fallback
const CREDENTIALS_PATH = PROJECT_CREDENTIALS_PATH;
const TOKEN_PATH = PROJECT_TOKEN_PATH;

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Check if a path exists and is a valid credentials file
 * Supports both direct format and Google Cloud Console's "web" nested format
 */
function isValidCredentialsFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const creds = JSON.parse(content);
    // Support both direct format and Google Cloud's "web" nested format
    const hasClientId = creds.client_id || (creds.web && creds.web.client_id);
    const hasClientSecret = creds.client_secret || (creds.web && creds.web.client_secret);
    return !!(hasClientId && hasClientSecret);
  } catch {
    return false;
  }
}

/**
 * Extract credentials from file (handles both formats)
 */
function extractCredentials(filePath: string): { clientId: string; clientSecret: string; redirectUri: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const creds = JSON.parse(content);
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback';

  // Support both direct format and Google Cloud's "web" nested format
  const web = creds.web || creds;
  return {
    clientId: web.client_id,
    clientSecret: web.client_secret,
    redirectUri: (web.redirect_uris && web.redirect_uris[0]) || redirectUri,
  };
}

/**
 * Load credentials from environment or file
 * Checks project root first, then falls back to home config directory
 */
export function loadCredentials(): GoogleAuthConfig {
  // 1. Try environment variables first (highest priority)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback';

  if (clientId && clientSecret) {
    return { clientId, clientSecret, redirectUri };
  }

  // 2. Try loading from project root credentials.json
  if (isValidCredentialsFile(PROJECT_CREDENTIALS_PATH)) {
    try {
      const creds = extractCredentials(PROJECT_CREDENTIALS_PATH);
      return {
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        redirectUri: creds.redirectUri,
      };
    } catch {
      throw new Error('Failed to parse credentials file at ' + PROJECT_CREDENTIALS_PATH);
    }
  }

  // 3. Try loading from home config directory
  if (isValidCredentialsFile(HOME_CREDENTIALS_PATH)) {
    try {
      const creds = extractCredentials(HOME_CREDENTIALS_PATH);
      return {
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        redirectUri: creds.redirectUri,
      };
    } catch {
      throw new Error('Failed to parse credentials file at ' + HOME_CREDENTIALS_PATH);
    }
  }

  throw new Error(
    'Google credentials not found. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables, ' +
    'or create a credentials.json file in the project root or at ' + HOME_CREDENTIALS_PATH
  );
}

/**
 * Get the token storage path (project root preferred)
 */
function getTokenStoragePath(): string {
  // If project token exists or can be written, use it
  if (fs.existsSync(PROJECT_TOKEN_PATH) || canWriteToDirectory(PROJECT_ROOT)) {
    return PROJECT_TOKEN_PATH;
  }
  // Fallback to home config
  return HOME_TOKEN_PATH;
}

/**
 * Check if we can write to a directory
 */
function canWriteToDirectory(dirPath: string): boolean {
  try {
    const testFile = path.join(dirPath, '.write-test-' + Date.now());
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
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

  // Determine where to save tokens
  const tokenPath = getTokenStoragePath();
  const dir = path.dirname(tokenPath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save tokens
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));

  return tokenPath;
}

/**
 * Load saved tokens
 */
export function loadTokens(oauth2Client: OAuth2Client): void {
  // Try project token first
  if (fs.existsSync(PROJECT_TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(PROJECT_TOKEN_PATH, 'utf-8'));
      oauth2Client.setCredentials(tokens);
      return;
    } catch {
      // Continue to try home token
    }
  }

  // Fallback to home config token
  if (fs.existsSync(HOME_TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(HOME_TOKEN_PATH, 'utf-8'));
      oauth2Client.setCredentials(tokens);
      return;
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
      const tokenPath = getTokenStoragePath();
      fs.writeFileSync(tokenPath, JSON.stringify(newCredentials, null, 2));
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
  // Check project token first
  if (fs.existsSync(PROJECT_TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(PROJECT_TOKEN_PATH, 'utf-8'));
      return !!(tokens.access_token || tokens.refresh_token);
    } catch {
      // Continue to check home token
    }
  }

  // Check home token
  if (fs.existsSync(HOME_TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(HOME_TOKEN_PATH, 'utf-8'));
      return !!(tokens.access_token || tokens.refresh_token);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get token info
 */
export function getTokenInfo(): { email?: string; expiry?: number } | null {
  // Check project token first
  if (fs.existsSync(PROJECT_TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(PROJECT_TOKEN_PATH, 'utf-8'));
      return { expiry: tokens.expiry_date };
    } catch {
      // Continue to check home token
    }
  }

  // Check home token
  if (fs.existsSync(HOME_TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(HOME_TOKEN_PATH, 'utf-8'));
      return { expiry: tokens.expiry_date };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Get paths being used (for debugging)
 */
export function getStoragePaths(): {
  credentialsPath: string;
  tokenPath: string;
  usingProjectRoot: boolean;
} {
  const usingProjectRoot = fs.existsSync(PROJECT_TOKEN_PATH) || canWriteToDirectory(PROJECT_ROOT);
  return {
    credentialsPath: CREDENTIALS_PATH,
    tokenPath: getTokenStoragePath(),
    usingProjectRoot,
  };
}
