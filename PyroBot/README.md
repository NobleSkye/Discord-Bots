# PyroBot

A Discord bot for managing Pterodactyl servers using the Pyrodactyl API. Control your game servers directly from Discord with slash commands.

## Features

- 🎮 **Server Control**: Start, stop, and restart servers
- 📊 **Status Monitoring**: Check server status and resource usage
- 🔐 **Secure Storage**: API keys stored securely in SQLite database
- 🐳 **Docker Support**: Easy deployment with Docker and Docker Compose
- 👤 **Per-User Configuration**: Each user manages their own API credentials

## Commands

### `/pyrobot <api_key> <panel_url>`
Configure your Pterodactyl API credentials.

**Example:**
```
/pyrobot ptlc_your_api_key_here https://panel.example.com
```

### `/server start <server_id>`
Start a server.

### `/server stop <server_id>`
Stop a server.

### `/server restart <server_id>`
Restart a server.

### `/server status <server_id>`
Get detailed server status including resource usage.

## Setup

### Prerequisites

- Node.js 20 or higher
- Discord Bot Token
- Pterodactyl Panel with API access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd PyroBot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Discord credentials:
```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
```

4. **Deploy slash commands**
```bash
npm run deploy
```

5. **Start the bot**
```bash
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Create `.env` file**
```bash
cp .env.example .env
```

Edit `.env` with your Discord credentials.

2. **Build and start the container**
```bash
docker-compose up -d
```

3. **View logs**
```bash
docker-compose logs -f
```

4. **Stop the bot**
```bash
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t pyrobot .

# Run the container
docker run -d \
  --name pyrobot \
  -e DISCORD_TOKEN=your_token \
  -e DISCORD_CLIENT_ID=your_client_id \
  -v $(pwd)/data:/app/data \
  pyrobot
```

## Updating the Bot

To safely update PyroBot from GitHub while preserving your configuration:

### Linux/Mac
```bash
./update.sh
```

### Windows (PowerShell)
```powershell
.\update.ps1
```

The update script will:
- ✅ Backup your `.env` file and database
- ✅ Pull latest changes from GitHub
- ✅ Restore your `.env` file (won't be overwritten)
- ✅ Update `.env.example` with new variables
- ✅ Install/update dependencies
- ✅ Show you what changed
- ✅ Alert you if new environment variables were added

**After updating:**
1. Check for any new environment variables mentioned
2. Restart the bot if it's running

## Getting Your Pterodactyl API Key

1. Log into your Pterodactyl panel
2. Go to Account Settings → API Credentials
3. Create a new API key with appropriate permissions
4. Copy the key and use it with `/pyrobot` command

## Database

The bot uses SQLite to store user API credentials securely. The database file is stored in the `data/` directory and persists across restarts.

### Database Schema

**users table:**
- `user_id`: Discord user ID (primary key)
- `api_key`: Pterodactyl API key
- `panel_url`: Pterodactyl panel URL
- `created_at`: Timestamp
- `updated_at`: Timestamp

**servers table:**
- `id`: Auto-increment ID
- `user_id`: Discord user ID (foreign key)
- `server_id`: Pterodactyl server identifier
- `server_name`: Server name

## Security Notes

- API keys are stored per-user and only accessible to the user who configured them
- All command responses are ephemeral (only visible to the command user)
- Database file should be backed up regularly
- Never share your API keys or `.env` file

## Troubleshooting

### Bot doesn't respond to commands
- Ensure the bot is online
- Check that you've deployed commands with `npm run deploy`
- Verify the bot has proper permissions in your Discord server

### "You need to set up your API key first"
- Run `/pyrobot <api_key> <panel_url>` to configure your credentials

### "Authentication failed"
- Verify your API key is correct
- Ensure the API key has the necessary permissions
- Check that your panel URL is correct (include https://)

### "Server not found"
- Verify the server ID is correct
- Ensure your API key has access to that server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
