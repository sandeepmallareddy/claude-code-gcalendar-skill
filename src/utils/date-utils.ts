/**
 * Date and time utilities for Google Calendar operations
 */

/**
 * Get user's local timezone
 * Defaults to system timezone, can be overridden with TIMEZONE env var
 */
export function getUserTimezone(): string {
  return process.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/**
 * Timezone configuration - user's local timezone
 */
export const DEFAULT_TIMEZONE = getUserTimezone();

/**
 * Format a date for Google Calendar API (RFC3339)
 * Supports timezone-aware formatting
 */
export function formatDateForApi(date: Date, timezone?: string): string {
  const tz = timezone || DEFAULT_TIMEZONE;

  if (tz && tz !== 'UTC') {
    // For specific timezones, use ISO string with timezone offset
    // Get the offset for this specific date
    const offset = -date.getTimezoneOffset(); // returns minutes ahead of UTC
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
  }

  // For UTC or no timezone, use ISO string with Z suffix
  return date.toISOString();
}

/**
 * Parse a date string into a Date object
 */
export function parseDate(dateString: string): Date {
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  return parsed;
}

/**
 * Get start of day (midnight)
 */
export function getStartOfDay(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59.999)
 */
export function getEndOfDay(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of week (Sunday)
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return getStartOfDay(d);
}

/**
 * Get end of week (Saturday)
 */
export function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  return getEndOfDay(d);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/**
 * Get duration in minutes between two dates
 */
export function getDurationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

/**
 * Format time for display (12-hour format)
 */
export function formatTime(date: Date, timezone?: string): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}

/**
 * Format date for display
 */
export function formatDate(date: Date, timezone?: string): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date, timezone?: string): string {
  return `${formatDate(date, timezone)} at ${formatTime(date, timezone)}`;
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get relative date description
 */
export function getRelativeDateDescription(date: Date): string {
  const today = getStartOfDay(new Date());
  const target = getStartOfDay(date);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `in ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(date);
}

/**
 * Parse natural language time expression
 */
export function parseTimeExpression(text: string): { hours: number; minutes: number } | null {
  // Match patterns like "3pm", "3:30pm", "15:00", "3 PM", "9am"
  const patterns = [
    /^(\d{1,2}):(\d{2})\s*(am|pm)$/i,       // 3:30pm
    /^(\d{1,2})\s*(am|pm)$/i,               // 9am, 3pm
    /^(\d{2}):(\d{2})$/,                    // 24-hour format
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let hours = parseInt(match[1], 10);
      let minutes = 0;
      let period: string | undefined;

      // Determine if we have minutes and period
      if (match[3]) {
        // Format: H:MMam/pm or Ham/pm
        minutes = match[2] ? parseInt(match[2], 10) : 0;
        period = match[3];
      } else if (match[2] && /^\d{2}$/.test(match[2])) {
        // Format: HH:MM (24-hour)
        minutes = parseInt(match[2], 10);
      } else if (match[2]) {
        // Format: Ham/pm (minutes part is actually the period)
        period = match[2];
      }

      // Convert to 24-hour format
      if (period) {
        const lowerPeriod = period.toLowerCase();
        if (lowerPeriod === 'pm' && hours < 12) {
          hours += 12;
        } else if (lowerPeriod === 'am' && hours === 12) {
          hours = 0;
        }
      }

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return { hours, minutes };
      }
    }
  }

  return null;
}

/**
 * Parse natural language duration expression
 */
export function parseDuration(text: string): number | null {
  // Match patterns like "30 minutes", "1 hour", "2 hours 30 minutes"
  const hourPattern = /(\d+)\s*(hour|hr|hours?)/i;
  const minutePattern = /(\d+)\s*(minute|min|minutes?)/i;

  const hourMatch = text.match(hourPattern);
  const minuteMatch = text.match(minutePattern);

  let totalMinutes = 0;

  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }

  return totalMinutes > 0 ? totalMinutes : null;
}

/**
 * Parse natural language date expression
 */
export function parseDateExpression(text: string): Date | null {
  const today = new Date();
  const lowerText = text.toLowerCase();

  // Today
  if (lowerText.includes('today')) {
    return getStartOfDay(today);
  }

  // Tomorrow
  if (lowerText.includes('tomorrow')) {
    return getStartOfDay(addDays(today, 1));
  }

  // Days of the week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayMatch = lowerText.match(new RegExp(`(${daysOfWeek.join('|')})`));
  if (dayMatch) {
    const targetDay = daysOfWeek.indexOf(dayMatch[1]);
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    return getStartOfDay(addDays(today, daysUntil));
  }

  // Date patterns like "January 15", "1/15/2024", "15th January"
  const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{4})?/;
  const dateMatch = text.match(datePattern);
  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10) - 1;
    const day = parseInt(dateMatch[2], 10);
    const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : today.getFullYear();
    return getStartOfDay(new Date(year, month, day));
  }

  return null;
}

/**
 * Check if two date ranges overlap
 */
export function doRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Sort dates array
 */
export function sortDates(dates: Date[]): Date[] {
  return [...dates].sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Get business hours range (9 AM - 5 PM)
 */
export function getBusinessHours(date: Date): { start: Date; end: Date } {
  const d = getStartOfDay(date);
  return {
    start: new Date(d.setHours(9, 0, 0, 0)),
    end: new Date(d.setHours(17, 0, 0, 0)),
  };
}
