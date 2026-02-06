# Usage Guide

## Command Reference

### Availability Commands

Find open time slots on your calendar:

```bash
npm run gcalendar -- availability "tomorrow"
npm run gcalendar -- availability "next week"
npm run gcalendar -- availability "Friday afternoon"
npm run gcalendar -- availability "between 2pm and 5pm"
npm run gcalendar -- availability "for 30 minutes"
npm run gcalendar -- availability "when are john@example.com and i free"
```

### Event Commands

Create, list, and manage events:

```bash
# Create events
npm run gcalendar -- create "meeting with john@example.com tomorrow at 3pm"
npm run gcalendar -- create "team standup every Monday at 9am"
npm run gcalendar -- create "1-hour call"

# List events
npm run gcalendar -- list
npm run gcalendar -- list "today"
npm run gcalendar -- list --days 14

# Get event details
npm run gcalendar -- get "standup"
npm run gcalendar -- get "meeting with john"

# Update events
npm run gcalendar -- update "standup" "move to 4pm"
npm run gcalendar -- update "meeting" "change to 1 hour"

# Delete events
npm run gcalendar -- delete "standup"
npm run gcalendar -- delete "3pm meeting"
```

### Time Blocking Commands

Block time for focus or unavailability:

```bash
npm run gcalendar -- block "2 hours for deep work"
npm run gcalendar -- block "this afternoon"
npm run gcalendar -- block "9am-11am daily"
npm run gcalendar -- block "out of office next friday"
```

### Analytics Commands

Analyze your time usage:

```bash
npm run gcalendar -- analyze
npm run gcalendar -- analyze "this week"
npm run gcalendar -- analyze --days 30
npm run gcalendar -- analyze "how many meetings"
```

## Natural Language Patterns

### Date Expressions

| Expression | Meaning |
|------------|---------|
| `today` | Current day |
| `tomorrow` | Next day |
| `next friday` | Upcoming Friday |
| `monday` | Next Monday |
| `January 15` | January 15th |
| `1/15/2024` | January 15, 2024 |

### Time Expressions

| Expression | Meaning |
|------------|---------|
| `3pm` | 3:00 PM |
| `3:30pm` | 3:30 PM |
| `15:00` | 3:00 PM (24h) |
| `morning` | 9 AM - 12 PM |
| `afternoon` | 12 PM - 5 PM |
| `evening` | 5 PM - 9 PM |

### Duration Expressions

| Expression | Meaning |
|------------|---------|
| `30 minutes` | 30 min |
| `1 hour` | 60 min |
| `1.5 hours` | 90 min |
| `2 hours 30 minutes` | 150 min |

## Integration with Claude Code

Once installed in your skills directory, use natural language with Claude:

```
/gcalendar Find open slots tomorrow
/gcalendar Schedule a meeting with the team
/gcalendar What's on my calendar today?
/gcalendar Block 2 hours for focus time
/gcalendar How much time did I spend in meetings this week?
```

## CLI Options

```
npm run gcalendar -- <command> [options]

Commands:
  availability  Find available time slots
  create        Create a new event
  list          List events
  get           Get event details
  update        Update an event
  delete        Delete an event
  block         Block time on calendar
  analyze       Analyze time usage
  auth          Authenticate with Google

Options:
  --help     Show help
  --query    Natural language query (required for most commands)
  --days     Number of days to look ahead (default: 7)
  --setup    Run setup wizard
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | - |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI | `http://localhost:3000/callback` |
| `GCALENDAR_DEFAULT_CALENDAR` | Default calendar ID | `primary` |

### Output Formats

The CLI supports different output formats via the `--format` flag:

```bash
npm run gcalendar -- list --format text   # Default text format
npm run gcalendar -- list --format json   # JSON output
```
