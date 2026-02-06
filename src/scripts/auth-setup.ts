#!/usr/bin/env node
/**
 * Authentication setup script
 * Provides instructions for setting up Google Calendar API credentials
 */

import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.config', 'gcalendar');
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');

function printInstructions(): void {
  console.log('');
  console.log('Google Calendar API Setup Guide');
  console.log('================================');
  console.log('');
  console.log('Step 1: Go to Google Cloud Console');
  console.log('   Visit: https://console.cloud.google.com/');
  console.log('');
  console.log('Step 2: Create or Select a Project');
  console.log('   - Click the project dropdown at the top');
  console.log('   - Select "New Project" or choose existing');
  console.log('');
  console.log('Step 3: Enable the Google Calendar API');
  console.log('   - Go to "APIs & Services" > "Library"');
  console.log('   - Search for "Google Calendar API"');
  console.log('   - Click "Enable"');
  console.log('');
  console.log('Step 4: Configure OAuth Consent Screen');
  console.log('   - Go to "OAuth consent screen"');
  console.log('   - Select "External" user type');
  console.log('   - Fill in required fields:');
  console.log('     - Application name (e.g., "Google Calendar Skill")');
  console.log('     - User support email');
  console.log('     - Email scopes (add "...,/auth/calendar.events")');
  console.log('   - Click "Save and Continue"');
  console.log('');
  console.log('Step 5: Create OAuth 2.0 Credentials');
  console.log('   - Go to "Credentials"');
  console.log('   - Click "Create Credentials" > "OAuth client ID"');
  console.log('   - Application type: "Web application"');
  console.log('   - Name: "Google Calendar Skill"');
  console.log('   - Authorized redirect URIs:');
  console.log('     - Add: "http://localhost:3000/callback"');
  console.log('   - Click "Create"');
  console.log('');
  console.log('Step 6: Download Credentials');
  console.log('   - Copy the "Client ID" and "Client secret"');
  console.log('   - Or download the JSON file');
  console.log('');
  console.log('Step 7: Set Environment Variables');
  console.log('');
  console.log('   Option A: Set environment variables:');
  console.log('     export GOOGLE_CLIENT_ID="your-client-id"');
  console.log('     export GOOGLE_CLIENT_SECRET="your-client-secret"');
  console.log('     export GOOGLE_REDIRECT_URI="http://localhost:3000/callback"');
  console.log('');
  console.log('   Option B: Create credentials file:');
  console.log(`     mkdir -p ${CONFIG_DIR}`);
  console.log(`     cat > ${CREDENTIALS_PATH} << EOF`);
  console.log('     {');
  console.log('       "client_id": "YOUR_CLIENT_ID",');
  console.log('       "project_id": "YOUR_PROJECT_ID",');
  console.log('       "auth_uri": "https://accounts.google.com/o/oauth2/auth",');
  console.log('       "token_uri": "https://oauth2.googleapis.com/token",');
  console.log('       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",');
  console.log('       "client_secret": "YOUR_CLIENT_SECRET",');
  console.log('       "redirect_uris": ["http://localhost:3000/callback"]');
  console.log('     }');
  console.log('     EOF');
  console.log('');
  console.log('Step 8: Run Authentication');
  console.log('   npm run auth');
  console.log('');
  console.log('================================');
  console.log('');
}

function saveCredentialsToFile(): void {
  const credentialsJson = {
    client_id: process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback'],
  };

  try {
    // Ensure directory exists
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentialsJson, null, 2));
    console.log(`Credentials template saved to: ${CREDENTIALS_PATH}`);
    console.log('');
    console.log('Edit the file and replace placeholders with your actual credentials.');
  } catch (error) {
    console.error('Failed to save credentials file:', error);
  }
}

async function main(): Promise<void> {
  console.log('');
  console.log('Google Calendar Skill - Setup');
  console.log('==============================');
  console.log('');

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printInstructions();
    return;
  }

  // Check if credentials are already set
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✓ Environment variables detected');
    saveCredentialsToFile();
  } else if (fs.existsSync(CREDENTIALS_PATH)) {
    console.log('✓ Credentials file already exists');
  } else {
    console.log('No credentials found. Let me help you set them up.');
    console.log('');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      readline.question(
        'Would you like to see setup instructions? (y/n): ',
        (a) => {
          readline.close();
          resolve(a.toLowerCase().trim());
        }
      );
    });

    if (answer === 'y' || answer === 'yes') {
      printInstructions();
    } else {
      console.log('To set up credentials later, run: npm run auth -- --setup');
    }
  }

  console.log('');
  console.log('After setting up credentials, run: npm run auth');
  console.log('');
}

main().catch(console.error);
