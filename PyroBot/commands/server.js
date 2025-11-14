const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Nodeactyl = require('nodeactyl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Manage your Pterodactyl server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start your server')
                .addStringOption(option =>
                    option
                        .setName('server_id')
                        .setDescription('The server identifier')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop your server')
                .addStringOption(option =>
                    option
                        .setName('server_id')
                        .setDescription('The server identifier')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('restart')
                .setDescription('Restart your server')
                .addStringOption(option =>
                    option
                        .setName('server_id')
                        .setDescription('The server identifier')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Get server status')
                .addStringOption(option =>
                    option
                        .setName('server_id')
                        .setDescription('The server identifier')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const subcommand = interaction.options.getSubcommand();
        const serverId = interaction.options.getString('server_id');

        // Get user's credentials from database
        const user = interaction.client.db.getUser(userId);

        if (!user) {
            return interaction.editReply({
                content: '❌ You need to set up your API key first! Use `/pyrobot <api_key> <panel_url>` to configure.',
                ephemeral: true
            });
        }

        try {
            // Initialize Pterodactyl client
            const client = new Nodeactyl.NodeactylClient(user.panel_url, user.api_key);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTimestamp();

            switch (subcommand) {
                case 'start':
                    await client.startServer(serverId);
                    embed.setTitle('✅ Server Starting')
                        .setDescription(`Server \`${serverId}\` is starting up...`)
                        .setColor('#00ff00');
                    break;

                case 'stop':
                    await client.stopServer(serverId);
                    embed.setTitle('🛑 Server Stopping')
                        .setDescription(`Server \`${serverId}\` is shutting down...`)
                        .setColor('#ff9900');
                    break;

                case 'restart':
                    await client.restartServer(serverId);
                    embed.setTitle('🔄 Server Restarting')
                        .setDescription(`Server \`${serverId}\` is restarting...`)
                        .setColor('#0099ff');
                    break;

                case 'status':
                    const serverDetails = await client.getServerDetails(serverId);
                    const serverUsage = await client.getServerUsages(serverId);
                    
                    const state = serverUsage.attributes?.current_state || 'unknown';
                    const stateEmoji = {
                        'running': '🟢',
                        'starting': '🟡',
                        'stopping': '🟠',
                        'offline': '🔴'
                    }[state] || '⚪';

                    embed.setTitle('📊 Server Status')
                        .setDescription(`Server: \`${serverId}\``)
                        .addFields(
                            { name: 'Status', value: `${stateEmoji} ${state.toUpperCase()}`, inline: true },
                            { name: 'Name', value: serverDetails.attributes?.name || 'N/A', inline: true },
                            { name: 'UUID', value: serverDetails.attributes?.uuid || 'N/A', inline: false }
                        )
                        .setColor(state === 'running' ? '#00ff00' : '#ff0000');

                    // Add resource usage if available
                    const resources = serverUsage.attributes?.resources;
                    if (resources) {
                        const memory = resources.memory_bytes 
                            ? `${(resources.memory_bytes / 1024 / 1024).toFixed(2)} MB` 
                            : 'N/A';
                        const cpu = resources.cpu_absolute 
                            ? `${resources.cpu_absolute.toFixed(2)}%` 
                            : 'N/A';
                        const disk = resources.disk_bytes 
                            ? `${(resources.disk_bytes / 1024 / 1024).toFixed(2)} MB` 
                            : 'N/A';

                        embed.addFields(
                            { name: 'CPU Usage', value: cpu, inline: true },
                            { name: 'Memory Usage', value: memory, inline: true },
                            { name: 'Disk Usage', value: disk, inline: true }
                        );
                    }
                    break;
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[ERROR] Pterodactyl API error:', error);
            
            let errorMessage = '❌ An error occurred while executing the command.';
            
            if (error.response) {
                const status = error.response.status;
                if (status === 401 || status === 403) {
                    errorMessage = '❌ Authentication failed. Please check your API key using `/pyrobot`.';
                } else if (status === 404) {
                    errorMessage = '❌ Server not found. Please check the server ID.';
                } else {
                    errorMessage = `❌ API Error: ${error.response.statusText || 'Unknown error'}`;
                }
            } else if (error.message) {
                errorMessage = `❌ Error: ${error.message}`;
            }

            await interaction.editReply({
                content: errorMessage,
                ephemeral: true
            });
        }
    },
};
