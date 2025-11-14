require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
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
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`[INFO] Loaded command: ${command.data.name}`);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Event: Bot is ready
client.once('ready', () => {
    console.log(`[INFO] Logged in as ${client.user.tag}`);
    console.log(`[INFO] Bot is ready and serving ${client.guilds.cache.size} guilds`);
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
        
        const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
        
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
