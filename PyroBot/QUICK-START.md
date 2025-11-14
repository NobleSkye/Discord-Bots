# 🚀 PyroBot Quick Start Guide

## 1. Installation (5 minutes)

```bash
cd PyroBot
npm install
cp .env.example .env
nano .env  # Add your Discord bot token and client ID
```

## 2. Deploy Commands (1 minute)

```bash
npm run deploy
```

You should see:
```
[SUCCESS] Successfully reloaded 3 application (/) commands.
```

## 3. Start the Bot (1 minute)

```bash
npm start
```

Or with Docker:
```bash
docker-compose up -d
```

## 4. Configure Your Pterodactyl Access (2 minutes)

In Discord, run:
```
/pyrobot api_key:ptlc_your_key_here panel_url:https://panel.example.com
```

**Where to get your API key:**
1. Log into your Pterodactyl panel
2. Click your username → Account Settings
3. Go to "API Credentials" tab
4. Click "Create" button
5. Copy the key immediately!

## 5. Test It Out!

Try these commands:

```
/server list
```
See all your servers

```
/server status server_id:abc123
```
Check a server's status

```
/server start server_id:abc123
```
Start a server

## 🎉 You're Done!

### Common Commands

**Quick Actions:**
- `/server list` - See all servers
- `/server start server_id:<id>` - Start server
- `/server stop server_id:<id>` - Stop server
- `/server status server_id:<id>` - Check status

**Advanced Features:**
- `/pterodactyl server details server_id:<id>` - Full server info
- `/pterodactyl server command server_id:<id> command:<cmd>` - Send console command
- `/pterodactyl file list server_id:<id>` - Browse files
- `/pterodactyl account info` - View your account

### Need Help?

📖 **Full Documentation:**
- `README-COMMANDS.md` - Complete command reference
- `QUICK-REFERENCE.md` - Command quick lookup
- `COMMAND-STRUCTURE.md` - Visual command tree

### Troubleshooting

**Problem:** "You need to set up your API key first!"
**Solution:** Run `/pyrobot` with your credentials

**Problem:** "Authentication failed"
**Solution:** Check your API key is correct (Client API key, starts with `ptlc_`)

**Problem:** "Server not found"
**Solution:** Use `/server list` to get the correct server ID

### Security Tips

✅ **DO:**
- Use Client API keys (ptlc_)
- Keep your API key private
- Use different API keys for different bots

❌ **DON'T:**
- Share your API key
- Use Application API keys
- Post screenshots with visible API keys

---

## Architecture Overview

```
Discord → PyroBot → Pterodactyl Panel
   ↓         ↓            ↓
 User → Bot Checks → Manages
        Database    Servers
```

**Technologies:**
- Discord.js v14
- Nodeactyl v3.3.0
- SQLite Database
- Node.js v16+

---

## What Can You Do?

### Server Management
✅ Start, stop, restart, kill servers
✅ View real-time status and resources
✅ Send console commands
✅ List all your servers

### Advanced Features
✅ Monitor CPU, RAM, disk, network usage
✅ Browse server files
✅ View databases
✅ Manage API keys
✅ View account info

### Coming Soon (Optional)
- Scheduled server tasks
- Backup management
- Resource alerts
- Auto-restart on crash

---

**Enjoy using PyroBot! 🎮🤖**

For issues: Check the documentation or review error messages
For features: Explore `/pterodactyl` command group
For updates: Pull latest changes and run `npm run deploy`
