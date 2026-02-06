---
name: gcalendar
description: Manage Google Calendar with natural language. Use for finding open slots, scheduling meetings, blocking time, and analyzing time usage. Say things like "Find time tomorrow" or "Schedule a meeting with John".
disable-model-invocation: false
user-invocable: true
allowed-tools: Bash, Read, Write, Grep, Glob
context: fork
agent: general-purpose
---

# Google Calendar Skill

Use this skill to manage Google Calendar through natural language commands. Claude will execute the appropriate script from the skill's CLI to fulfill your request.

## Core Commands

### Finding Availability

When the user wants to find open time slots:

1. Parse the natural language request to extract:
   - Date/time constraints
   - Duration requirements
   - Attendee emails (if checking multiple calendars)

2. Execute: `npm run gcalendar -- availability "<parsed-request>"`

3. Present the results clearly with:
   - Available time slots in a readable format
   - Timezone information
   - Any conflicts mentioned

**Example queries:**
- "Find open slots tomorrow"
- "When is everyone free next week?"
- "Show me 1-hour slots on Friday afternoon"
- "What's open between 2pm and 4pm?"
- "Find time for a 30-minute meeting"

### Creating Events

When the user wants to schedule a meeting or event:

1. Parse the natural language request to extract:
   - Event title/subject
   - Date and time
   - Duration
   - Attendee emails
   - Location (if mentioned)
   - Description (if mentioned)

2. Execute: `npm run gcalendar -- create "<parsed-request>"`

3. Confirm the event was created with:
   - Event title and time
   - Attendees added
   - Any special settings (recurring, reminders)

**Example queries:**
- "Schedule a meeting with john@example.com tomorrow at 3pm"
- "Create a team standup every Monday at 9am"
- "Book a 30-minute call with Sarah"
- "Add lunch with mom on Friday at noon"
- "Set up a 1-hour review meeting next Thursday"

### Managing Events

When the user wants to view, update, or delete events:

1. Determine the action:
   - **List/View**: Extract date or search term
   - **Update**: Extract event identifier and changes
   - **Delete**: Extract event identifier and confirm

2. Execute the appropriate command:
   - List: `npm run gcalendar -- list "<request>"`
   - Get details: `npm run gcalendar -- get "<event-search>"`
   - Update: `npm run gcalendar -- update "<request>"`
   - Delete: `npm run gcalendar -- delete "<event-search>"`

3. Present results with clear confirmation

**Example queries:**
- "What's on my calendar today?"
- "Find my meeting with John"
- "Cancel the 3pm standup"
- "Move my 2pm meeting to 4pm"
- "Update the team meeting to be an hour long"

### Blocking Time

When the user wants to mark time as unavailable:

1. Parse the request for:
   - Duration
   - Date/time
   - Block type (focus, out of office, etc.)

2. Execute: `npm run gcalendar -- block "<request>"`

3. Confirm the block was created

**Example queries:**
- "Block 2 hours for deep work tomorrow"
- "Mark me as busy this afternoon"
- "Set up a focus block 9-11am daily"
- "I'm out of office next Friday"

### Analyzing Time Usage

When the user wants to understand their calendar patterns:

1. Parse the request for:
   - Time period (week, month, etc.)
   - Analysis type (meetings, free time, distribution)

2. Execute: `npm run gcalendar -- analyze "<request>"`

3. Present statistics in a readable format

**Example queries:**
- "How much time did I spend in meetings this week?"
- "Show my meeting distribution"
- "What's my busiest day?"
- "Free vs busy time this month"

## Response Formatting

### Time Slots
```
Available Slots:
• Today, 2:00 PM - 3:00 PM
• Today, 4:30 PM - 5:00 PM
• Tomorrow, 9:00 AM - 10:00 AM
```

### Event Confirmation
```
✓ Event Created: Team Standup
  📅 Tomorrow at 9:00 AM (30 min)
  👥 5 attendees
  🔔 Reminder set for 15 min before
```

### Time Analysis
```
Time Usage This Week:
━━━━━━━━━━━━━━━━━━━━
Meetings:      12h 30m (52%)
Focus Time:     8h 00m (33%)
Free:           3h 30m (15%)
━━━━━━━━━━━━━━━━━━━━
Busiest Day: Wednesday (4h 15m)
```

## Error Handling

When errors occur:

1. **Authentication errors**: Guide user to run `npm run auth`
2. **Calendar not found**: Ask user to verify calendar ID
3. **Event not found**: Provide suggestions based on search
4. **API rate limits**: Wait and retry with backoff

## Important Notes

- Always confirm destructive actions (delete, cancel) before proceeding
- Use 12-hour format with AM/PM in responses (convert from 24-hour internally)
- Include timezone information in all time-related responses
- For recurring events, confirm the recurrence pattern
- When adding attendees, verify email format

## Supporting Files

- [Reference Documentation](reference.md) - Detailed API information
- [Usage Examples](examples.md) - More command examples
- [Troubleshooting](troubleshooting.md) - Common issues and solutions
