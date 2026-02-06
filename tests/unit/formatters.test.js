"use strict";
/**
 * Unit tests for formatters
 */
Object.defineProperty(exports, "__esModule", { value: true });
const formatters_1 = require("../../src/utils/formatters");
describe('Formatters', () => {
    describe('formatTimeSlots', () => {
        it('should format empty slots', () => {
            const result = (0, formatters_1.formatTimeSlots)([]);
            expect(result).toBe('No available time slots found.');
        });
        it('should format single slot', () => {
            const slots = [
                {
                    start: new Date('2024-01-15T14:00:00Z'),
                    end: new Date('2024-01-15T15:00:00Z'),
                    duration: 60,
                },
            ];
            const result = (0, formatters_1.formatTimeSlots)(slots);
            expect(result).toContain('Available Slots:');
            expect(result).toContain('2:00 PM - 3:00 PM');
            expect(result).toContain('(1 hour)');
        });
        it('should format multiple slots', () => {
            const slots = [
                {
                    start: new Date('2024-01-15T09:00:00Z'),
                    end: new Date('2024-01-15T10:00:00Z'),
                    duration: 60,
                },
                {
                    start: new Date('2024-01-15T14:00:00Z'),
                    end: new Date('2024-01-15T15:00:00Z'),
                    duration: 60,
                },
            ];
            const result = (0, formatters_1.formatTimeSlots)(slots);
            expect(result).toContain('•');
            expect(result).toContain('9:00 AM - 10:00 AM');
            expect(result).toContain('2:00 PM - 3:00 PM');
        });
    });
    describe('formatEvent', () => {
        const mockEvent = {
            id: 'event-1',
            summary: 'Team Standup',
            description: 'Daily team sync',
            location: 'Conference Room A',
            start: {
                dateTime: '2024-01-15T09:00:00Z',
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: '2024-01-15T09:30:00Z',
                timeZone: 'America/New_York',
            },
            attendees: [
                { email: 'john@example.com', displayName: 'John Doe' },
                { email: 'jane@example.com', displayName: 'Jane Smith' },
            ],
            status: 'confirmed',
            htmlLink: 'https://calendar.google.com/event?id=event-1',
        };
        it('should format event with all details', () => {
            const result = (0, formatters_1.formatEvent)(mockEvent);
            expect(result).toContain('📅 Team Standup');
            expect(result).toContain('🕐');
            expect(result).toContain('📍 Conference Room A');
            expect(result).toContain('👥 John Doe, Jane Smith');
            expect(result).toContain('📝 Daily team sync');
            expect(result).toContain('[View in Calendar]');
        });
        it('should handle event without optional fields', () => {
            const minimalEvent = {
                id: 'event-2',
                summary: 'Simple Meeting',
                start: {
                    dateTime: '2024-01-15T10:00:00Z',
                },
                end: {
                    dateTime: '2024-01-15T11:00:00Z',
                },
            };
            const result = (0, formatters_1.formatEvent)(minimalEvent);
            expect(result).toContain('📅 Simple Meeting');
            expect(result).not.toContain('📍');
            expect(result).not.toContain('👥');
        });
    });
    describe('formatEventList', () => {
        const mockEvents = [
            {
                id: 'event-1',
                summary: 'Morning Standup',
                start: { dateTime: '2024-01-15T09:00:00Z' },
                end: { dateTime: '2024-01-15T09:30:00Z' },
            },
            {
                id: 'event-2',
                summary: 'Client Meeting',
                start: { dateTime: '2024-01-15T14:00:00Z' },
                end: { dateTime: '2024-01-15T15:00:00Z' },
            },
        ];
        it('should format list with title', () => {
            const result = (0, formatters_1.formatEventList)(mockEvents, 'Your Calendar');
            expect(result).toContain('Your Calendar');
            expect(result).toContain('Morning Standup');
            expect(result).toContain('Client Meeting');
        });
        it('should handle empty list', () => {
            const result = (0, formatters_1.formatEventList)([], 'Empty Calendar');
            expect(result).toContain('Empty Calendar');
            expect(result).toContain('No events found');
        });
    });
    describe('formatEventConfirmation', () => {
        const mockEvent = {
            id: 'event-1',
            summary: 'Team Meeting',
            start: { dateTime: '2024-01-15T10:00:00Z' },
            end: { dateTime: '2024-01-15T11:00:00Z' },
            attendees: [{ email: 'test@example.com' }],
        };
        it('should format created confirmation', () => {
            const result = (0, formatters_1.formatEventConfirmation)(mockEvent, 'created');
            expect(result).toContain('✓');
            expect(result).toContain('Created');
            expect(result).toContain('Team Meeting');
            expect(result).toContain('1 attendee');
        });
        it('should format updated confirmation', () => {
            const result = (0, formatters_1.formatEventConfirmation)(mockEvent, 'updated');
            expect(result).toContain('✏️');
            expect(result).toContain('Updated');
        });
        it('should format deleted confirmation', () => {
            const result = (0, formatters_1.formatEventConfirmation)(mockEvent, 'deleted');
            expect(result).toContain('🗑️');
            expect(result).toContain('Deleted');
        });
    });
    describe('formatTimeUsageSummary', () => {
        const mockSummary = {
            totalHours: 40,
            meetingHours: 15,
            focusHours: 10,
            freeHours: 15,
            meetingCount: 12,
            busiestDay: 'Wednesday',
            dayBreakdown: [
                { day: 'Monday', hours: 8, meetingCount: 3 },
                { day: 'Tuesday', hours: 7, meetingCount: 2 },
                { day: 'Wednesday', hours: 10, meetingCount: 4 },
            ],
        };
        it('should format time usage summary', () => {
            const result = (0, formatters_1.formatTimeUsageSummary)(mockSummary);
            expect(result).toContain('Time Usage Summary');
            expect(result).toContain('Total Tracked Time: 40 hours');
            expect(result).toContain('Meetings:');
            expect(result).toContain('Focus Time:');
            expect(result).toContain('Free Time:');
            expect(result).toContain('Meeting Count: 12 meetings');
            expect(result).toContain('Busiest Day: Wednesday');
        });
        it('should show visual bars', () => {
            const result = (0, formatters_1.formatTimeUsageSummary)(mockSummary);
            expect(result).toContain('█');
            expect(result).toContain('░');
        });
    });
    describe('formatError', () => {
        it('should format error with message', () => {
            const result = (0, formatters_1.formatError)('Event not found', 'Try a different search');
            expect(result).toContain('❌');
            expect(result).toContain('Event not found');
            expect(result).toContain('💡');
            expect(result).toContain('Try a different search');
        });
        it('should format error without suggestion', () => {
            const result = (0, formatters_1.formatError)('Unknown error');
            expect(result).toContain('❌');
            expect(result).toContain('Unknown error');
            expect(result).not.toContain('💡');
        });
    });
    describe('formatSuccess', () => {
        it('should format success message', () => {
            const result = (0, formatters_1.formatSuccess)('Operation completed');
            expect(result).toBe('✅ Operation completed');
        });
    });
    describe('formatJson', () => {
        it('should format object as JSON', () => {
            const result = (0, formatters_1.formatJson)({ name: 'test', value: 123 });
            expect(result).toContain('"name": "test"');
            expect(result).toContain('"value": 123');
        });
    });
    describe('formatTable', () => {
        it('should format table with headers and rows', () => {
            const result = (0, formatters_1.formatTable)(['Name', 'Value'], [['Test 1', '100'], ['Test 2', '200']]);
            expect(result).toContain('Name');
            expect(result).toContain('Value');
            expect(result).toContain('Test 1');
            expect(result).toContain('100');
        });
    });
});
//# sourceMappingURL=formatters.test.js.map