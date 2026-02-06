/**
 * Availability helper utilities
 */

import type { TimeSlot, AvailabilityParams, CalendarEvent } from '../client/types';
import { getDurationMinutes, getStartOfDay, getEndOfDay, addDays } from './date-utils';

/**
 * Find available slots given busy times
 */
export function findAvailableSlots(
  busySlots: TimeSlot[],
  startDate: Date,
  endDate: Date,
  minDuration: number
): TimeSlot[] {
  const gaps: TimeSlot[] = [];

  // Sort busy slots by start time
  const sorted = [...busySlots].sort((a, b) => a.start.getTime() - b.start.getTime());

  let current = getStartOfDay(startDate);

  for (const busy of sorted) {
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
  const endOfPeriod = getEndOfDay(endDate);
  if (current < endOfPeriod) {
    const gapDuration = getDurationMinutes(current, endOfPeriod);
    if (gapDuration >= minDuration) {
      gaps.push({
        start: current,
        end: endOfPeriod,
        duration: gapDuration,
      });
    }
  }

  return gaps;
}

/**
 * Merge overlapping time slots
 */
export function mergeTimeSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.length === 0) return [];

  const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: TimeSlot[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      if (current.end > last.end) {
        last.end = current.end;
        last.duration = getDurationMinutes(last.start, last.end);
      }
    } else {
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Find mutual availability across multiple calendars
 */
export function findMutualAvailability(
  calendarBusyTimes: Map<string, TimeSlot[]>,
  startDate: Date,
  endDate: Date,
  minDuration: number
): TimeSlot[] {
  // Combine all busy times
  const allBusy: TimeSlot[] = [];
  for (const slots of calendarBusyTimes.values()) {
    allBusy.push(...slots);
  }

  // Merge overlapping busy times
  const mergedBusy = mergeTimeSlots(allBusy);

  // Find gaps
  return findAvailableSlots(mergedBusy, startDate, endDate, minDuration);
}

/**
 * Filter slots by time of day (e.g., only morning slots)
 */
export function filterSlotsByTimeOfDay(
  slots: TimeSlot[],
  startHour: number,
  endHour: number
): TimeSlot[] {
  return slots.filter(slot => {
    const slotStart = slot.start.getHours();
    const slotEnd = slot.end.getHours();
    return slotStart >= startHour && slotEnd <= endHour;
  });
}

/**
 * Get the best slots (prioritize longer slots in business hours)
 */
export function getBestSlots(
  slots: TimeSlot[],
  maxResults: number = 5
): TimeSlot[] {
  return slots
    .sort((a, b) => b.duration - a.duration) // Longer slots first
    .slice(0, maxResults);
}

/**
 * Check if a specific time slot is available
 */
export function isSlotAvailable(
  slot: TimeSlot,
  busySlots: TimeSlot[]
): boolean {
  return !busySlots.some(busy =>
    busy.start < slot.end && busy.end > slot.start
  );
}

/**
 * Suggest optimal meeting times
 */
export function suggestOptimalTimes(
  busySlots: TimeSlot[],
  startDate: Date,
  endDate: Date,
  duration: number,
  preferences?: {
    preferMorning?: boolean;
    preferAfternoon?: boolean;
    avoidLunch?: boolean;
  }
): TimeSlot[] {
  let available = findAvailableSlots(busySlots, startDate, endDate, duration);

  if (preferences?.avoidLunch) {
    available = filterSlotsByTimeOfDay(available, 9, 12); // Before lunch
    available = filterSlotsByTimeOfDay(available, 13, 17); // After lunch
  }

  if (preferences?.preferMorning) {
    // Sort morning slots first
    available.sort((a, b) => {
      const aMorning = a.start.getHours() < 12 ? 1 : 0;
      const bMorning = b.start.getHours() < 12 ? 1 : 0;
      return bMorning - aMorning;
    });
  }

  if (preferences?.preferAfternoon) {
    available.sort((a, b) => {
      const aAfternoon = a.start.getHours() >= 12 ? 1 : 0;
      const bAfternoon = b.start.getHours() >= 12 ? 1 : 0;
      return bAfternoon - aAfternoon;
    });
  }

  return getBestSlots(available);
}
