/**
 * Integration tests for Calendar Client
 * These tests use mocked Google APIs to test client functionality
 */

import type { calendar_v3 } from 'googleapis';

// Mock data
const mockEvents: calendar_v3.Schema$Event[] = [
  {
    id: 'event-1',
    summary: 'Morning Standup',
    description: 'Daily team standup',
    start: { dateTime: '2024-01-15T09:00:00Z', timeZone: 'UTC' },
    end: { dateTime: '2024-01-15T09:30:00Z', timeZone: 'UTC' },
    status: 'confirmed',
  },
  {
    id: 'event-2',
    summary: 'Client Meeting',
    start: { dateTime: '2024-01-15T14:00:00Z', timeZone: 'UTC' },
    end: { dateTime: '2024-01-15T15:00:00Z', timeZone: 'UTC' },
    status: 'confirmed',
  },
];

// Mock calendar API factory
const createMockCalendarApi = () => ({
  events: {
    list: jest.fn().mockResolvedValue({
      data: {
        items: mockEvents,
      },
    }),
    get: jest.fn().mockResolvedValue({
      data: mockEvents[0],
    }),
    insert: jest.fn().mockResolvedValue({
      data: { id: 'new-event', summary: 'New Event' },
    }),
    update: jest.fn().mockResolvedValue({
      data: { id: 'event-1', summary: 'Updated Event' },
    }),
    delete: jest.fn().mockResolvedValue({}),
  },
  freebusy: {
    query: jest.fn().mockResolvedValue({
      data: {
        calendars: {
          primary: {
            busy: [
              { start: '2024-01-15T09:00:00Z', end: '2024-01-15T09:30:00Z' },
              { start: '2024-01-15T14:00:00Z', end: '2024-01-15T15:00:00Z' },
            ],
          },
        },
      },
    }),
  },
});

// Mock googleapis - must be before imports
jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn(() => createMockCalendarApi()),
  },
}));

// Mock auth module
jest.mock('../../src/client/auth', () => ({
  getAuthenticatedClient: jest.fn(() => Promise.resolve({
    oauth2Client: {},
    calendar: {
      events: {
        list: jest.fn().mockResolvedValue({ data: { items: mockEvents } }),
        get: jest.fn().mockResolvedValue({ data: mockEvents[0] }),
        insert: jest.fn().mockResolvedValue({ data: { id: 'new-event', summary: 'New Event' } }),
        update: jest.fn().mockResolvedValue({ data: { id: 'event-1', summary: 'Updated Event' } }),
        delete: jest.fn().mockResolvedValue({}),
      },
      freebusy: {
        query: jest.fn().mockResolvedValue({
          data: {
            calendars: {
              primary: {
                busy: [
                  { start: '2024-01-15T09:00:00Z', end: '2024-01-15T09:30:00Z' },
                  { start: '2024-01-15T14:00:00Z', end: '2024-01-15T15:00:00Z' },
                ],
              },
            },
          },
        }),
      },
    },
  })),
}));

// Now import after mocks
import { CalendarClient, createCalendarClient } from '../../src/client/calendar-client';

describe('CalendarClient Integration Tests', () => {
  let client: CalendarClient;

  beforeAll(async () => {
    client = await createCalendarClient();
  });

  describe('listEvents', () => {
    it('should list events within date range', async () => {
      const result = await client.listEvents(
        new Date('2024-01-15T00:00:00Z'),
        new Date('2024-01-16T00:00:00Z')
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].summary).toBe('Morning Standup');
    });

    it('should handle empty result', async () => {
      const emptyApi = createMockCalendarApi();
      emptyApi.events.list.mockResolvedValueOnce({ data: { items: [] } });

      jest.doMock('googleapis', () => ({
        google: {
          calendar: jest.fn().mockReturnValue(emptyApi),
        },
      }));

      const result = await client.listEvents(
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getEvent', () => {
    it('should get event by ID', async () => {
      const result = await client.getEvent('event-1');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('event-1');
      expect(result.data?.summary).toBe('Morning Standup');
    });

    it('should handle non-existent event', async () => {
      const notFoundApi = createMockCalendarApi();
      notFoundApi.events.get.mockRejectedValueOnce({
        code: 404,
        message: 'Event not found',
      });

      const mockClient = new CalendarClient(notFoundApi as unknown as calendar_v3.Calendar, {} as any);

      const result = await mockClient.getEvent('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('createEvent', () => {
    it('should create new event', async () => {
      const result = await client.createEvent({
        summary: 'New Meeting',
        start: new Date('2024-01-15T10:00:00Z'),
        end: new Date('2024-01-15T11:00:00Z'),
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('new-event');
    });

    it('should create event with attendees', async () => {
      const result = await client.createEvent({
        summary: 'Team Meeting',
        start: new Date('2024-01-15T10:00:00Z'),
        end: new Date('2024-01-15T11:00:00Z'),
        attendees: [
          { email: 'john@example.com', displayName: 'John' },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateEvent', () => {
    it('should update event', async () => {
      const result = await client.updateEvent({
        eventId: 'event-1',
        summary: 'Updated Meeting',
      });

      expect(result.success).toBe(true);
      expect(result.data?.summary).toBe('Updated Event');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event', async () => {
      const result = await client.deleteEvent('event-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event deleted successfully');
    });
  });

  describe('getFreeBusy', () => {
    it('should return busy times', async () => {
      const result = await client.getFreeBusy(
        new Date('2024-01-15T00:00:00Z'),
        new Date('2024-01-16T00:00:00Z')
      );

      expect(result.success).toBe(true);
      expect(result.data?.has('primary')).toBe(true);
      expect(result.data?.get('primary')).toHaveLength(2);
    });
  });

  describe('findAvailableSlots', () => {
    it('should find available slots', async () => {
      const result = await client.findAvailableSlots({
        startDate: new Date('2024-01-15T08:00:00Z'),
        endDate: new Date('2024-01-15T18:00:00Z'),
        duration: 60,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should find longer slots', async () => {
      const result = await client.findAvailableSlots({
        startDate: new Date('2024-01-15T08:00:00Z'),
        endDate: new Date('2024-01-15T18:00:00Z'),
        duration: 120,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('blockTime', () => {
    it('should block time on calendar', async () => {
      const result = await client.blockTime({
        start: new Date('2024-01-15T10:00:00Z'),
        end: new Date('2024-01-15T12:00:00Z'),
        summary: 'Focus Time',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('searchEvents', () => {
    it('should search events by query', async () => {
      const result = await client.searchEvents(
        'standup',
        new Date('2024-01-15'),
        new Date('2024-01-16')
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].summary).toBe('Morning Standup');
    });
  });
});
