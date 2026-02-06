/**
 * Natural Language Parser for Google Calendar commands
 */

import type { GCalendarCommand, ParsedRequest } from '../client/types';
import { parseDate, parseTimeExpression, parseDuration, formatDate } from './date-utils';

/**
 * Intent patterns for natural language commands
 * IMPORTANT: Order matters! More specific patterns should come first.
 */
const INTENT_PATTERNS: Record<GCalendarCommand, RegExp[]> = {
  availability: [
    /find\s+(?:open|free|available)\s*(?:slot|time)?/i,
    /when\s+(?:is|are|can\s+i)\s+(?:i|we|everyone)\s+(?:free|available)/i,
    /show\s+(?:me\s+)?(?:available|free|open)\s+time/i,
    /what('s| is)\s+(?:my\s+)?(?:free|available)/i,
    /check\s+(?:my\s+)?availability/i,
    /find\s+(?:me\s+)?time/i,
    /free\s+(?:slot|time)/i,
  ],
  create: [
    /schedule\s/i,
    /create\s+(?:a\s+)?(?:new\s+)?(?:meeting|event|appointment)/i,
    /book\s/i,
    /add\s+(?:a\s+)?(?:meeting|event|appointment)/i,
    /set\s+up\s/i,
    /arrange\s/i,
    /plan\s/i,
  ],
  list: [
    /what('s| is| are)\s+(?:on|my)?\s*(?:my\s+)?calendar/i,
    /show\s+(?:me\s+)?(?:my\s+)?(?:today|this\s+week|this\s+month)?\s*schedule/i,
    /list\s+(?:my\s+)?(?:today|this\s+week)?\s*(?:events|meetings|appointments)?/i,
    /what\s+do\s+i\s+have/i,
    /my\s+(?:upcoming\s+)?events/i,
  ],
  get: [
    /find\s+(?:my\s+)?(?:meeting|event|appointment)\s+(?:with|called|named)/i,
    /get\s+(?:details|info)(?:\s+for)?/i,
    /show\s+(?:me\s+)?(?:details|info)(?:\s+for)?/i,
    /look\s+up/i,
    /search\s+(?:for\s+)?(?:my\s+)?(?:meeting|event)/i,
  ],
  update: [
    /update\s/i,
    /change\s/i,
    /modify\s/i,
    /move\s/i,
    /reschedule\s/i,
    /edit\s/i,
    /shift\s/i,
    /reschedule$/i,
  ],
  delete: [
    /delete\s/i,
    /remove\s/i,
    /cancel\s/i,
    /unschedule/i,
    /drop\s/i,
    /delete$/i,
    /remove$/i,
    /cancel$/i,
  ],
  block: [
    /block\s+(?:time|out)/i,
    /mark\s+(?:me\s+)?(?:as\s+)?(?:busy|unavailable)/i,
    /focus\s+(?:time|block)/i,
    /out\s+of\s+office/i,
    /\booo\b/i,
    /do\s+not\s+disturb/i,
    /reserve\s+time/i,
  ],
  analyze: [
    /analyze/i,
    /how\s+(?:much|many)/i,
    /time\s+(?:usage|analysis|spent)/i,
    /meeting\s+(?:load|count|distribution)/i,
    /show\s+(?:my\s+)?(?:time|meeting)\s+(?:usage|analysis|stats|summary)/i,
    /busiest/i,
    /free\s+time\s+(?:this|next)/i,
  ],
  auth: [
    /authenticate/i,
    /login/i,
    /authorize/i,
    /connect/i,
  ],
};

/**
 * Extract entities from a natural language request
 */
export function extractEntities(query: string): ParsedRequest['entities'] {
  const entities: ParsedRequest['entities'] = {
    searchTerms: [],
  };

  // Extract date
  const date = parseDateExpression(query);
  if (date) {
    entities.date = formatDate(date);
  }

  // Extract time
  const time = parseTimeExpression(query);
  if (time) {
    entities.time = `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  }

  // Extract duration
  const duration = parseDuration(query);
  if (duration) {
    entities.duration = duration;
  }

  // Extract email addresses
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = query.match(emailPattern);
  if (emails) {
    entities.attendees = emails;
  }

  // Extract title/event name (look for phrases after "meeting", "event", etc.)
  const titlePattern = /(?:meeting|call|event|with|appointment)\s+(?:with\s+)?([A-Z][a-zA-Z\s]+?)(?:\s+(?:at|on|for|next)|$)/i;
  const titleMatch = query.match(titlePattern);
  if (titleMatch) {
    entities.title = titleMatch[1].trim();
  }

  // Extract location
  const locationPattern = /(?:at|in)\s+([A-Z][a-zA-Z0-9\s,]+?)(?:\s+(?:on|at|for|with)|$)/i;
  const locationMatch = query.match(locationPattern);
  if (locationMatch && !locationMatch[1].includes('@')) {
    entities.location = locationMatch[1].trim();
  }

  // Extract description (text after "about", "regarding", etc.)
  const descPattern = /(?:about|regarding|for)\s+([A-Z][a-zA-Z0-9\s,]+?)(?:\s+(?:on|at|for|with)|$)/i;
  const descMatch = query.match(descPattern);
  if (descMatch) {
    entities.description = descMatch[1].trim();
  }

  return entities;
}

/**
 * Parse date expression from query
 */
function parseDateExpression(text: string): Date | null {
  const today = new Date();
  const lowerText = text.toLowerCase();

  if (lowerText.includes('today')) return getStartOfDay(today);
  if (lowerText.includes('tomorrow')) return addDays(today, 1);

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayMatch = lowerText.match(new RegExp(`(${daysOfWeek.join('|')})`));
  if (dayMatch) {
    const targetDay = daysOfWeek.indexOf(dayMatch[1]);
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    return addDays(today, daysUntil);
  }

  return null;
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Detect the intent from a natural language query
 */
export function detectIntent(query: string): GCalendarCommand {
  // Check each intent's patterns
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        return intent as GCalendarCommand;
      }
    }
  }

  // Default to list if unclear
  return 'list';
}

/**
 * Parse a natural language request into a structured format
 */
export function parseNaturalLanguage(query: string): ParsedRequest {
  const intent = detectIntent(query);
  const entities = extractEntities(query);

  return {
    intent,
    entities,
    originalQuery: query,
  };
}

/**
 * Build an event title from entities
 */
export function buildEventTitle(entities: ParsedRequest['entities']): string {
  if (entities.title) {
    return entities.title;
  }

  if (entities.attendees && entities.attendees.length > 0) {
    const names = entities.attendees.map(e => e.split('@')[0]);
    return `Meeting with ${names.join(', ')}`;
  }

  return 'New Event';
}

/**
 * Check if a query is asking about a specific person
 */
export function extractPersonFromQuery(query: string): string | null {
  const patterns = [
    /with\s+([A-Z][a-z]+)/i,
    /(?:meeting|call)\s+(?:with\s+)?([A-Z][a-z]+)/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Classify event type from query
 */
export function classifyEventType(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('standup')) return 'standup';
  if (lowerQuery.includes('one-on-one') || lowerQuery.includes('1:1')) return 'one-on-one';
  if (lowerQuery.includes('review')) return 'review';
  if (lowerQuery.includes('planning') || lowerQuery.includes('plan')) return 'planning';
  if (lowerQuery.includes('sync')) return 'sync';
  if (lowerQuery.includes('retrospective')) return 'retrospective';
  if (lowerQuery.includes('daily') || lowerQuery.includes('check-in')) return 'check-in';
  if (lowerQuery.includes('lunch') || lowerQuery.includes('dinner') || lowerQuery.includes('coffee')) return 'social';
  if (lowerQuery.includes('interview')) return 'interview';
  if (lowerQuery.includes('demo')) return 'demo';
  if (lowerQuery.includes('training') || lowerQuery.includes('workshop')) return 'training';

  return 'meeting';
}
