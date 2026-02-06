/**
 * Google Calendar API Client
 */

import { google, calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import {
  CreateEventParams,
  UpdateEventParams,
  BlockTimeParams,
  AvailabilityParams,
  TimeAnalysisParams,
  TimeSlot,
  CalendarEvent,
  TimeUsageSummary,
  CommandResult,
  toCalendarEvent,
} from './types';
import { getAuthenticatedClient, loadTokens, createOAuth2Client } from './auth';
import {
  getStartOfDay,
  getEndOfDay,
  addDays,
  getDurationMinutes,
  getStartOfWeek,
  getEndOfWeek,
  formatDateForApi,
  getUserTimezone,
} from '../utils/date-utils';

export class CalendarClient {
  private calendar: calendar_v3.Calendar;
  private oauth2Client: OAuth2Client;
  private timezone: string;

  constructor(calendar: calendar_v3.Calendar, oauth2Client: OAuth2Client) {
    this.calendar = calendar;
    this.oauth2Client = oauth2Client;
    this.timezone = getUserTimezone();
  }

  /**
   * List events within a date range
   */
  async listEvents(
    startDate: Date,
    endDate: Date,
    calendarId: string = 'primary',
    maxResults: number = 100
  ): Promise<CommandResult<CalendarEvent[]>> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: formatDateForApi(startDate),
        timeMax: formatDateForApi(endDate),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = (response.data.items || []).map(toCalendarEvent);
      return { success: true, data: events };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list events',
      };
    }
  }

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: string, calendarId: string = 'primary'): Promise<CommandResult<CalendarEvent>> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });

      return { success: true, data: toCalendarEvent(response.data) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event',
      };
    }
  }

  /**
   * Create a new event
   */
  async createEvent(params: CreateEventParams, calendarId: string = 'primary'): Promise<CommandResult<CalendarEvent>> {
    try {
      const event: calendar_v3.Schema$Event = {
        summary: params.summary,
        description: params.description,
        location: params.location,
        start: {
          dateTime: formatDateForApi(params.start),
          timeZone: this.timezone,
        },
        end: {
          dateTime: formatDateForApi(params.end),
          timeZone: this.timezone,
        },
        attendees: params.attendees?.map(a => ({ email: a.email, displayName: a.displayName })),
        recurrence: params.recurrence,
        reminders: params.reminders || {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
        colorId: params.colorId,
        transparency: params.transparency,
      };

      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
        sendUpdates: 'all',
      });

      return { success: true, data: toCalendarEvent(response.data) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event',
      };
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    params: UpdateEventParams,
    calendarId: string = 'primary'
  ): Promise<CommandResult<CalendarEvent>> {
    try {
      const event: calendar_v3.Schema$Event = {};

      if (params.summary) event.summary = params.summary;
      if (params.description) event.description = params.description;
      if (params.location) event.location = params.location;
      if (params.attendees) {
        event.attendees = params.attendees.map(a => ({ email: a.email, displayName: a.displayName }));
      }
      if (params.recurrence) event.recurrence = params.recurrence;
      if (params.reminders) event.reminders = params.reminders;
      if (params.colorId) event.colorId = params.colorId;

      if (params.start) {
        event.start = {
          dateTime: formatDateForApi(params.start),
          timeZone: this.timezone,
        };
      }
      if (params.end) {
        event.end = {
          dateTime: formatDateForApi(params.end),
          timeZone: this.timezone,
        };
      }

      const response = await this.calendar.events.update({
        calendarId,
        eventId: params.eventId,
        requestBody: event,
        sendUpdates: 'all',
      });

      return { success: true, data: toCalendarEvent(response.data) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event',
      };
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<CommandResult> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });

      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event',
      };
    }
  }

  /**
   * Find free/busy information
   */
  async getFreeBusy(
    startDate: Date,
    endDate: Date,
    calendarIds: string[] = ['primary']
  ): Promise<CommandResult<Map<string, TimeSlot[]>>> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: formatDateForApi(startDate),
          timeMax: formatDateForApi(endDate),
          items: calendarIds.map(id => ({ id })),
        },
      });

      const busyTimes = new Map<string, TimeSlot[]>();

      for (const calendarId of calendarIds) {
        const calendar = response.data.calendars?.[calendarId];
        if (calendar?.busy) {
          const slots: TimeSlot[] = calendar.busy.map(busy => ({
            start: new Date(busy.start || ''),
            end: new Date(busy.end || ''),
            duration: getDurationMinutes(
              new Date(busy.start || ''),
              new Date(busy.end || '')
            ),
          }));
          busyTimes.set(calendarId, slots);
        }
      }

      return { success: true, data: busyTimes };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get free/busy',
      };
    }
  }

  /**
   * Find available time slots
   */
  async findAvailableSlots(params: AvailabilityParams): Promise<CommandResult<TimeSlot[]>> {
    try {
      const { startDate, endDate, duration = 60, attendeeEmails = [] } = params;

      // Get busy times for all calendars
      const calendarIds = ['primary', ...attendeeEmails];
      const freeBusyResult = await this.getFreeBusy(startDate, endDate, calendarIds);

      if (!freeBusyResult.success || !freeBusyResult.data) {
        return { success: false, error: freeBusyResult.error };
      }

      // Combine all busy times
      const allBusyTimes: TimeSlot[] = [];
      for (const slots of freeBusyResult.data.values()) {
        allBusyTimes.push(...slots);
      }

      // Sort and merge overlapping busy times
      const mergedBusyTimes = this.mergeTimeSlots(allBusyTimes);

      // Find gaps between busy times
      const availableSlots = this.findGaps(
        startDate,
        endDate,
        mergedBusyTimes,
        duration
      );

      return { success: true, data: availableSlots };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find available slots',
      };
    }
  }

  /**
   * Merge overlapping time slots
   */
  private mergeTimeSlots(slots: TimeSlot[]): TimeSlot[] {
    if (slots.length === 0) return [];

    // Sort by start time
    const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());

    const merged: TimeSlot[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      if (current.start <= last.end) {
        // Overlapping - extend the last slot if needed
        if (current.end > last.end) {
          last.end = current.end;
          last.duration = getDurationMinutes(last.start, last.end);
        }
      } else {
        // Not overlapping - add new slot
        merged.push(current);
      }
    }

    return merged;
  }

  /**
   * Find gaps between busy times that are at least the required duration
   */
  private findGaps(
    start: Date,
    end: Date,
    busySlots: TimeSlot[],
    minDuration: number
  ): TimeSlot[] {
    const gaps: TimeSlot[] = [];

    let current = getStartOfDay(start);

    for (const busy of busySlots) {
      if (busy.start > current) {
        const gapDuration = getDurationMinutes(current, busy.start);
        if (gapDuration >= minDuration) {
          gaps.push({
            start: current,
            end: busy.start,
            duration: gapDuration,
          });
        }
      }
      current = busy.end > current ? busy.end : current;
    }

    // Check final gap
    if (current < end) {
      const gapDuration = getDurationMinutes(current, end);
      if (gapDuration >= minDuration) {
        gaps.push({
          start: current,
          end: end,
          duration: gapDuration,
        });
      }
    }

    return gaps;
  }

  /**
   * Analyze time usage
   */
  async analyzeTimeUsage(params: TimeAnalysisParams): Promise<CommandResult<TimeUsageSummary>> {
    try {
      const { startDate, endDate } = params;

      const eventsResult = await this.listEvents(startDate, endDate);
      if (!eventsResult.success || !eventsResult.data) {
        return { success: false, error: eventsResult.error };
      }

      const events = eventsResult.data;
      let totalMinutes = 0;
      let meetingMinutes = 0;
      let focusMinutes = 0;
      const dayStats: Record<string, { minutes: number; count: number }> = {};

      for (const event of events) {
        const eventStart = new Date(event.start.dateTime || event.start.date || '');
        const eventEnd = new Date(event.end.dateTime || event.end.date || '');
        const duration = getDurationMinutes(eventStart, eventEnd);

        totalMinutes += duration;

        // Check if it's a meeting (has attendees or certain keywords)
        const isMeeting = this.isMeetingEvent(event);
        if (isMeeting) {
          meetingMinutes += duration;
        } else {
          focusMinutes += duration;
        }

        // Track by day
        const dayKey = eventStart.toLocaleDateString('en-US', { weekday: 'long' });
        if (!dayStats[dayKey]) {
          dayStats[dayKey] = { minutes: 0, count: 0 };
        }
        dayStats[dayKey].minutes += duration;
        dayStats[dayKey].count++;
      }

      // Find busiest day
      let busiestDay = '';
      let busiestMinutes = 0;
      for (const [day, stats] of Object.entries(dayStats)) {
        if (stats.minutes > busiestMinutes) {
          busiestMinutes = stats.minutes;
          busiestDay = day;
        }
      }

      // Convert to hours
      const totalHours = totalMinutes / 60;
      const meetingHours = meetingMinutes / 60;
      const focusHours = focusMinutes / 60;
      const freeHours = totalHours - meetingHours - focusHours;

      const dayBreakdown = Object.entries(dayStats).map(([day, stats]) => ({
        day,
        hours: stats.minutes / 60,
        meetingCount: stats.count,
      }));

      return {
        success: true,
        data: {
          totalHours,
          meetingHours,
          focusHours,
          freeHours: Math.max(0, freeHours),
          meetingCount: events.filter(e => this.isMeetingEvent(e)).length,
          busiestDay: busiestDay || 'None',
          dayBreakdown,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze time usage',
      };
    }
  }

  /**
   * Check if an event is a meeting
   */
  private isMeetingEvent(event: CalendarEvent): boolean {
    // Has attendees -> definitely a meeting
    if (event.attendees && event.attendees.length > 0) {
      return true;
    }

    // Check for meeting-related keywords
    const meetingKeywords = [
      'meeting', 'standup', 'sync', 'review', 'call', 'discussion',
      'demo', 'workshop', 'training', 'interview', '1:1', 'one-on-one',
    ];

    const text = `${event.summary} ${event.description || ''}`.toLowerCase();
    return meetingKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Block time (create busy event without details)
   */
  async blockTime(params: BlockTimeParams, calendarId: string = 'primary'): Promise<CommandResult<CalendarEvent>> {
    return this.createEvent({
      summary: params.summary || 'Busy',
      description: params.description || '',
      start: params.start,
      end: params.end,
      colorId: params.colorId || '9', // Gray color
      transparency: 'opaque', // Shows as busy
    }, calendarId);
  }

  /**
   * Search for events by query
   */
  async searchEvents(
    query: string,
    startDate: Date,
    endDate: Date,
    calendarId: string = 'primary'
  ): Promise<CommandResult<CalendarEvent[]>> {
    const result = await this.listEvents(startDate, endDate, calendarId);

    if (!result.success || !result.data) {
      return result;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = result.data.filter(event =>
      event.summary.toLowerCase().includes(lowerQuery) ||
      event.description?.toLowerCase().includes(lowerQuery)
    );

    return { success: true, data: filtered };
  }
}

/**
 * Factory function to create an authenticated CalendarClient
 */
export async function createCalendarClient(): Promise<CalendarClient> {
  const { oauth2Client, calendar } = await getAuthenticatedClient();
  return new CalendarClient(calendar, oauth2Client);
}
