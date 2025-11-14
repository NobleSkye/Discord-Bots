# PyroBot Command Structure

```
PyroBot Discord Commands
│
├─── /pyrobot
│    └─── Configure API credentials
│         ├─── api_key: Your Pterodactyl API key
│         └─── panel_url: Your panel URL
│
├─── /server (Basic Server Control)
│    ├─── list
│    │    └─── List all your servers
│    │
│    ├─── start
│    │    └─── server_id: Server identifier
│    │
│    ├─── stop
│    │    └─── server_id: Server identifier
│    │
│    ├─── restart
│    │    └─── server_id: Server identifier
│    │
│    ├─── kill
│    │    └─── server_id: Server identifier
│    │
│    └─── status
│         └─── server_id: Server identifier
│
└─── /pterodactyl (Advanced API Commands)
     │
     ├─── server
     │    ├─── list
     │    │    └─── List all servers with details
     │    │
     │    ├─── details
     │    │    └─── server_id: Server identifier
     │    │         └─── Shows: UUID, Node, SFTP, Limits
     │    │
     │    ├─── resources
     │    │    └─── server_id: Server identifier
     │    │         └─── Shows: CPU, RAM, Disk, Network
     │    │
     │    └─── command
     │         ├─── server_id: Server identifier
     │         └─── command: Console command to send
     │
     ├─── account
     │    ├─── info
     │    │    └─── Show account details
     │    │
     │    └─── api-key
     │         ├─── action: list/create/delete
     │         ├─── description: (optional) For create
     │         └─── key_id: (optional) For delete
     │
     ├─── file
     │    └─── list
     │         ├─── server_id: Server identifier
     │         └─── path: (optional) Directory path
     │
     └─── database
          └─── list
               └─── server_id: Server identifier
```

## Command Flow

### First Time Setup
```
1. User joins Discord server with PyroBot
2. User runs: /pyrobot api_key:<key> panel_url:<url>
3. Bot validates credentials with Pterodactyl API
4. Bot saves credentials to database
5. User can now use all other commands
```

### Typical Usage Flow
```
1. /server list
   └─→ See all available servers

2. /server status server_id:<id>
   └─→ Check if server is online/offline

3. /server start server_id:<id>
   └─→ Start the server

4. /pterodactyl server resources server_id:<id>
   └─→ Monitor resource usage

5. /pterodactyl server command server_id:<id> command:<cmd>
   └─→ Send console commands
```

### Advanced Usage Flow
```
1. /pterodactyl account info
   └─→ View account details

2. /pterodactyl server details server_id:<id>
   └─→ Get full server information

3. /pterodactyl file list server_id:<id> path:/config
   └─→ Browse server files

4. /pterodactyl database list server_id:<id>
   └─→ View database connections
```

## Data Flow Architecture

```
Discord User
    ↓
    ├─→ Sends /command
    ↓
Discord Bot (PyroBot)
    ↓
    ├─→ Validates user has API credentials
    ├─→ Retrieves credentials from SQLite DB
    ↓
Nodeactyl Library
    ↓
    ├─→ Makes HTTP request to Pterodactyl API
    ↓
Pterodactyl Panel
    ↓
    ├─→ Processes request
    ├─→ Returns JSON response
    ↓
Nodeactyl Library
    ↓
    ├─→ Parses response
    ↓
Discord Bot
    ↓
    ├─→ Formats data into Discord Embed
    ├─→ Sends ephemeral reply
    ↓
Discord User
    └─→ Sees response (only visible to them)
```

## Response Types

### Success Responses (Green Embeds)
- ✅ Server started
- ✅ API credentials saved
- ✅ API key created
- ✅ Command sent

### Info Responses (Blue Embeds)
- 📋 Server list
- 📊 Server status
- 👤 Account info
- 🖥️ Server details

### Warning Responses (Orange Embeds)
- 🛑 Server stopping
- ⚠️ Server killed

### Error Responses (Red/Text)
- ❌ Authentication failed
- ❌ Server not found
- ❌ Invalid input
- ❌ API error

## Security Layers

```
Layer 1: Discord Permissions
    └─→ Bot only responds to authorized users

Layer 2: Per-User Credentials
    └─→ Each user must configure their own API key

Layer 3: Ephemeral Responses
    └─→ All responses only visible to command sender

Layer 4: API Key Validation
    └─→ Credentials tested before storage

Layer 5: Database Isolation
    └─→ User credentials isolated in SQLite
```

## Error Handling Chain

```
User Input
    ↓
    ├─→ Discord.js validates command structure
    ↓
PyroBot
    ├─→ Checks if user has credentials
    ├─→ Validates server_id format
    ↓
Nodeactyl
    ├─→ Makes API request
    ↓
Pterodactyl API
    ├─→ 200 OK → Success
    ├─→ 401/403 → Authentication Error
    ├─→ 404 → Not Found
    ├─→ 500 → Server Error
    ↓
PyroBot Error Handler
    ├─→ Translates error to user-friendly message
    ├─→ Sends error embed/message
    ↓
User sees: "❌ Clear error message"
```
