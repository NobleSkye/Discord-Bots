# PyroBot - Quick Command Reference

## Setup Command

### `/pyrobot`
Configure your Pterodactyl credentials (required first step)
```
/pyrobot api_key:<key> panel_url:<url>
```

---

## Basic Server Control (`/server`)

| Command | Description | Parameters |
|---------|-------------|------------|
| `/server list` | List all your servers | None |
| `/server start` | Start a server | `server_id` |
| `/server stop` | Stop a server | `server_id` |
| `/server restart` | Restart a server | `server_id` |
| `/server kill` | Force kill a server | `server_id` |
| `/server status` | Get server status & resources | `server_id` |

---

## Advanced Commands (`/pterodactyl`)

### Server Management
| Command | Description | Parameters |
|---------|-------------|------------|
| `/pterodactyl server list` | List all servers | None |
| `/pterodactyl server details` | Get full server info | `server_id` |
| `/pterodactyl server resources` | View resource usage | `server_id` |
| `/pterodactyl server command` | Send console command | `server_id`, `command` |

### Account Management
| Command | Description | Parameters |
|---------|-------------|------------|
| `/pterodactyl account info` | View account details | None |
| `/pterodactyl account api-key` | Manage API keys | `action`, `description?`, `key_id?` |

**API Key Actions:**
- `list` - Show all your API keys
- `create` - Create a new API key
- `delete` - Delete an API key

### File Management
| Command | Description | Parameters |
|---------|-------------|------------|
| `/pterodactyl file list` | List server files | `server_id`, `path?` |

### Database Management
| Command | Description | Parameters |
|---------|-------------|------------|
| `/pterodactyl database list` | List server databases | `server_id` |

---

## Usage Examples

### Initial Setup
```
/pyrobot api_key:pyro_your_key_here panel_url:https://panel.example.com
```

### Starting a Server
```
/server start server_id:abc123def
```

### Sending a Console Command
```
/pterodactyl server command server_id:abc123def command:say Hello!
```

### Viewing Files
```
/pterodactyl file list server_id:abc123def path:/config
```

### Creating an API Key
```
/pterodactyl account api-key action:create description:My Discord Bot Key
```

---

## Tips

- ✅ All responses are **ephemeral** (only you can see them)
- 🔐 Use **Client API keys** (pyro_) not Application keys
- 📋 Use `/server list` to find your server identifiers
- ⚡ The `/server` commands are quick shortcuts for common tasks
- 🚀 The `/pterodactyl` commands offer advanced features

---

## Getting Help

1. All commands show help when you type them
2. Check README-COMMANDS.md for detailed documentation
3. Parameters marked with `?` are optional
