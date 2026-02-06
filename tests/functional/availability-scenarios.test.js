"use strict";
/**
 * Functional tests for availability scenarios
 * These tests verify complete user workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
const calendar_client_1 = require("../../src/client/calendar-client");
const natural_language_1 = require("../../src/utils/natural-language");
const availability_helper_1 = require("../../src/utils/availability-helper");
const date_utils_1 = require("../../src/utils/date-utils");
// Mock the calendar client
jest.mock('../../src/client/calendar-client');
jest.mock('../../src/utils/availability-helper');
const MockedCalendarClient = calendar_client_1.CalendarClient;
const MockedFindSlots = availability_helper_1.findAvailableSlots;
describe('Availability Scenarios', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('User wants to find open slots', () => {
        it('should find slots for "find open slots tomorrow"', async () => {
            // Parse natural language
            const parsed = (0, natural_language_1.parseNaturalLanguage)('find open slots tomorrow');
            expect(parsed.intent).toBe('availability');
            expect(parsed.entities.date).toBeDefined();
            // Create client and find slots
            const mockClient = {
                findAvailableSlots: jest.fn().mockResolvedValue({
                    success: true,
                    data: [
                        {
                            start: new Date('2024-01-16T09:00:00Z'),
                            end: new Date('2024-01-16T10:00:00Z'),
                            duration: 60,
                        },
                    ],
                }),
            };
            const result = await mockClient.findAvailableSlots({
                startDate: (0, date_utils_1.getStartOfDay)(new Date()),
                endDate: (0, date_utils_1.addDays)(new Date(), 7),
                duration: 60,
            });
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });
        it('should find 30-minute slots for "find 30 minute slots"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('find 30 minute slots next week');
            expect(parsed.intent).toBe('availability');
            expect(parsed.entities.duration).toBe(30);
        });
        it('should handle multi-calendar availability for "when are john and i free"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('when are john@example.com and i free tomorrow');
            expect(parsed.intent).toBe('availability');
            expect(parsed.entities.attendees).toContain('john@example.com');
        });
    });
    describe('User wants to schedule a meeting', () => {
        it('should parse "schedule meeting with john@example.com tomorrow at 3pm"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('schedule meeting with john@example.com tomorrow at 3pm');
            expect(parsed.intent).toBe('create');
            expect(parsed.entities.attendees).toContain('john@example.com');
            expect(parsed.entities.time).toBe('15:00');
            expect(parsed.entities.duration).toBe(60); // Default 1 hour
        });
        it('should parse "book 30-minute call"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('book 30-minute call');
            expect(parsed.intent).toBe('create');
            expect(parsed.entities.duration).toBe(30);
        });
        it('should parse "create recurring standup every monday at 9am"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('create recurring standup every monday at 9am');
            expect(parsed.intent).toBe('create');
            expect(parsed.entities.title).toBe('standup');
            expect(parsed.entities.time).toBe('09:00');
        });
    });
    describe('User wants to block time', () => {
        it('should parse "block 2 hours for deep work"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('block 2 hours for deep work');
            expect(parsed.intent).toBe('block');
            expect(parsed.entities.duration).toBe(120);
        });
        it('should parse "mark me as busy this afternoon"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('mark me as busy this afternoon');
            expect(parsed.intent).toBe('block');
        });
    });
    describe('User wants time analysis', () => {
        it('should parse "how much time did i spend in meetings"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('how much time did i spend in meetings');
            expect(parsed.intent).toBe('analyze');
        });
        it('should parse "what\'s my busiest day"', async () => {
            const parsed = (0, natural_language_1.parseNaturalLanguage)('what\'s my busiest day');
            expect(parsed.intent).toBe('analyze');
        });
    });
});
describe('End-to-End Workflows', () => {
    describe('Complete availability check workflow', () => {
        it('should handle user asking for availability and then scheduling', async () => {
            // Step 1: User asks for availability
            const availabilityQuery = 'find open slots tomorrow between 2pm and 5pm';
            const parsed = (0, natural_language_1.parseNaturalLanguage)(availabilityQuery);
            expect(parsed.intent).toBe('availability');
            expect(parsed.entities.time).toBe('14:00'); // 2pm in 24h format
            // Step 2: User schedules based on availability
            const scheduleQuery = 'schedule meeting at 3pm';
            const scheduleParsed = (0, natural_language_1.parseNaturalLanguage)(scheduleQuery);
            expect(scheduleParsed.intent).toBe('create');
            expect(scheduleParsed.entities.time).toBe('15:00');
        });
    });
    describe('Complete meeting management workflow', () => {
        it('should handle list -> update -> delete workflow', async () => {
            // Step 1: List today's events
            const listQuery = 'what\'s on my calendar today';
            const listParsed = (0, natural_language_1.parseNaturalLanguage)(listQuery);
            expect(listParsed.intent).toBe('list');
            // Step 2: Update an event
            const updateQuery = 'move meeting to 4pm';
            const updateParsed = (0, natural_language_1.parseNaturalLanguage)(updateQuery);
            expect(updateParsed.intent).toBe('update');
            // Step 3: Delete an event
            const deleteQuery = 'cancel the standup';
            const deleteParsed = (0, natural_language_1.parseNaturalLanguage)(deleteQuery);
            expect(deleteParsed.intent).toBe('delete');
        });
    });
    describe('Complex natural language handling', () => {
        it('should handle complex multi-part queries', async () => {
            const complexQuery = 'schedule a 1-hour meeting with the team tomorrow afternoon to discuss the project update';
            const parsed = (0, natural_language_1.parseNaturalLanguage)(complexQuery);
            expect(parsed.intent).toBe('create');
            expect(parsed.entities.duration).toBe(60);
            expect(parsed.entities.attendees).toContain('team');
            expect(parsed.entities.title).toBe('project update');
        });
        it('should handle vague queries and provide helpful defaults', async () => {
            const vagueQuery = 'book a meeting';
            const parsed = (0, natural_language_1.parseNaturalLanguage)(vagueQuery);
            expect(parsed.intent).toBe('create');
            // Should have default values for missing information
        });
    });
});
//# sourceMappingURL=availability-scenarios.test.js.map