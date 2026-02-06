"use strict";
/**
 * Mock Google APIs for testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPath = exports.mockFs = exports.mockGoogleapis = exports.createMockCalendarApi = exports.createMockOAuth2Client = exports.mockCalendarList = exports.mockFreeBusyResponse = exports.mockEvents = void 0;
// Mock calendar events
exports.mockEvents = [
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
exports.mockFreeBusyResponse = {
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
exports.mockCalendarList = {
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
const createMockOAuth2Client = () => ({
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
exports.createMockOAuth2Client = createMockOAuth2Client;
// Mock Google Calendar API
const createMockCalendarApi = () => ({
    events: {
        list: jest.fn().mockResolvedValue({ data: { items: exports.mockEvents } }),
        get: jest.fn().mockResolvedValue({ data: exports.mockEvents[0] }),
        insert: jest.fn().mockResolvedValue({ data: { id: 'new-event-id', summary: 'New Event' } }),
        update: jest.fn().mockResolvedValue({ data: { id: 'event-1', summary: 'Updated Event' } }),
        delete: jest.fn().mockResolvedValue({}),
    },
    freebusy: {
        query: jest.fn().mockResolvedValue({ data: exports.mockFreeBusyResponse }),
    },
    calendarList: {
        list: jest.fn().mockResolvedValue({ data: exports.mockCalendarList }),
    },
});
exports.createMockCalendarApi = createMockCalendarApi;
// Mock googleapis module
exports.mockGoogleapis = {
    google: {
        calendar: jest.fn().mockReturnValue((0, exports.createMockCalendarApi)()),
    },
};
// Mock fs module
exports.mockFs = {
    readFileSync: jest.fn().mockReturnValue('{}'),
    writeFileSync: jest.fn(),
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
};
// Mock path module
exports.mockPath = {
    join: jest.fn().mockImplementation((...args) => args.join('/')),
    resolve: jest.fn().mockImplementation((...args) => args.join('/')),
};
//# sourceMappingURL=google-mocks.js.map