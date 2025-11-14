require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const DatabaseManager = require('./database');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ]
});

// Initialize database
client.db = new DatabaseManager();

// Load commands
client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`[INFO] Loaded command: ${command.data.name}`);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Event: Bot is ready
client.once('clientReady', async () => {
    console.log(`[INFO] Logged in as ${client.user.tag}`);
    console.log(`[INFO] Bot is ready and serving ${client.guilds.cache.size} guilds`);
    
    // Clear and re-register commands on startup (for user-installed apps)
    try {
        console.log('[INFO] Clearing old commands and registering new ones...');
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);
        
        // Clear and register global commands (for user apps)
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: [] },
        );
        console.log('[SUCCESS] Cleared all old global commands.');
        
        // Register new global commands
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );
        console.log(`[SUCCESS] ✅ Registered ${data.length} global commands.`);
        console.log('[INFO] ⏰ Global commands may take up to 1 hour to update everywhere.');
        
    } catch (error) {
        console.error('[ERROR] Failed to refresh commands:', error);
    }
});

// Event: Handle interactions (slash commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[ERROR] Error executing ${interaction.commandName}:`, error);
        
        const errorMessage = { content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('[INFO] Shutting down...');
    client.db.close();
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('[INFO] Shutting down...');
    client.db.close();
    client.destroy();
    process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
