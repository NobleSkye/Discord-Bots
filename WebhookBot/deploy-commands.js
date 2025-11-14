require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [];
const webhookCommand = require('./commands/webhook');
const pingCommand = require('./commands/ping');

commands.push(webhookCommand.data.toJSON());
commands.push(pingCommand.data.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands globally.`);

        // Register commands globally (available in all servers)
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands globally.`);
        console.log('⏰ Note: Global commands may take up to 1 hour to appear in all servers.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();
