#!/usr/bin/env node
/**
 * Authentication script for Google Calendar
 * Run this to authenticate with your Google account
 */

import * as http from 'http';
import * as readline from 'readline';
import { createOAuth2Client, getAuthUrl, getTokensFromCode, loadCredentials } from '../client/auth';

let receivedCode: string | null = null;
let server: http.Server | null = null;

/**
 * Start a simple HTTP server to receive the OAuth callback
 */
function startCallbackServer(): Promise<string> {
  return new Promise((resolve) => {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback';

    server = http.createServer((req, res) => {
      // Parse the URL and extract the code
      const url = new URL(req.url || '', redirectUri);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (code) {
        receivedCode = code;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .success { color: green; }
            </style>
          </head>
          <body>
            <h1 class="success">✓ Authentication Successful!</h1>
            <p>You can close this window and return to the terminal.</p>
            <p>The authorization code has been received.</p>
          </body>
          </html>
        `);
        server?.close();
      } else if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentication Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: red; }
            </style>
          </head>
          <body>
            <h1 class="error">Authentication Failed</h1>
            <p>Error: ${error}</p>
            <p>Please try again.</p>
          </body>
          </html>
        `);
        server?.close();
      }
    });

    const port = parseInt(new URL(redirectUri).port || '3000');
    server.listen(port, () => {
      console.log(`  Listening for OAuth callback on port ${port}...`);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!receivedCode) {
        console.log('\n⚠️  Timeout waiting for callback. Please try again.');
        server?.close();
        resolve('');
      }
    }, 5 * 60 * 1000);
  });
}

async function authenticate(): Promise<void> {
  console.log('Google Calendar Authentication');
  console.log('================================');
  console.log('');

  try {
    const credentials = loadCredentials();
    const oauth2Client = createOAuth2Client(credentials);

    console.log('1. Starting authentication...');

    // Start the callback server
    const callbackPromise = startCallbackServer();

    // Generate and show the auth URL
    const url = getAuthUrl(oauth2Client);

    console.log('');
    console.log('2. Opening browser for Google sign-in...');
    console.log('');

    // Try to open browser
    const { execSync } = require('child_process');
    try {
      if (process.platform === 'darwin') {
        execSync(`open "${url}"`);
      } else if (process.platform === 'win32') {
        execSync(`start "${url}"`);
      } else {
        execSync(`xdg-open "${url}"`);
      }
      console.log('   Browser opened. If it didn\'t open, visit:');
      console.log('   ' + url);
    } catch {
      console.log('   Could not open browser automatically.');
      console.log('   Please visit this URL:');
      console.log('   ' + url);
    }

    console.log('');
    console.log('3. Sign in to Google and grant permission.');
    console.log('   A new tab will open after you approve access.');
    console.log('');

    // Wait for the callback
    const code = await callbackPromise;

    if (!code && !receivedCode) {
      // Fallback: prompt for manual code entry
      console.log('');
      console.log('4. If the browser didn\'t redirect automatically:');
      console.log('   - Look at the URL in your browser address bar');
      console.log('   - Copy the code that appears after "code="');
      console.log('');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const manualCode = await new Promise<string>((resolve) => {
        rl.question('   Enter the authorization code: ', (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });

      if (!manualCode) {
        console.error('\n✗ No authorization code provided.');
        process.exit(1);
      }
      receivedCode = manualCode;
    }

    console.log('');
    console.log('5. Exchanging code for tokens...');

    const tokenPath = await getTokensFromCode(oauth2Client, receivedCode!);

    console.log('');
    console.log('✓ Authentication successful!');
    console.log(`  Tokens saved to: ${tokenPath}`);
    console.log('');
    console.log('You can now use the gcalendar skill.');
    console.log('');
    console.log('Usage examples:');
    console.log('  npm run gcalendar -- availability "tomorrow"');
    console.log('  npm run gcalendar -- create "meeting with john@example.com"');
    console.log('');

  } catch (error) {
    console.error('\n✗ Authentication failed:');
    if (error instanceof Error) {
      console.error('  ' + error.message);
    }
    console.log('');
    console.log('To set up credentials:');
    console.log('  npm run auth -- --setup');
    process.exit(1);
  }
}

authenticate();
