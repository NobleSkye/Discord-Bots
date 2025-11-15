const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Nodeactyl = require('nodeactyl');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pyrobot')
        .setDescription('Configure your Pterodactyl API credentials')
        .addStringOption(option =>
            option
                .setName('api_key')
                .setDescription('Your Pterodactyl API key')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('panel_url')
                .setDescription('Your Pterodactyl panel URL (e.g., https://panel.example.com)')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userId = interaction.user.id;
        const apiKey = interaction.options.getString('api_key');
        const panelUrl = interaction.options.getString('panel_url').replace(/\/$/, ''); // Remove trailing slash

        // Validate URL format
        try {
            new URL(panelUrl);
        } catch (error) {
            return interaction.editReply({
                content: '❌ Invalid panel URL. Please provide a valid URL (e.g., https://panel.example.com)',
                flags: MessageFlags.Ephemeral
            });
        }

        // Test the API credentials before saving
        try {
            console.log(`[DEBUG] Testing API connection to: ${panelUrl}/api/client/account`);
            console.log(`[DEBUG] Using API key: ${apiKey.substring(0, 15)}...`);
            
            // Try direct API call first (more reliable for custom panels)
            const response = await axios.get(`${panelUrl}/api/client/account`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'application/json'
                },
                timeout: 10000,
                validateStatus: function (status) {
                    return status < 500; // Don't throw on 4xx errors
                }
            });

            console.log(`[DEBUG] API Response Status: ${response.status}`);
            console.log(`[DEBUG] API Response Data:`, response.data ? 'Data received' : 'No data');

            // Check if authentication failed
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Authentication failed (${response.status}). Please verify your API key is correct and has client API permissions.`);
            }

            if (!response.data || !response.data.attributes) {
                throw new Error('Invalid API response from panel');
            }

            // Save credentials to database
            console.log(`[DEBUG] API validation successful! Saving to database...`);
            interaction.client.db.saveUser(userId, apiKey, panelUrl);
            console.log(`[SUCCESS] Credentials saved to database for user ${userId}`);

            const embed = new EmbedBuilder()
                .setTitle('✅ API Credentials Saved')
                .setDescription('Your Pterodactyl API credentials have been saved successfully!')
                .addFields(
                    { name: 'Panel URL', value: panelUrl, inline: false },
                    { name: 'API Key', value: `${apiKey.substring(0, 12)}...`, inline: false },
                    { name: 'Account', value: response.data.attributes.email || 'N/A', inline: false }
                )
                .setColor('#00ff00')
                .setTimestamp()
                .setFooter({ text: 'Your credentials are stored securely and only visible to you.' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[ERROR] Failed to verify API credentials:', error);
            console.error('[ERROR] Error details:', {
                message: error.message,
                code: error.code,
                response: error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                } : 'No response'
            });

            let errorMessage = '❌ Failed to verify your API credentials.';
            
            if (error.message && error.message.includes('Unknown Integration')) {
                errorMessage = '❌ Your Pterodactyl panel version is not supported by the Nodeactyl library. Please ensure you\'re using a standard Pterodactyl panel (not a custom fork).';
            } else if (error.response) {
                const status = error.response.status;
                if (status === 401 || status === 403) {
                    errorMessage = '❌ Invalid API key. Please check your credentials and try again.';
                } else if (status === 404) {
                    errorMessage = '❌ Invalid panel URL. Please verify the URL is correct.';
                } else {
                    errorMessage = `❌ API Error (${status}): ${error.response.statusText || 'Unknown error'}`;
                }
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errorMessage = '❌ Could not connect to the panel. Please verify the URL is correct and accessible.';
            } else if (error.message) {
                errorMessage = `❌ Error: ${error.message}`;
            }

            await interaction.editReply({
                content: errorMessage,
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
