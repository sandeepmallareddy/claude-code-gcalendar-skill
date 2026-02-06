#!/usr/bin/env node
/**
 * Google Calendar CLI Entry Point
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createCalendarClient } from '../client/calendar-client';
import { loadCredentials, getAuthUrl, getTokensFromCode } from '../client/auth';
import { parseNaturalLanguage, buildEventTitle } from '../utils/natural-language';
import {
  formatTimeSlots,
  formatEventList,
  formatEventConfirmation,
  formatTimeUsageSummary,
  formatError,
  formatSuccess,
} from '../utils/formatters';
import {
  addDays,
  addMinutes,
  parseDate,
  parseTimeExpression,
  parseDuration,
  getStartOfDay,
} from '../utils/date-utils';
import type { ParsedRequest } from '../client/types';

const argv = yargs(hideBin(process.argv))
  .command('availability', 'Find available time slots', {
    query: {
      describe: 'Natural language query for availability',
      type: 'string',
      demandOption: true,
    },
  })
  .command('create', 'Create a new event', {
    query: {
      describe: 'Natural language query for event creation',
      type: 'string',
      demandOption: true,
    },
  })
  .command('list', 'List events', {
    query: {
      describe: 'Natural language query for listing events',
      type: 'string',
    },
    days: {
      describe: 'Number of days to look ahead',
      type: 'number',
      default: 7,
    },
  })
  .command('get', 'Get event details', {
    query: {
      describe: 'Search query to find the event',
      type: 'string',
      demandOption: true,
    },
  })
  .command('update', 'Update an event', {
    event: {
      describe: 'Event ID or search query',
      type: 'string',
      demandOption: true,
    },
    query: {
      describe: 'Natural language updates to make',
      type: 'string',
      demandOption: true,
    },
  })
  .command('delete', 'Delete an event', {
    query: {
      describe: 'Event ID or search query',
      type: 'string',
      demandOption: true,
    },
  })
  .command('block', 'Block time on calendar', {
    query: {
      describe: 'Natural language query for time blocking',
      type: 'string',
      demandOption: true,
    },
  })
  .command('analyze', 'Analyze time usage', {
    query: {
      describe: 'Natural language query for analysis',
      type: 'string',
    },
    days: {
      describe: 'Number of days to analyze',
      type: 'number',
      default: 7,
    },
  })
  .command('auth', 'Authenticate with Google', {
    setup: {
      describe: 'Set up credentials',
      type: 'boolean',
      default: false,
    },
  })
  .demandCommand()
  .help()
  .strict()
  .argv;

/**
 * Handle availability command
 */
async function handleAvailability(query: string): Promise<void> {
  const client = await createCalendarClient();
  const parsed = parseNaturalLanguage(query);

  const today = new Date();
  const startDate = parsed.entities.date ? parseDate(parsed.entities.date) : today;
  const endDate = addDays(startDate, parsed.entities.duration ? 1 : 7);

  const duration = parsed.entities.duration || 60;

  const result = await client.findAvailableSlots({
    startDate: getStartOfDay(startDate),
    endDate: endDate,
    duration,
    attendeeEmails: parsed.entities.attendees,
  });

  if (result.success && result.data) {
    console.log(formatTimeSlots(result.data));
  } else {
    console.log(formatError(result.error || 'Failed to find availability'));
  }
}

/**
 * Handle create command
 */
async function handleCreate(query: string): Promise<void> {
  const client = await createCalendarClient();
  const parsed = parseNaturalLanguage(query);

  const now = new Date();
  const startDate = parsed.entities.date ? parseDate(parsed.entities.date) : now;

  // Parse time if provided
  let startTime = now;
  if (parsed.entities.time) {
    const [hours, minutes] = parsed.entities.time.split(':').map(Number);
    startTime = new Date(startDate);
    startTime.setHours(hours, minutes, 0, 0);
  } else {
    // Default to next hour
    startTime = new Date(startDate);
    startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
  }

  // Default duration
  const duration = parsed.entities.duration || 60;
  const endTime = addMinutes(startTime, duration);

  const title = buildEventTitle(parsed.entities);

  const result = await client.createEvent({
    summary: title,
    description: parsed.entities.description,
    location: parsed.entities.location,
    start: startTime,
    end: endTime,
    attendees: parsed.entities.attendees?.map(email => ({ email })),
  });

  if (result.success && result.data) {
    console.log(formatEventConfirmation(result.data, 'created'));
  } else {
    console.log(formatError(result.error || 'Failed to create event'));
  }
}

/**
 * Handle list command
 */
async function handleList(query: string, days: number): Promise<void> {
  const client = await createCalendarClient();
  const parsed = parseNaturalLanguage(query);

  const today = new Date();
  const startDate = parsed.entities.date ? parseDate(parsed.entities.date) : today;
  const endDate = addDays(startDate, days);

  const result = await client.listEvents(startDate, endDate);

  if (result.success && result.data) {
    console.log(formatEventList(result.data, 'Your Calendar'));
  } else {
    console.log(formatError(result.error || 'Failed to list events'));
  }
}

/**
 * Handle get command
 */
async function handleGet(query: string): Promise<void> {
  const client = await createCalendarClient();

  const today = new Date();
  const weekStart = addDays(today, -1);
  const weekEnd = addDays(today, 7);

  const result = await client.searchEvents(query, weekStart, weekEnd);

  if (result.success && result.data && result.data.length > 0) {
    console.log(formatEventList(result.data, `Events matching "${query}"`));
  } else {
    console.log(formatError('Event not found', 'Try a different search term or check the event name'));
  }
}

/**
 * Handle update command
 */
async function handleUpdate(eventQuery: string, updateQuery: string): Promise<void> {
  const client = await createCalendarClient();
  const parsed = parseNaturalLanguage(updateQuery);

  // First, find the event
  const today = new Date();
  const weekStart = addDays(today, -1);
  const weekEnd = addDays(today, 7);

  const searchResult = await client.searchEvents(eventQuery, weekStart, weekEnd);

  if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
    console.log(formatError('Event not found', 'Try a more specific search term'));
    return;
  }

  const event = searchResult.data[0];

  // Build update params
  const updateParams: Parameters<typeof client.updateEvent>[0] = {
    eventId: event.id,
  };

  if (parsed.entities.title) {
    updateParams.summary = parsed.entities.title;
  }
  if (parsed.entities.description) {
    updateParams.description = parsed.entities.description;
  }
  if (parsed.entities.location) {
    updateParams.location = parsed.entities.location;
  }

  // Handle time updates
  if (parsed.entities.time || parsed.entities.date || parsed.entities.duration) {
    const startDate = new Date(event.start.dateTime || event.start.date || '');
    const endDate = new Date(event.end.dateTime || event.end.date || '');

    if (parsed.entities.time) {
      const [hours, minutes] = parsed.entities.time.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
      endDate.setHours(hours + (parsed.entities.duration || 1), minutes, 0, 0);
    }

    if (parsed.entities.date) {
      const newDate = parseDate(parsed.entities.date);
      startDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      endDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    }

    if (parsed.entities.duration) {
      endDate.setTime(startDate.getTime() + parsed.entities.duration * 60000);
    }

    updateParams.start = startDate;
    updateParams.end = endDate;
  }

  const result = await client.updateEvent(updateParams);

  if (result.success && result.data) {
    console.log(formatEventConfirmation(result.data, 'updated'));
  } else {
    console.log(formatError(result.error || 'Failed to update event'));
  }
}

/**
 * Handle delete command
 */
async function handleDelete(query: string): Promise<void> {
  const client = await createCalendarClient();

  const today = new Date();
  const weekStart = addDays(today, -1);
  const weekEnd = addDays(today, 7);

  const searchResult = await client.searchEvents(query, weekStart, weekEnd);

  if (!searchResult.success || !searchResult.data || searchResult.data.length === 0) {
    console.log(formatError('Event not found', 'Try a more specific search term'));
    return;
  }

  const event = searchResult.data[0];
  const result = await client.deleteEvent(event.id);

  if (result.success) {
    console.log(formatSuccess(`Deleted: ${event.summary}`));
  } else {
    console.log(formatError(result.error || 'Failed to delete event'));
  }
}

/**
 * Handle block command
 */
async function handleBlock(query: string): Promise<void> {
  const client = await createCalendarClient();
  const parsed = parseNaturalLanguage(query);

  const today = new Date();
  const startDate = parsed.entities.date ? parseDate(parsed.entities.date) : today;

  let startTime = new Date(startDate);
  let endTime = new Date(startDate);

  // Parse time
  if (parsed.entities.time) {
    const [hours, minutes] = parsed.entities.time.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);
  } else {
    startTime.setHours(9, 0, 0, 0); // Default to 9 AM
  }

  // Parse duration
  const duration = parsed.entities.duration || 120; // Default 2 hours
  endTime = addMinutes(startTime, duration);

  const result = await client.blockTime({
    start: startTime,
    end: endTime,
    summary: 'Blocked',
    description: parsed.entities.description,
  });

  if (result.success && result.data) {
    console.log(formatSuccess(`Time blocked: ${formatEventConfirmation(result.data, 'created')}`));
  } else {
    console.log(formatError(result.error || 'Failed to block time'));
  }
}

/**
 * Handle analyze command
 */
async function handleAnalyze(query: string, days: number): Promise<void> {
  const client = await createCalendarClient();

  const endDate = new Date();
  const startDate = addDays(endDate, -days);

  const result = await client.analyzeTimeUsage({
    startDate,
    endDate,
  });

  if (result.success && result.data) {
    console.log(formatTimeUsageSummary(result.data));
  } else {
    console.log(formatError(result.error || 'Failed to analyze time usage'));
  }
}

/**
 * Handle auth command
 */
async function handleAuth(setup: boolean): Promise<void> {
  if (setup) {
    console.log('To set up Google Calendar API access:');
    console.log('');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing');
    console.log('3. Enable the Google Calendar API');
    console.log('4. Configure OAuth 2.0 consent screen');
    console.log('5. Create OAuth 2.0 credentials');
    console.log('6. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
    console.log('');
    console.log('For more details, see docs/authentication.md');
    return;
  }

  const credentials = loadCredentials();
  const oauth2Client = require('google-auth-library').OAuth2Client;
  const client = new oauth2Client(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri
  );

  const url = getAuthUrl(client);
  console.log('Opening browser for authentication...');
  console.log('');
  console.log('If the browser does not open, visit:');
  console.log(url);
  console.log('');
  console.log('Enter the authorization code:');

  // Read code from stdin
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('Code: ', async (code: string) => {
    readline.close();
    try {
      await getTokensFromCode(client, code.trim());
      console.log('');
      console.log('Authentication successful! Tokens saved.');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  });
}

// Main
async function main(): Promise<void> {
  const parsed = await argv;
  const command = (parsed._[0] as string) || '';
  const args = parsed as { query?: string; days?: number; event?: string; setup?: boolean };

  try {
    switch (command) {
      case 'availability':
        await handleAvailability(args.query!);
        break;
      case 'create':
        await handleCreate(args.query!);
        break;
      case 'list':
        await handleList(args.query || '', args.days || 7);
        break;
      case 'get':
        await handleGet(args.query!);
        break;
      case 'update':
        await handleUpdate(args.event!, args.query!);
        break;
      case 'delete':
        await handleDelete(args.query!);
        break;
      case 'block':
        await handleBlock(args.query!);
        break;
      case 'analyze':
        await handleAnalyze(args.query || '', args.days || 7);
        break;
      case 'auth':
        await handleAuth(args.setup || false);
        break;
      default:
        console.log('Unknown command:', command);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
