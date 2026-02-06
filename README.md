# Google Calendar Skill for Claude Code

*A beginner-friendly guide to managing your Google Calendar through natural conversation with Claude Code*

---

## Table of Contents

1. [What is this?](#what-is-this)
2. [Where should you install it?](#where-should-you-install-it)
3. [Installation Guide](#installation-guide)
4. [First-Time Setup](#first-time-setup)
5. [How to Use](#how-to-use)
6. [Example Commands](#example-commands)
7. [Troubleshooting](#troubleshooting)
8. [Uninstalling](#uninstalling)

---

## What is this?

This is a **Claude Code Skill** that lets you manage your Google Calendar using natural language. Instead of clicking through the Google Calendar interface, you can simply chat with Claude:

**You say:**
> "Find open slots tomorrow between 2pm and 5pm"

**Claude does:**
> Shows you available time slots

**You say:**
> "Schedule a 30-minute meeting with john@example.com on Friday at 3pm"

**Claude does:**
> Creates the event on your calendar

This skill understands phrases like "tomorrow", "next Friday", "3pm", "1 hour", and more - just like you would talk to a human assistant.

---

## Where should you install it?

Claude Code skills can be installed in different locations. Choose based on your needs:

### Option 1: Personal Skills (Recommended for Most Users)

**Location:** `~/.claude/skills/gcalendar/`

**Why choose this:**
- Available in ALL your projects
- One-time installation
- Use the skill anywhere

**Installation:**
```bash
# Navigate to your skills directory
cd ~/.claude/skills/

# Clone the skill
git clone https://github.com/yourusername/claude-code-gcalendar-skill.git gcalendar

# Enter the skill directory
cd gcalendar
```

### Option 2: Project-Level Skills

**Location:** `your-project/.claude/skills/gcalendar/`

**Why choose this:**
- Team-specific settings
- Project-specific calendar (e.g., a team calendar)
- Different versions per project

**Installation:**
```bash
# Navigate to your project
cd /path/to/your/project

# Create the skills directory
mkdir -p .claude/skills

# Clone the skill
git clone https://github.com/yourusername/claude-code-gcalendar-skill.git .claude/skills/gcalendar
```

### Comparison Table

| Aspect | Personal (~/.claude/) | Project (.claude/) |
|--------|----------------------|-------------------|
| **Availability** | All projects | This project only |
| **Sharing** | Not shared | Easy to share with team |
| **Version Control** | Your choice | Commit to repo |
| **Updates** | Manual | Per project |
| **Backup** | Home directory | Git repository |

### Recommendation for Beginners

**Start with Option 1 (Personal Skills)**:
- Easier to set up
- Works everywhere
- Less to manage

Switch to **Option 2 (Project Skills)** only when:
- Your team needs shared calendar settings
- You want project-specific configurations
- You're working on multiple projects with different teams

---

## Installation Guide

### Step 1: Check Prerequisites

Before you begin, make sure you have:

1. **Node.js version 18 or higher**
   ```bash
   node --version
   ```
   If you see an error or an older version, download from [nodejs.org](https://nodejs.org/)

2. **Git installed**
   ```bash
   git --version
   ```
   If not installed, download from [git-scm.com](https://git-scm.com/)

3. **A Google Account** with Google Calendar enabled

### Step 2: Install the Skill

#### For Personal Installation (Recommended)

Open your terminal and run:

```bash
# 1. Go to your Claude skills directory
cd ~/.claude/skills/

# 2. Clone this repository
git clone https://github.com/yourusername/claude-code-gcalendar-skill.git gcalendar

# 3. Go into the skill directory
cd gcalendar

# 4. Install required packages
npm install

# 5. Build the project
npm run build

# 6. Verify installation
npm test
```

#### For Project-Level Installation

```bash
# 1. Go to your project directory
cd /path/to/your/project

# 2. Create the skills directory
mkdir -p .claude/skills

# 3. Clone into the project
git clone https://github.com/yourusername/claude-code-gcalendar-skill.git .claude/skills/gcalendar

# 4. Install packages
cd .claude/skills/gcalendar
npm install
npm run build
```

### Step 3: Verify Your Installation

Run this command to verify everything is working:

```bash
npm run build
```

If you see no errors, congratulations! The skill is installed.

---

## First-Time Setup

Before using the skill, you need to connect it to your Google Calendar.

### Step 1: Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** at the top, then **"New Project"**
3. Name it something like "Calendar Skill" and click **Create**
4. In the left menu, click **"APIs & Services"** > **"Library"**
5. Search for **"Google Calendar API"** and click **Enable**
6. Click **"OAuth consent screen"** in the left menu
7. Select **"External"** and click **Create**
8. Fill in the required fields:
   - **App name:** "Google Calendar Skill"
   - **User support email:** Your email
   - **Developer contact email:** Your email
9. Click **Save and Continue** (you can skip scopes for now)
10. Click **"Credentials"** in the left menu
11. Click **"Create Credentials"** > **"OAuth client ID"**
12. Select **"Web application"**
13. Name it "Calendar Skill Web Client"
14. Under **"Authorized redirect URIs"**, add:
    ```
    http://localhost:3000/callback
    ```
15. Click **Create**
16. Copy your **Client ID** and **Client Secret**

### Step 2: Configure the Skill

You have two options:

#### Option A: Environment Variables (Recommended)

Add these to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export GOOGLE_CLIENT_ID="your-client-id-here"
export GOOGLE_CLIENT_SECRET="your-client-secret-here"
export GOOGLE_REDIRECT_URI="http://localhost:3000/callback"
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

#### Option B: Configuration File

Create a `credentials.json` file in the **project root directory**:

```bash
# Navigate to your project/skill directory
cd ~/.claude/skills/gcalendar  # or your project directory

# Create the credentials file
touch credentials.json

# Edit with your details
nano credentials.json
```

Paste this template (from your Google Cloud Console):

```json
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uris": ["http://localhost:3000/callback"]
}
```

**Where to put the file:**

| Installation Type | File Location |
|------------------|---------------|
| Personal skill | `~/.claude/skills/gcalendar/credentials.json` |
| Project skill | `your-project/.claude/skills/gcalendar/credentials.json` |

### Step 3: Authenticate

Run the authentication command:

```bash
npm run auth
```

This will:
1. Open your web browser
2. Ask you to sign in to Google
3. Ask permission to access your calendar
4. Generate an authorization code
5. Save your credentials securely

Follow the prompts on screen.

---

## How to Use

### Using with Claude Code

Once installed, just talk to Claude naturally:

```
/gcalendar Find open slots tomorrow
/gcalendar Schedule a meeting with john@example.com
/gcalendar What's on my calendar today?
/gcalendar Block 2 hours for deep work
/gcalendar How many meetings this week?
```

### Using from Command Line

You can also use the CLI directly:

```bash
# Find available time
npm run gcalendar -- availability "tomorrow between 2pm and 5pm"

# Create an event
npm run gcalendar -- create "meeting with team@example.com tomorrow at 3pm"

# List events
npm run gcalendar -- list

# Analyze time usage
npm run gcalendar -- analyze "this week"
```

---

## Example Commands

### Finding Available Time

| What you type | What happens |
|--------------|--------------|
| `Find open slots tomorrow` | Shows free time for tomorrow |
| `When am I free next week?` | Lists available slots for the week |
| `Find 1-hour slots on Friday` | Finds hour-long openings on Friday |
| `What's open between 2pm and 4pm?` | Checks that specific window |

### Scheduling Meetings

| What you type | What happens |
|--------------|--------------|
| `Schedule meeting with john@example.com tomorrow at 3pm` | Creates the event |
| `Book a 30-minute call` | Creates a 30-min event |
| `Create daily standup at 9am` | Creates recurring daily event |
| `Add lunch with mom Friday at noon` | Creates event with details |

### Managing Events

| What you type | What happens |
|--------------|--------------|
| `What's on my calendar today?` | Lists today's events |
| `Cancel the 3pm standup` | Deletes the event |
| `Move my meeting to 4pm` | Updates the time |
| `Find my call with John` | Searches and shows the event |

### Blocking Time

| What you type | What happens |
|--------------|--------------|
| `Block 2 hours for deep work` | Marks time as busy |
| `Mark me out of office next Friday` | Creates OOO block |
| `Focus block 9-11am daily` | Creates recurring block |

### Analyzing Time

| What you type | What happens |
|--------------|--------------|
| `How much time in meetings this week?` | Shows meeting hours |
| `Show my time distribution` | Breaks down by category |
| `What's my busiest day?` | Identifies most loaded day |

---

## Troubleshooting

### "Command not found" or "npm: command not found"

**Problem:** Node.js is not installed.

**Solution:**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the "LTS" version
3. Run the installer
4. Restart your terminal

### "Permission denied" when running commands

**Problem:** You don't have execute permissions.

**Solution:**
```bash
chmod +x /path/to/script
```

Or run with sudo (not recommended):
```bash
sudo npm run gcalendar -- availability "tomorrow"
```

### "Authentication failed" or "Invalid credentials"

**Problem:** Your Google credentials are wrong or expired.

**Solution:**
1. Delete the token file: `rm ~/.config/gcalendar/token.json`
2. Run `npm run auth` again
3. Complete the OAuth flow

### "No available slots found" when slots exist

**Problem:** The skill can't see your calendar events.

**Solution:**
1. Check that Google Calendar API is enabled in Google Cloud Console
2. Verify credentials are correct
3. Try re-authenticating: `npm run auth`

### "Error: ENOENT: no such file or directory"

**Problem:** The skill directory doesn't exist or was moved.

**Solution:**
1. Check your current directory: `pwd`
2. Navigate to the correct location: `cd ~/.claude/skills/gcalendar`
3. If missing, re-clone the repository

### Browser doesn't open during authentication

**Solution:**
1. The URL is printed to the console
2. Copy and paste it into your browser manually
3. Complete the OAuth flow
4. Copy the authorization code
5. Paste it into the terminal

### "Port 3000 already in use"

**Problem:** Another process is using port 3000.

**Solution:**
1. Change the redirect URI in Google Cloud Console
2. Update your environment variable:
   ```bash
   export GOOGLE_REDIRECT_URI="http://localhost:3001/callback"
   ```

---

## Uninstalling

### Personal Installation

```bash
# Remove the skill directory
rm -rf ~/.claude/skills/gcalendar

# Remove credentials (optional)
rm -rf ~/.config/gcalendar/
```

### Project Installation

```bash
# Remove from your project
rm -rf .claude/skills/gcalendar

# Remove from git tracking (if committed)
git rm -rf .claude/skills/gcalendar
```

---

## Best Practices

### 1. Keep Credentials Secure

- Never commit `.env` files to version control
- Add `~/.config/gcalendar/` to your ignore files
- Use environment variables for sensitive data

### 2. Regular Updates

```bash
# Check for updates
cd ~/.claude/skills/gcalendar
git fetch origin
git pull
npm install
npm run build
```

### 3. Backup Your Token

Your authentication token is stored at:
```
~/.config/gcalendar/token.json
```

Back this up if you want to avoid re-authenticating.

### 4. Use Version Control

For project installations:
```bash
# Add to your .gitignore
.claude/skills/gcalendar/node_modules/
.claude/skills/gcalendar/dist/
```

### 5. Test Before Important Use

Before scheduling critical meetings:
1. Run a test command: `npm run gcalendar -- list`
2. Verify it shows your current events
3. Create a test event and delete it

---

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/yourusername/claude-code-gcalendar-skill/issues)
- **Documentation:** See the `docs/` directory
- **Claude Code Help:** `/help` in Claude Code

---

## About This Skill

This is a **Claude Code Skill**, not an MCP (Model Context Protocol) server:

- **Skills** provide instructions and tools Claude uses during conversation
- **MCP servers** are background services that run continuously
- Skills are simpler and work out of the box with Claude Code

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Happy scheduling!** 🎉

If you have any questions or run into issues, don't hesitate to open a GitHub issue or reach out for help.
