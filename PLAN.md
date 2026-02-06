# Google Calendar Skill - Project Plan

## Overview
A Claude Code skill for managing Google Calendar through natural language, including finding open slots, scheduling meetings, blocking time, and analyzing time usage.

## Architecture

### Skill Structure
```
.claude/skills/gcalendar/
├── SKILL.md                 # Main skill file with Claude instructions
├── README.md               # This file
├── src/
│   ├── index.ts            # Entry point
│   ├── client/
│   │   ├── calendar-client.ts    # Google Calendar API wrapper
│   │   ├── auth.ts               # OAuth2 authentication
│   │   └── types.ts              # TypeScript type definitions
│   ├── commands/
│   │   ├── availability.ts       # Find open slots
│   │   ├── create-event.ts       # Create meetings/events
│   │   ├── manage-event.ts       # Update/delete events
│   │   ├── analyze-time.ts       # Time usage analysis
│   │   └── block-time.ts         # Block time for focus
│   ├── utils/
│   │   ├── date-utils.ts         # Date/time utilities
│   │   ├── natural-language.ts   # NLP parsing
│   │   └── formatters.ts         # Output formatting
│   └── cli/
│       └── gcalendar.ts          # CLI entry point
├── tests/
│   ├── unit/
│   │   ├── date-utils.test.ts
│   │   ├── natural-language.test.ts
│   │   └── formatters.test.ts
│   ├── integration/
│   │   ├── calendar-client.test.ts
│   │   ├── availability.test.ts
│   │   └── create-event.test.ts
│   └── functional/
│       ├── availability-scenarios.test.ts
│       ├── event-management-scenarios.test.ts
│       └── time-analysis-scenarios.test.ts
├── scripts/
│   ├── auth-setup.ts       # OAuth2 setup script
│   └── generate-token.ts   # Token generation helper
├── docs/
│   ├── installation.md
│   ├── usage.md
│   ├── authentication.md
│   └── examples.md
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
├── .gitignore
└── LICENSE
```

## Features

### 1. Availability Query
- Find open time slots
- Check availability for specific dates/times
- Find slots for meetings of specific duration
- Check multiple attendees' availability

### 2. Event Creation
- Create meetings with natural language
- Set title, description, location
- Add attendees by email
- Set start/end times
- Add reminders and notifications
- Create recurring events

### 3. Event Management
- List upcoming events
- Update event details
- Delete/cancel events
- Find events by name/date
- Get event details

### 4. Time Blocking
- Block time for focus/work
- Mark as "busy" without event details
- Create "out of office" blocks
- recurring blocks

### 5. Time Analysis
- Analyze time usage by category
- Weekly/monthly summaries
- Meeting load statistics
- Free vs busy time ratios

## Testing Strategy (TDD)

### Unit Tests (70% of tests)
- Date/time utilities
- Natural language parsing
- Output formatting
- Input validation
- Error handling

### Integration Tests (20% of tests)
- Google Calendar API client
- OAuth2 authentication flow
- API rate limiting
- Error responses

### Functional Tests (10% of tests)
- Complete user scenarios
- End-to-end workflows
- Natural language understanding

### Coverage Targets
- Unit: 90%+
- Integration: 80%+
- Functional: 70%+
- Overall: 85%+

## Technology Stack
- **Language**: TypeScript
- **API**: googleapis (official Google APIs client)
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier
- **CI/CD**: GitHub Actions

## Natural Language Patterns

### Availability Queries
- "Find open slots tomorrow"
- "When is everyone free next week?"
- "Show me 1-hour slots on Friday afternoon"
- "What's open between 2pm and 4pm?"

### Event Creation
- "Schedule a meeting with john@example.com tomorrow at 3pm"
- "Create a team standup every Monday at 9am"
- "Book a 30-minute call with Sarah"
- "Add lunch with mom on Friday at noon"

### Event Management
- "What's on my calendar today?"
- "Find my meeting with John"
- "Cancel the 3pm standup"
- "Move my 2pm meeting to 4pm"

### Time Blocking
- "Block 2 hours for deep work tomorrow"
- "Mark me as busy this afternoon"
- "Set up a focus block 9-11am daily"

### Time Analysis
- "How much time did I spend in meetings this week?"
- "Show my meeting distribution"
- "What's my busiest day?"

## Development Phases

### Phase 1: Foundation
- [ ] Set up project structure
- [ ] Configure TypeScript and testing
- [ ] Create authentication flow
- [ ] Implement basic Calendar API client
- [ ] Write unit tests for auth and client

### Phase 2: Core Features
- [ ] Implement availability queries
- [ ] Implement event creation
- [ ] Implement event management
- [ ] Write integration tests
- [ ] Create CLI interface

### Phase 3: Advanced Features
- [ ] Implement time blocking
- [ ] Implement time analysis
- [ ] Add natural language processing
- [ ] Write functional tests

### Phase 4: Polish
- [ ] Add comprehensive documentation
- [ ] Set up CI/CD
- [ ] Achieve coverage targets
- [ ] Create usage examples
- [ ] Final code review

## Authentication Strategy

The skill will use OAuth 2.0 for Google Calendar API access:
1. User runs `npm run auth` to set up credentials
2. Opens Google Cloud Console to create OAuth credentials
3. Skill stores tokens securely
4. Tokens refresh automatically

## Success Criteria
- [ ] All natural language patterns work correctly
- [ ] Test coverage meets targets
- [ ] Documentation is comprehensive
- [ ] CI/CD pipeline passes
- [ ] README meets open source standards
