/**
 * Unit tests for natural language parser
 */

import {
  parseNaturalLanguage,
  detectIntent,
  extractEntities,
  buildEventTitle,
  extractPersonFromQuery,
  classifyEventType,
} from '../../src/utils/natural-language';

describe('Natural Language Parser', () => {
  describe('detectIntent', () => {
    describe('availability intent', () => {
      it('should detect "find open slots"', () => {
        expect(detectIntent('find open slots tomorrow')).toBe('availability');
      });

      it('should detect "when am i free"', () => {
        expect(detectIntent('when am i free')).toBe('availability');
      });

      it('should detect "show me available time"', () => {
        expect(detectIntent('show me available time next week')).toBe('availability');
      });

      it('should detect "what\'s my free time"', () => {
        expect(detectIntent('what\'s my free time')).toBe('availability');
      });

      it('should detect "find me time"', () => {
        expect(detectIntent('find me time for a meeting')).toBe('availability');
      });
    });

    describe('create intent', () => {
      it('should detect "schedule"', () => {
        expect(detectIntent('schedule a meeting')).toBe('create');
      });

      it('should detect "create event"', () => {
        expect(detectIntent('create a new event tomorrow')).toBe('create');
      });

      it('should detect "book"', () => {
        expect(detectIntent('book a room for tomorrow')).toBe('create');
      });

      it('should detect "add meeting"', () => {
        expect(detectIntent('add a meeting with john')).toBe('create');
      });

      it('should detect "set up"', () => {
        expect(detectIntent('set up a call')).toBe('create');
      });
    });

    describe('list intent', () => {
      it('should detect "what\'s on my calendar"', () => {
        expect(detectIntent('what\'s on my calendar today')).toBe('list');
      });

      it('should detect "show my schedule"', () => {
        expect(detectIntent('show my schedule this week')).toBe('list');
      });

      it('should detect "list events"', () => {
        expect(detectIntent('list my upcoming events')).toBe('list');
      });

      it('should detect "what do i have"', () => {
        expect(detectIntent('what do i have tomorrow')).toBe('list');
      });
    });

    describe('update intent', () => {
      it('should detect "update"', () => {
        expect(detectIntent('update the meeting time')).toBe('update');
      });

      it('should detect "change"', () => {
        expect(detectIntent('change the event to 3pm')).toBe('update');
      });

      it('should detect "modify"', () => {
        expect(detectIntent('modify the meeting')).toBe('update');
      });

      it('should detect "move"', () => {
        expect(detectIntent('move the meeting to tomorrow')).toBe('update');
      });

      it('should detect "reschedule"', () => {
        expect(detectIntent('reschedule the call')).toBe('update');
      });
    });

    describe('delete intent', () => {
      it('should detect "delete"', () => {
        expect(detectIntent('delete the meeting')).toBe('delete');
      });

      it('should detect "cancel"', () => {
        expect(detectIntent('cancel the 3pm standup')).toBe('delete');
      });

      it('should detect "remove"', () => {
        expect(detectIntent('remove the event')).toBe('delete');
      });
    });

    describe('block intent', () => {
      it('should detect "block time"', () => {
        expect(detectIntent('block 2 hours for deep work')).toBe('block');
      });

      it('should detect "mark as busy"', () => {
        expect(detectIntent('mark me as busy this afternoon')).toBe('block');
      });

      it('should detect "focus block"', () => {
        expect(detectIntent('focus block 9-11am')).toBe('block');
      });

      it('should detect "out of office"', () => {
        expect(detectIntent('out of office next friday')).toBe('block');
      });
    });

    describe('analyze intent', () => {
      it('should detect "how much time"', () => {
        expect(detectIntent('how much time did i spend in meetings')).toBe('analyze');
      });

      it('should detect "time usage"', () => {
        expect(detectIntent('show my time usage this week')).toBe('analyze');
      });

      it('should detect "meeting count"', () => {
        expect(detectIntent('how many meetings this week')).toBe('analyze');
      });

      it('should detect "busiest day"', () => {
        expect(detectIntent('what\'s my busiest day')).toBe('analyze');
      });
    });
  });

  describe('extractEntities', () => {
    it('should extract email addresses', () => {
      const result = extractEntities('schedule meeting with john@example.com');
      expect(result.attendees).toEqual(['john@example.com']);
    });

    it('should extract multiple email addresses', () => {
      const result = extractEntities('meeting with john@example.com and jane@company.com');
      expect(result.attendees).toEqual(['john@example.com', 'jane@company.com']);
    });

    it('should handle empty query', () => {
      const result = extractEntities('');
      expect(result).toEqual({ searchTerms: [] });
    });
  });

  describe('parseNaturalLanguage', () => {
    it('should parse a complete query', () => {
      const result = parseNaturalLanguage('schedule a meeting with john@example.com tomorrow at 3pm');

      expect(result.intent).toBe('create');
      expect(result.originalQuery).toBe('schedule a meeting with john@example.com tomorrow at 3pm');
      expect(result.entities.attendees).toContain('john@example.com');
    });

    it('should parse availability query', () => {
      const result = parseNaturalLanguage('find open slots next week for 1 hour');

      expect(result.intent).toBe('availability');
      expect(result.originalQuery).toBe('find open slots next week for 1 hour');
      expect(result.entities.duration).toBe(60);
    });
  });

  describe('buildEventTitle', () => {
    it('should use provided title', () => {
      const entities = { title: 'Team Standup', searchTerms: [] };
      expect(buildEventTitle(entities)).toBe('Team Standup');
    });

    it('should build title from attendees', () => {
      const entities = { attendees: ['john@example.com'], searchTerms: [] };
      expect(buildEventTitle(entities)).toBe('Meeting with john');
    });

    it('should return default title when no info', () => {
      const entities = { searchTerms: [] };
      expect(buildEventTitle(entities)).toBe('New Event');
    });
  });

  describe('extractPersonFromQuery', () => {
    it('should extract person name after "with"', () => {
      const result = extractPersonFromQuery('meeting with john');
      expect(result).toBe('john');
    });

    it('should return null when no person found', () => {
      const result = extractPersonFromQuery('what\'s on my calendar');
      expect(result).toBeNull();
    });
  });

  describe('classifyEventType', () => {
    it('should classify "standup"', () => {
      expect(classifyEventType('daily standup')).toBe('standup');
    });

    it('should classify "one-on-one"', () => {
      expect(classifyEventType('1:1 with manager')).toBe('one-on-one');
    });

    it('should classify "review"', () => {
      expect(classifyEventType('code review')).toBe('review');
    });

    it('should classify "sync"', () => {
      expect(classifyEventType('team sync')).toBe('sync');
    });

    it('should default to "meeting"', () => {
      expect(classifyEventType('some random event')).toBe('meeting');
    });
  });
});
