const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const db = require('../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('Manage and trigger webhooks')
        .addSubcommand(subcommand =>
            subcommand
                .setName('trigger')
                .setDescription('Send a GET request to the configured webhook'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-hostname')
                .setDescription('Set the webhook hostname')
                .addStringOption(option =>
                    option.setName('hostname')
                        .setDescription('The hostname (e.g., example.com or api.example.com)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-path')
                .setDescription('Set the webhook path')
                .addStringOption(option =>
                    option.setName('path')
                        .setDescription('The path (e.g., /webhook or /api/v1/hook)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Show the current webhook configuration')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const config = db.getConfig();

        if (subcommand === 'trigger') {
            await interaction.deferReply();

            try {
                const url = `https://${config.hostname}${config.path}`;
                const response = await axios.get(url, {
                    timeout: 5000
                });

                await interaction.editReply({
                    content: `✅ Webhook triggered successfully!\n\`\`\`URL: ${url}\nStatus: ${response.status}\nStatus Text: ${response.statusText}\`\`\``
                });

            } catch (error) {
                console.error('Webhook error:', error.message);
                await interaction.editReply({
                    content: `❌ Failed to trigger webhook: ${error.message}\nURL: https://${config.hostname}${config.path}`
                });
            }

        } else if (subcommand === 'set-hostname') {
            const hostname = interaction.options.getString('hostname');
            // Remove https:// or http:// if user included it
            const cleanHostname = hostname.replace(/^https?:\/\//, '');
            
            db.setHostname(cleanHostname);
            const newConfig = db.getConfig();
            
            await interaction.reply({
                content: `✅ Hostname set to: \`${cleanHostname}\`\nFull URL: \`https://${cleanHostname}${newConfig.path}\``,
                ephemeral: true
            });

        } else if (subcommand === 'set-path') {
            const webhookPath = interaction.options.getString('path');
            // Ensure path starts with /
            const cleanPath = webhookPath.startsWith('/') ? webhookPath : `/${webhookPath}`;
            
            db.setPath(cleanPath);
            const newConfig = db.getConfig();
            
            await interaction.reply({
                content: `✅ Path set to: \`${cleanPath}\`\nFull URL: \`https://${newConfig.hostname}${cleanPath}\``,
                ephemeral: true
            });

        } else if (subcommand === 'show') {
            await interaction.reply({
                content: `📋 Current webhook configuration:\n\`\`\`Hostname: ${config.hostname}\nPath: ${config.path}\nFull URL: https://${config.hostname}${config.path}\`\`\``,
                ephemeral: true
            });
        }
    },
};
