require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

client.commands = new Collection();

// Import commands
const webhookCommand = require('./commands/webhook');
const pingCommand = require('./commands/ping');

client.commands.set(webhookCommand.data.name, webhookCommand);
client.commands.set(pingCommand.data.name, pingCommand);

client.once('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📡 Bot is ready and listening for commands!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        const errorMessage = { 
            content: 'There was an error while executing this command!', 
            ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
