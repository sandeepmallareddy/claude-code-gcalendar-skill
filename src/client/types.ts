/**
 * Type definitions for Google Calendar Skill
 */

import type { calendar_v3 } from 'googleapis';

/**
 * Available commands for the gcalendar CLI
 */
export type GCalendarCommand =
  | 'availability'
  | 'create'
  | 'list'
  | 'get'
  | 'update'
  | 'delete'
  | 'block'
  | 'analyze'
  | 'auth';

/**
 * Time slot for availability queries
 */
export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number; // in minutes
}

/**
 * Attendee information
 */
export interface Attendee {
  email: string;
  displayName?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
}

/**
 * Event creation parameters
 */
export interface CreateEventParams {
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  attendees?: Attendee[];
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
  };
  colorId?: string;
  transparency?: 'transparent' | 'opaque';
}

/**
 * Event update parameters
 */
export interface UpdateEventParams {
  eventId: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: Date;
  end?: Date;
  attendees?: Attendee[];
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
  };
  colorId?: string;
}

/**
 * Time block parameters
 */
export interface BlockTimeParams {
  start: Date;
  end: Date;
  summary?: string;
  description?: string;
  colorId?: string;
}

/**
 * Availability query parameters
 */
export interface AvailabilityParams {
  startDate: Date;
  endDate: Date;
  duration?: number; // in minutes
  attendeeEmails?: string[];
  calendarId?: string;
}

/**
 * Time analysis parameters
 */
export interface TimeAnalysisParams {
  startDate: Date;
  endDate: Date;
  groupBy?: 'day' | 'week' | 'month';
  categories?: string[];
}

/**
 * Event from Google Calendar API
 */
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string | null;
  location?: string | null;
  start: {
    dateTime: string;
    date?: string | null;
    timeZone?: string | null;
  };
  end: {
    dateTime: string;
    date?: string | null;
    timeZone?: string | null;
  };
  attendees?: Array<{ email: string; displayName?: string | null; responseStatus?: string }>;
  status?: string | null;
  htmlLink?: string | null;
  colorId?: string | null;
  recurrence?: string[] | null;
  created?: string | null;
  updated?: string | null;
}

/**
 * Convert API event to CalendarEvent
 */
export function toCalendarEvent(event: calendar_v3.Schema$Event): CalendarEvent {
  return {
    id: event.id || '',
    summary: event.summary || '',
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.start?.dateTime || '',
      date: event.start?.date,
      timeZone: event.start?.timeZone,
    },
    end: {
      dateTime: event.end?.dateTime || '',
      date: event.end?.date,
      timeZone: event.end?.timeZone,
    },
    attendees: event.attendees?.map(a => ({
      email: a.email || '',
      displayName: a.displayName,
      responseStatus: a.responseStatus as Attendee['responseStatus'],
    })),
    status: event.status,
    htmlLink: event.htmlLink,
    colorId: event.colorId,
    recurrence: event.recurrence,
    created: event.created,
    updated: event.updated,
  };
}

/**
 * Analysis result types
 */
export interface TimeUsageSummary {
  totalHours: number;
  meetingHours: number;
  focusHours: number;
  freeHours: number;
  meetingCount: number;
  busiestDay: string;
  dayBreakdown: Array<{
    day: string;
    hours: number;
    meetingCount: number;
  }>;
}

/**
 * CLI output formats
 */
export type OutputFormat = 'text' | 'json' | 'table';

/**
 * Command result
 */
export interface CommandResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Natural language parsing result
 */
export interface ParsedRequest {
  intent: GCalendarCommand;
  entities: {
    date?: string;
    time?: string;
    duration?: number;
    title?: string;
    attendees?: string[];
    location?: string;
    description?: string;
    searchTerms?: string[];
  };
  originalQuery: string;
}
