#!/usr/bin/env node
/**
 * Authentication script for Google Calendar
 * Run this to authenticate with your Google account
 */

import * as readline from 'readline';
import { createOAuth2Client, getAuthUrl, getTokensFromCode, loadCredentials } from '../client/auth';

async function authenticate(): Promise<void> {
  console.log('Google Calendar Authentication');
  console.log('=============================');
  console.log('');

  try {
    const credentials = loadCredentials();
    const oauth2Client = createOAuth2Client(credentials);

    console.log('Generating authentication URL...');
    const url = getAuthUrl(oauth2Client);

    console.log('');
    console.log('1. Opening browser for authentication...');
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
    } catch {
      // Browser opening failed, show URL
      console.log('Could not open browser automatically.');
    }

    console.log('2. If browser did not open, visit:');
    console.log('   ' + url);
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise<string>((resolve) => {
      rl.question('3. Enter the authorization code: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    if (!code) {
      console.error('No authorization code provided.');
      process.exit(1);
    }

    console.log('');
    console.log('4. Exchanging code for tokens...');

    const tokenPath = await getTokensFromCode(oauth2Client, code);

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
    console.error('Authentication failed:');
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
