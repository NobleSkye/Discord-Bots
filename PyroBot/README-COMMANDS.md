# PyroBot - Pterodactyl Discord Bot

A powerful Discord bot for managing Pterodactyl game servers directly from Discord. Control your servers, manage files, monitor resources, and more!

## Features

### 🔐 Secure API Management
- Per-user API key storage in SQLite database
- Encrypted credentials stored locally
- Easy setup with slash commands

### 🎮 Server Management
- Start, stop, restart, and kill servers
- View real-time server status and resource usage
- List all your servers
- Send console commands to servers

### 📊 Advanced Features
- View account information
- Manage API keys
- List server files and directories
- View server databases
- Monitor CPU, memory, disk, and network usage

## Setup

### Prerequisites
- Node.js v16.9.0 or higher
- A Discord Bot Token
- A Pterodactyl Panel with API access

### Installation

1. Clone the repository or navigate to the PyroBot directory:
```bash
cd PyroBot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Discord credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
```

5. Deploy the slash commands:
```bash
npm run deploy
```

6. Start the bot:
```bash
npm start
```

### Docker Deployment

Build and run with Docker:
```bash
docker-compose up -d
```

## Commands

### `/pyrobot`
Configure your Pterodactyl API credentials (required first step).

**Usage:**
```
/pyrobot api_key:<your-api-key> panel_url:<https://panel.example.com>
```

**Example:**
```
/pyrobot api_key:ptlc_abc123xyz panel_url:https://panel.example.com
```

---

### `/server` - Basic Server Control

#### `/server list`
List all your servers.

#### `/server start`
Start a server.
- `server_id` - The server identifier

#### `/server stop`
Stop a server gracefully.
- `server_id` - The server identifier

#### `/server restart`
Restart a server.
- `server_id` - The server identifier

#### `/server kill`
Force kill a server (use when stop doesn't work).
- `server_id` - The server identifier

#### `/server status`
Get detailed status and resource usage for a server.
- `server_id` - The server identifier

---

### `/pterodactyl` - Advanced API Commands

#### Server Commands

##### `/pterodactyl server list`
List all your servers with identifiers.

##### `/pterodactyl server details`
Get comprehensive server information including limits and SFTP details.
- `server_id` - The server identifier

##### `/pterodactyl server resources`
View real-time resource usage (CPU, RAM, Disk, Network).
- `server_id` - The server identifier

##### `/pterodactyl server command`
Send a console command to your server.
- `server_id` - The server identifier
- `command` - The command to execute

**Example:**
```
/pterodactyl server command server_id:abc123 command:say Hello World
```

#### Account Commands

##### `/pterodactyl account info`
View your Pterodactyl account information.

##### `/pterodactyl account api-key`
Manage your API keys.
- `action` - Choose: List Keys, Create Key, or Delete Key
- `description` - (Optional) Description for new key
- `key_id` - (Optional) Key identifier to delete

**Examples:**
```
/pterodactyl account api-key action:list
/pterodactyl account api-key action:create description:My New Key
/pterodactyl account api-key action:delete key_id:key123
```

#### File Commands

##### `/pterodactyl file list`
List files and directories on your server.
- `server_id` - The server identifier
- `path` - (Optional) Directory path (default: /)

**Example:**
```
/pterodactyl file list server_id:abc123 path:/config
```

#### Database Commands

##### `/pterodactyl database list`
List all databases for a server.
- `server_id` - The server identifier

---

## Security Notes

⚠️ **Important Security Information:**

1. **API Keys are stored securely** - Each user's API key is stored in a local SQLite database and only accessible to that user
2. **Use Client API Keys** - Always use Pterodactyl Client API keys (starting with `ptlc_`), never Application API keys
3. **Ephemeral Responses** - All command responses are ephemeral (only visible to you) to prevent credential leakage
4. **Never share your API key** - Keep your API key private and never share it with others

## Troubleshooting

### "You need to set up your API key first!"
Run `/pyrobot` with your API credentials before using other commands.

### "Authentication failed"
Your API key may be invalid or expired. Run `/pyrobot` again with valid credentials.

### "Server not found"
Double-check the server identifier. Use `/server list` to see all your servers.

### "Could not connect to the panel"
Verify your panel URL is correct and accessible. Make sure to include `https://` in the URL.

## Getting Your API Key

1. Log into your Pterodactyl panel
2. Go to Account Settings → API Credentials
3. Create a new API key (Client API Key)
4. Copy the key immediately (you won't see it again!)
5. Use it in the `/pyrobot` command

## Support

For issues or questions:
- Check the Pterodactyl documentation: https://pterodactyl.io
- Review the Nodeactyl library: https://github.com/Burchard36/Nodeactyl

## License

ISC

## Dependencies

- **discord.js** - Discord API wrapper
- **nodeactyl** - Pterodactyl API wrapper
- **better-sqlite3** - SQLite database for credential storage
- **dotenv** - Environment variable management
