require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load all command data
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`[INFO] Loaded command: ${command.data.name}`);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`[INFO] Started refreshing ${commands.length} application (/) commands.`);

        // Clear all existing global commands first
        console.log('[INFO] Clearing old global commands...');
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: [] },
        );
        console.log('[SUCCESS] Cleared all old global commands.');

        // For user apps, we need to deploy globally
        console.log('[INFO] Deploying commands globally (for user-installed app)...');
        console.log('[INFO] Note: Global commands may take up to 1 hour to update.');
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands },
        );
        
        console.log(`[SUCCESS] ✅ Successfully deployed ${data.length} global commands!`);
        console.log('[INFO] ⏰ Commands may take up to 1 hour to fully update in Discord.');
        console.log('[INFO] You can also try restarting Discord client to see changes faster.');
        
    } catch (error) {
        console.error('[ERROR] Failed to deploy commands:', error);
    }
})();
