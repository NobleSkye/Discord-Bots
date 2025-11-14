const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Nodeactyl = require('nodeactyl');

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
            const client = new Nodeactyl.NodeactylClient(panelUrl, apiKey);
            
            // Try to fetch account details to verify credentials
            await client.getAccountDetails();

            // Save credentials to database
            interaction.client.db.saveUser(userId, apiKey, panelUrl);

            const embed = new EmbedBuilder()
                .setTitle('✅ API Credentials Saved')
                .setDescription('Your Pterodactyl API credentials have been saved successfully!')
                .addFields(
                    { name: 'Panel URL', value: panelUrl, inline: false },
                    { name: 'API Key', value: `${apiKey.substring(0, 8)}...`, inline: false }
                )
                .setColor('#00ff00')
                .setTimestamp()
                .setFooter({ text: 'Your credentials are stored securely and only visible to you.' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[ERROR] Failed to verify API credentials:', error);

            let errorMessage = '❌ Failed to verify your API credentials.';
            
            if (error.response) {
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
