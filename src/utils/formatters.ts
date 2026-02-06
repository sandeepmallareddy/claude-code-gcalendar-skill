/**
 * Output formatters for Google Calendar results
 */

import type { CalendarEvent, TimeSlot, TimeUsageSummary, CommandResult } from '../client/types';
import { formatTime, formatDate, formatDuration, getRelativeDateDescription } from './date-utils';

/**
 * Format time slots for display
 */
export function formatTimeSlots(slots: TimeSlot[], timezone?: string): string {
  if (slots.length === 0) {
    return 'No available time slots found.';
  }

  const lines = ['Available Slots:'];
  lines.push('');

  for (const slot of slots) {
    const dateDesc = getRelativeDateDescription(slot.start);
    const timeDesc = `${formatTime(slot.start, timezone)} - ${formatTime(slot.end, timezone)}`;
    const durationDesc = `(${formatDuration(slot.duration)})`;

    if (dateDesc === 'Today' || dateDesc === 'Tomorrow') {
      lines.push(`• ${dateDesc}, ${timeDesc} ${durationDesc}`);
    } else {
      lines.push(`• ${formatDate(slot.start, timezone)}, ${timeDesc} ${durationDesc}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format an event for display
 */
export function formatEvent(event: CalendarEvent, timezone?: string): string {
  const lines: string[] = [];

  lines.push(`📅 ${event.summary}`);
  lines.push('');

  const startDate = new Date(event.start.dateTime || event.start.date || '');
  const endDate = new Date(event.end.dateTime || event.end.date || '');

  lines.push(`   🕐 ${formatDate(startDate, timezone)}`);
  lines.push(`   ⏱️  ${formatTime(startDate, timezone)} - ${formatTime(endDate, timezone)}`);

  if (event.location) {
    lines.push(`   📍 ${event.location}`);
  }

  if (event.attendees && event.attendees.length > 0) {
    const names = event.attendees.map(a => a.displayName || a.email).join(', ');
    lines.push(`   👥 ${names}`);
  }

  if (event.description) {
    const shortDesc = event.description.length > 100
      ? event.description.substring(0, 100) + '...'
      : event.description;
    lines.push(`   📝 ${shortDesc}`);
  }

  if (event.htmlLink) {
    lines.push(`   🔗 [View in Calendar](${event.htmlLink})`);
  }

  return lines.join('\n');
}

/**
 * Format a list of events for display
 */
export function formatEventList(
  events: CalendarEvent[],
  title?: string,
  timezone?: string
): string {
  if (events.length === 0) {
    return title ? `${title}\n\nNo events found.` : 'No events found.';
  }

  const lines: string[] = [];
  if (title) {
    lines.push(title);
    lines.push('');
  }

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  for (const event of events) {
    const dateKey = new Date(event.start.dateTime || event.start.date || '').toDateString();
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  }

  for (const [dateStr, dayEvents] of Object.entries(eventsByDate)) {
    const date = new Date(dateStr);
    lines.push(`## ${getRelativeDateDescription(date)} (${formatDate(date, timezone).split(',')[0]})`);
    lines.push('');

    for (const event of dayEvents) {
      const startTime = formatTime(new Date(event.start.dateTime || event.start.date || ''), timezone);
      const endTime = formatTime(new Date(event.end.dateTime || event.end.date || ''), timezone);
      lines.push(`• **${event.summary}**`);
      lines.push(`  ${startTime} - ${endTime}`);

      if (event.location) {
        lines.push(`  📍 ${event.location}`);
      }
      lines.push('');
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format event creation confirmation
 */
export function formatEventConfirmation(event: CalendarEvent, action: 'created' | 'updated' | 'deleted', timezone?: string): string {
  const emoji = action === 'created' ? '✓' : action === 'updated' ? '✏️' : '🗑️';
  const verb = action === 'created' ? 'Created' : action === 'updated' ? 'Updated' : 'Deleted';

  const lines: string[] = [];
  lines.push(`${emoji} Event ${verb}: ${event.summary}`);

  const startDate = new Date(event.start.dateTime || event.start.date || '');
  const endDate = new Date(event.end.dateTime || event.end.date || '');

  lines.push('');
  lines.push(`📅 ${formatDate(startDate, timezone)}`);
  lines.push(`🕐 ${formatTime(startDate, timezone)} - ${formatTime(endDate, timezone)}`);

  if (event.attendees && event.attendees.length > 0) {
    lines.push(`👥 ${event.attendees.length} attendee${event.attendees.length > 1 ? 's' : ''}`);
  }

  return lines.join('\n');
}

/**
 * Format time usage summary
 */
export function formatTimeUsageSummary(summary: TimeUsageSummary): string {
  const lines: string[] = [];
  lines.push('Time Usage Summary');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');

  lines.push(`Total Tracked Time: ${summary.totalHours.toFixed(1)} hours`);
  lines.push('');
  lines.push('Breakdown:');
  lines.push(`  Meetings:     ${formatMeetingBar(summary.meetingHours, summary.totalHours)} ${summary.meetingHours.toFixed(1)}h`);
  lines.push(`  Focus Time:   ${formatMeetingBar(summary.focusHours, summary.totalHours)} ${summary.focusHours.toFixed(1)}h`);
  lines.push(`  Free Time:    ${formatMeetingBar(summary.freeHours, summary.totalHours)} ${summary.freeHours.toFixed(1)}h`);
  lines.push('');
  lines.push(`Meeting Count: ${summary.meetingCount} meetings`);
  lines.push(`Busiest Day: ${summary.busiestDay}`);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}

/**
 * Format a bar for visual representation
 */
function formatMeetingBar(hours: number, total: number): string {
  const barLength = 20;
  const ratio = total > 0 ? hours / total : 0;
  const filledLength = Math.round(barLength * ratio);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return bar;
}

/**
 * Format error message
 */
export function formatError(error: string, suggestion?: string): string {
  const lines: string[] = [];
  lines.push('❌ Error');
  lines.push('');
  lines.push(error);

  if (suggestion) {
    lines.push('');
    lines.push(`💡 ${suggestion}`);
  }

  return lines.join('\n');
}

/**
 * Format success message
 */
export function formatSuccess(message: string): string {
  return `✅ ${message}`;
}

/**
 * Format availability for multiple attendees
 */
export function formatMultiAttendeeAvailability(
  attendeeEmails: string[],
  slots: Map<string, TimeSlot[]>,
  timezone?: string
): string {
  const lines: string[] = [];
  lines.push('Mutual Availability');
  lines.push('');
  lines.push(`Attendees: ${attendeeEmails.join(', ')}`);
  lines.push('');

  for (const [email, attendeeSlots] of slots.entries()) {
    if (attendeeSlots.length > 0) {
      lines.push(`### ${email}`);
      lines.push(formatTimeSlots(attendeeSlots, timezone));
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format JSON output
 */
export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format table output
 */
export function formatTable(
  headers: string[],
  rows: string[][]
): string {
  const columnWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length))
  );

  const separator = columnWidths.map(w => '─'.repeat(w + 2)).join('┬');
  const headerLine = headers
    .map((h, i) => ` ${h.padEnd(columnWidths[i])} `)
    .join('│');

  const rowLines = rows.map(row =>
    row
      .map((c, i) => ` ${(c || '').padEnd(columnWidths[i])} `)
      .join('│')
  );

  return [
    `┌${separator}┐`,
    `│${headerLine}│`,
    `├${separator}┤`,
    ...rowLines.map(r => `│${r}│`),
    `└${separator}┘`,
  ].join('\n');
}
