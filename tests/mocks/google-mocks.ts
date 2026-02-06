/**
 * Mock Google APIs for testing
 */

import type { calendar_v3, google } from 'googleapis';

// Mock calendar events
export const mockEvents: calendar_v3.Schema$Event[] = [
  {
    id: 'event-1',
    summary: 'Morning Standup',
    description: 'Daily team standup',
    start: {
      dateTime: new Date('2024-01-15T09:00:00Z').toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: new Date('2024-01-15T09:30:00Z').toISOString(),
      timeZone: 'America/New_York',
    },
    attendees: [
      { email: 'john@example.com', displayName: 'John Doe' },
      { email: 'jane@example.com', displayName: 'Jane Smith' },
    ],
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/event?id=event-1',
  },
  {
    id: 'event-2',
    summary: 'Client Meeting',
    description: 'Meeting with client',
    start: {
      dateTime: new Date('2024-01-15T14:00:00Z').toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: new Date('2024-01-15T15:00:00Z').toISOString(),
      timeZone: 'America/New_York',
    },
    attendees: [
      { email: 'client@example.com' },
    ],
    status: 'confirmed',
    htmlLink: 'https://calendar.google.com/event?id=event-2',
  },
];

// Mock free/busy response
export const mockFreeBusyResponse: calendar_v3.Schema$FreeBusyResponse = {
  kind: 'calendar#freeBusy',
  timeMin: new Date('2024-01-15T00:00:00Z').toISOString(),
  timeMax: new Date('2024-01-16T00:00:00Z').toISOString(),
  calendars: {
    'primary': {
      busy: [
        {
          start: new Date('2024-01-15T09:00:00Z').toISOString(),
          end: new Date('2024-01-15T09:30:00Z').toISOString(),
        },
        {
          start: new Date('2024-01-15T14:00:00Z').toISOString(),
          end: new Date('2024-01-15T15:00:00Z').toISOString(),
        },
      ],
    },
  },
};

// Mock calendar list
export const mockCalendarList: calendar_v3.Schema$CalendarList = {
  items: [
    {
      id: 'primary',
      summary: 'My Calendar',
      primary: true,
      accessRole: 'owner',
    },
    {
      id: 'work@example.com',
      summary: 'Work Calendar',
      primary: false,
      accessRole: 'writer',
    },
  ],
};

// Mock OAuth2 client
export const createMockOAuth2Client = () => ({
  generateAuthUrl: jest.fn().mockResolvedValue('https://accounts.google.com/oauth?test'),
  getTokenFromCode: jest.fn().mockResolvedValue({
    tokens: {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expiry_date: Date.now() + 3600000,
    },
  }),
  setCredentials: jest.fn(),
  getAccessToken: jest.fn().mockResolvedValue({
    tokens: {
      access_token: 'test-access-token',
    },
  }),
  on: jest.fn(),
});

// Mock Google Calendar API
export const createMockCalendarApi = () => ({
  events: {
    list: jest.fn().mockResolvedValue({ data: { items: mockEvents } }),
    get: jest.fn().mockResolvedValue({ data: mockEvents[0] }),
    insert: jest.fn().mockResolvedValue({ data: { id: 'new-event-id', summary: 'New Event' } }),
    update: jest.fn().mockResolvedValue({ data: { id: 'event-1', summary: 'Updated Event' } }),
    delete: jest.fn().mockResolvedValue({}),
  },
  freebusy: {
    query: jest.fn().mockResolvedValue({ data: mockFreeBusyResponse }),
  },
  calendarList: {
    list: jest.fn().mockResolvedValue({ data: mockCalendarList }),
  },
});

// Mock googleapis module
export const mockGoogleapis = {
  google: {
    calendar: jest.fn().mockReturnValue(createMockCalendarApi()),
  },
};

// Mock fs module
export const mockFs = {
  readFileSync: jest.fn().mockReturnValue('{}'),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
};

// Mock path module
export const mockPath = {
  join: jest.fn().mockImplementation((...args) => args.join('/')),
  resolve: jest.fn().mockImplementation((...args) => args.join('/')),
};
