/**
 * Unit tests for date utilities
 */

import {
  formatDateForApi,
  parseDate,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  addDays,
  addHours,
  addMinutes,
  getDurationMinutes,
  formatTime,
  formatDate,
  formatDateTime,
  formatDuration,
  getRelativeDateDescription,
  parseTimeExpression,
  parseDuration,
  parseDateExpression,
  doRangesOverlap,
  sortDates,
  getBusinessHours,
  DEFAULT_TIMEZONE,
} from '../../src/utils/date-utils';

describe('Date Utilities', () => {
  describe('formatDateForApi', () => {
    it('should format date to RFC3339 format', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = formatDateForApi(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2024-01-15');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
    });

    it('should throw error for invalid date', () => {
      expect(() => parseDate('invalid')).toThrow('Invalid date: invalid');
    });
  });

  describe('getStartOfDay', () => {
    it('should return midnight of the same day', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = getStartOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return 23:59:59.999 of the same day', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = getEndOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('getStartOfWeek', () => {
    it('should return Sunday of the current week', () => {
      // Wednesday, January 17, 2024
      const date = new Date('2024-01-17T12:00:00');
      const result = getStartOfWeek(date);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getDate()).toBe(14);
    });
  });

  describe('getEndOfWeek', () => {
    it('should return Saturday of the current week', () => {
      // Wednesday, January 17, 2024
      const date = new Date('2024-01-17T12:00:00');
      const result = getEndOfWeek(date);
      expect(result.getDay()).toBe(6); // Saturday
      expect(result.getDate()).toBe(20);
    });
  });

  describe('addDays', () => {
    it('should add specified number of days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    it('should handle negative days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('addHours', () => {
    it('should add specified number of hours', () => {
      const date = new Date('2024-01-15T10:00:00');
      const result = addHours(date, 3);
      expect(result.getHours()).toBe(13);
    });

    it('should handle day rollover', () => {
      const date = new Date('2024-01-15T23:00:00');
      const result = addHours(date, 3);
      expect(result.getDate()).toBe(16);
      expect(result.getHours()).toBe(2);
    });
  });

  describe('addMinutes', () => {
    it('should add specified number of minutes', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = addMinutes(date, 45);
      expect(result.getMinutes()).toBe(15);
      expect(result.getHours()).toBe(11);
    });
  });

  describe('getDurationMinutes', () => {
    it('should return correct duration', () => {
      const start = new Date('2024-01-15T10:00:00');
      const end = new Date('2024-01-15T11:30:00');
      const result = getDurationMinutes(start, end);
      expect(result).toBe(90);
    });

    it('should handle same time', () => {
      const date = new Date('2024-01-15T10:00:00');
      const result = getDurationMinutes(date, date);
      expect(result).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format time in 12-hour format', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatTime(date);
      expect(result).toBe('2:30 PM');
    });

    it('should handle midnight', () => {
      const date = new Date('2024-01-15T00:00:00');
      const result = formatTime(date);
      expect(result).toBe('12:00 AM');
    });

    it('should handle noon', () => {
      const date = new Date('2024-01-15T12:00:00');
      const result = formatTime(date);
      expect(result).toBe('12:00 PM');
    });
  });

  describe('formatDate', () => {
    it('should format date in full format', () => {
      const date = new Date('2024-01-15T12:00:00');
      const result = formatDate(date);
      expect(result).toContain('Monday');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time together', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toContain('January');
      expect(result).toContain('2:30 PM');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(30)).toBe('30 min');
    });

    it('should format hours only', () => {
      expect(formatDuration(60)).toBe('1 hour');
      expect(formatDuration(120)).toBe('2 hours');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(150)).toBe('2h 30m');
    });
  });

  describe('getRelativeDateDescription', () => {
    it('should return Today for current day', () => {
      const today = new Date();
      const result = getRelativeDateDescription(today);
      expect(result).toBe('Today');
    });

    it('should return Tomorrow for next day', () => {
      const tomorrow = addDays(new Date(), 1);
      const result = getRelativeDateDescription(tomorrow);
      expect(result).toBe('Tomorrow');
    });

    it('should return Yesterday for previous day', () => {
      const yesterday = addDays(new Date(), -1);
      const result = getRelativeDateDescription(yesterday);
      expect(result).toBe('Yesterday');
    });
  });

  describe('parseTimeExpression', () => {
    it('should parse 12-hour format with minutes', () => {
      const result = parseTimeExpression('3:30pm');
      expect(result).toEqual({ hours: 15, minutes: 30 });
    });

    it('should parse 12-hour format without minutes', () => {
      const result = parseTimeExpression('9am');
      expect(result).toEqual({ hours: 9, minutes: 0 });
    });

    it('should parse 24-hour format', () => {
      const result = parseTimeExpression('14:30');
      expect(result).toEqual({ hours: 14, minutes: 30 });
    });

    it('should handle uppercase AM/PM', () => {
      const result = parseTimeExpression('3:30PM');
      expect(result).toEqual({ hours: 15, minutes: 30 });
    });

    it('should return null for invalid time', () => {
      expect(parseTimeExpression('invalid')).toBeNull();
    });
  });

  describe('parseDuration', () => {
    it('should parse hours', () => {
      expect(parseDuration('2 hours')).toBe(120);
      expect(parseDuration('1 hour')).toBe(60);
    });

    it('should parse minutes', () => {
      expect(parseDuration('30 minutes')).toBe(30);
      expect(parseDuration('15 min')).toBe(15);
    });

    it('should parse combined', () => {
      expect(parseDuration('1 hour 30 minutes')).toBe(90);
    });

    it('should return null for invalid duration', () => {
      expect(parseDuration('invalid')).toBeNull();
    });
  });

  describe('parseDateExpression', () => {
    it('should parse "today"', () => {
      const today = new Date();
      const result = parseDateExpression('today');
      expect(result?.toDateString()).toBe(today.toDateString());
    });

    it('should parse "tomorrow"', () => {
      const tomorrow = addDays(new Date(), 1);
      const result = parseDateExpression('tomorrow');
      expect(result?.toDateString()).toBe(tomorrow.toDateString());
    });

    it('should parse day of week', () => {
      const result = parseDateExpression('Monday');
      expect(result?.toLocaleDateString('en-US', { weekday: 'long' })).toBe('Monday');
    });

    it('should return null for unknown expression', () => {
      expect(parseDateExpression('someday')).toBeNull();
    });
  });

  describe('doRangesOverlap', () => {
    it('should return true for overlapping ranges', () => {
      const start1 = new Date('2024-01-15T10:00:00');
      const end1 = new Date('2024-01-15T12:00:00');
      const start2 = new Date('2024-01-15T11:00:00');
      const end2 = new Date('2024-01-15T13:00:00');

      expect(doRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('should return false for non-overlapping ranges', () => {
      const start1 = new Date('2024-01-15T10:00:00');
      const end1 = new Date('2024-01-15T11:00:00');
      const start2 = new Date('2024-01-15T12:00:00');
      const end2 = new Date('2024-01-15T13:00:00');

      expect(doRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });
  });

  describe('sortDates', () => {
    it('should sort dates in ascending order', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-10'),
        new Date('2024-01-20'),
      ];
      const result = sortDates(dates);
      expect(result[0].toDateString()).toBe(new Date('2024-01-10').toDateString());
      expect(result[1].toDateString()).toBe(new Date('2024-01-15').toDateString());
      expect(result[2].toDateString()).toBe(new Date('2024-01-20').toDateString());
    });
  });

  describe('getBusinessHours', () => {
    it('should return 9 AM to 5 PM', () => {
      const date = new Date('2024-01-15T12:00:00');
      const result = getBusinessHours(date);
      expect(result.start.getHours()).toBe(9);
      expect(result.end.getHours()).toBe(17);
    });
  });
});
