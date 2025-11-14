const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Nodeactyl = require('nodeactyl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pterodactyl')
        .setDescription('Advanced Pterodactyl API commands')
        .addSubcommandGroup(group =>
            group
                .setName('server')
                .setDescription('Server management commands')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('list')
                        .setDescription('List all your servers')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('details')
                        .setDescription('Get detailed server information')
                        .addStringOption(option =>
                            option
                                .setName('server_id')
                                .setDescription('The server identifier')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('resources')
                        .setDescription('Get server resource usage')
                        .addStringOption(option =>
                            option
                                .setName('server_id')
                                .setDescription('The server identifier')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('command')
                        .setDescription('Send a command to the server')
                        .addStringOption(option =>
                            option
                                .setName('server_id')
                                .setDescription('The server identifier')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option
                                .setName('command')
                                .setDescription('The command to send')
                                .setRequired(true)
                        )
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('account')
                .setDescription('Account management commands')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('info')
                        .setDescription('Get your account information')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('api-key')
                        .setDescription('Manage your API keys')
                        .addStringOption(option =>
                            option
                                .setName('action')
                                .setDescription('Action to perform')
                                .setRequired(true)
                                .addChoices(
                                    { name: 'List Keys', value: 'list' },
                                    { name: 'Create Key', value: 'create' },
                                    { name: 'Delete Key', value: 'delete' }
                                )
                        )
                        .addStringOption(option =>
                            option
                                .setName('description')
                                .setDescription('Description for the new API key (for create action)')
                                .setRequired(false)
                        )
                        .addStringOption(option =>
                            option
                                .setName('key_id')
                                .setDescription('API key identifier to delete (for delete action)')
                                .setRequired(false)
                        )
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('file')
                .setDescription('File management commands')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('list')
                        .setDescription('List files in a directory')
                        .addStringOption(option =>
                            option
                                .setName('server_id')
                                .setDescription('The server identifier')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option
                                .setName('path')
                                .setDescription('Directory path (default: /)')
                                .setRequired(false)
                        )
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('database')
                .setDescription('Database management commands')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('list')
                        .setDescription('List all databases for a server')
                        .addStringOption(option =>
                            option
                                .setName('server_id')
                                .setDescription('The server identifier')
                                .setRequired(true)
                        )
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userId = interaction.user.id;
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        // Get user's credentials from database
        const user = interaction.client.db.getUser(userId);

        if (!user) {
            return interaction.editReply({
                content: '❌ You need to set up your API key first! Use `/pyrobot <api_key> <panel_url>` to configure.',
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            // Initialize Pterodactyl client
            const client = new Nodeactyl.NodeactylClient(user.panel_url, user.api_key);

            if (group === 'server') {
                await handleServerCommands(interaction, client, subcommand);
            } else if (group === 'account') {
                await handleAccountCommands(interaction, client, subcommand);
            } else if (group === 'file') {
                await handleFileCommands(interaction, client, subcommand);
            } else if (group === 'database') {
                await handleDatabaseCommands(interaction, client, subcommand);
            }

        } catch (error) {
            console.error('[ERROR] Pterodactyl API error:', error);
            await handleError(interaction, error);
        }
    },
};

async function handleServerCommands(interaction, client, subcommand) {
    const serverId = interaction.options.getString('server_id');

    switch (subcommand) {
        case 'list':
            const servers = await client.getClientServers();
            
            if (!servers.data || servers.data.length === 0) {
                return interaction.editReply({
                    content: '📭 You don\'t have any servers.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const serverList = servers.data.map((server, index) => {
                const attrs = server.attributes;
                return `**${index + 1}.** \`${attrs.identifier}\` - ${attrs.name}`;
            }).join('\n');

            const listEmbed = new EmbedBuilder()
                .setTitle('📋 Your Servers')
                .setDescription(serverList)
                .setColor('#0099ff')
                .setFooter({ text: `Total: ${servers.data.length} server(s)` })
                .setTimestamp();

            await interaction.editReply({ embeds: [listEmbed] });
            break;

        case 'details':
            const serverDetails = await client.getServerDetails(serverId);
            const attrs = serverDetails.attributes;

            const detailsEmbed = new EmbedBuilder()
                .setTitle('🖥️ Server Details')
                .setDescription(`**${attrs.name}**`)
                .addFields(
                    { name: 'Identifier', value: attrs.identifier, inline: true },
                    { name: 'UUID', value: attrs.uuid, inline: true },
                    { name: 'Node', value: attrs.node || 'N/A', inline: true },
                    { name: 'SFTP Address', value: attrs.sftp_details?.ip ? `${attrs.sftp_details.ip}:${attrs.sftp_details.port}` : 'N/A', inline: false }
                )
                .setColor('#0099ff')
                .setTimestamp();

            // Add limits if available
            if (attrs.limits) {
                detailsEmbed.addFields(
                    { name: 'Memory Limit', value: `${attrs.limits.memory} MB`, inline: true },
                    { name: 'Disk Limit', value: `${attrs.limits.disk} MB`, inline: true },
                    { name: 'CPU Limit', value: `${attrs.limits.cpu}%`, inline: true }
                );
            }

            await interaction.editReply({ embeds: [detailsEmbed] });
            break;

        case 'resources':
            const serverUsage = await client.getServerUsages(serverId);
            const state = serverUsage.attributes?.current_state || 'unknown';
            const stateEmoji = {
                'running': '🟢',
                'starting': '🟡',
                'stopping': '🟠',
                'offline': '🔴'
            }[state] || '⚪';

            const resourceEmbed = new EmbedBuilder()
                .setTitle('📊 Server Resources')
                .addFields(
                    { name: 'Status', value: `${stateEmoji} ${state.toUpperCase()}`, inline: false }
                )
                .setColor(state === 'running' ? '#00ff00' : '#ff0000')
                .setTimestamp();

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
                const network_rx = resources.network_rx_bytes
                    ? `${(resources.network_rx_bytes / 1024 / 1024).toFixed(2)} MB`
                    : 'N/A';
                const network_tx = resources.network_tx_bytes
                    ? `${(resources.network_tx_bytes / 1024 / 1024).toFixed(2)} MB`
                    : 'N/A';

                resourceEmbed.addFields(
                    { name: 'CPU Usage', value: cpu, inline: true },
                    { name: 'Memory Usage', value: memory, inline: true },
                    { name: 'Disk Usage', value: disk, inline: true },
                    { name: 'Network RX', value: network_rx, inline: true },
                    { name: 'Network TX', value: network_tx, inline: true }
                );
            }

            await interaction.editReply({ embeds: [resourceEmbed] });
            break;

        case 'command':
            const command = interaction.options.getString('command');
            await client.sendServerCommand(serverId, command);

            const commandEmbed = new EmbedBuilder()
                .setTitle('✅ Command Sent')
                .setDescription(`Command sent to server \`${serverId}\``)
                .addFields(
                    { name: 'Command', value: `\`${command}\``, inline: false }
                )
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.editReply({ embeds: [commandEmbed] });
            break;
    }
}

async function handleAccountCommands(interaction, client, subcommand) {
    switch (subcommand) {
        case 'info':
            const accountInfo = await client.getAccountDetails();
            const attrs = accountInfo.attributes;

            const infoEmbed = new EmbedBuilder()
                .setTitle('👤 Account Information')
                .addFields(
                    { name: 'Username', value: attrs.username, inline: true },
                    { name: 'Email', value: attrs.email, inline: true },
                    { name: 'Admin', value: attrs.admin ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Language', value: attrs.language || 'en', inline: true },
                    { name: '2FA Enabled', value: attrs['2fa'] ? '✅ Yes' : '❌ No', inline: true }
                )
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.editReply({ embeds: [infoEmbed] });
            break;

        case 'api-key':
            const action = interaction.options.getString('action');
            
            if (action === 'list') {
                const apiKeys = await client.getAccountAPIKeys();
                
                if (!apiKeys.data || apiKeys.data.length === 0) {
                    return interaction.editReply({
                        content: '📭 You don\'t have any API keys.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                const keyList = apiKeys.data.map((key, index) => {
                    const keyAttrs = key.attributes;
                    const lastUsed = keyAttrs.last_used_at 
                        ? new Date(keyAttrs.last_used_at).toLocaleString()
                        : 'Never';
                    return `**${index + 1}.** ${keyAttrs.description}\n   ID: \`${keyAttrs.identifier}\` | Last Used: ${lastUsed}`;
                }).join('\n\n');

                const keyListEmbed = new EmbedBuilder()
                    .setTitle('🔑 Your API Keys')
                    .setDescription(keyList)
                    .setColor('#0099ff')
                    .setTimestamp();

                await interaction.editReply({ embeds: [keyListEmbed] });

            } else if (action === 'create') {
                const description = interaction.options.getString('description') || 'Created via Discord Bot';
                
                try {
                    const newKey = await client.createAccountAPIKey(description);
                    
                    const createEmbed = new EmbedBuilder()
                        .setTitle('✅ API Key Created')
                        .setDescription('⚠️ **Important:** Save this key now! You won\'t be able to see it again.')
                        .addFields(
                            { name: 'Description', value: description, inline: false },
                            { name: 'API Key', value: `\`${newKey.meta?.secret_token || 'Check panel'}\``, inline: false }
                        )
                        .setColor('#00ff00')
                        .setTimestamp();

                    await interaction.editReply({ embeds: [createEmbed] });
                } catch (error) {
                    throw error;
                }

            } else if (action === 'delete') {
                const keyId = interaction.options.getString('key_id');
                
                if (!keyId) {
                    return interaction.editReply({
                        content: '❌ Please provide a key_id to delete. Use `/pterodactyl account api-key list` to see your keys.',
                        flags: MessageFlags.Ephemeral
                    });
                }

                await client.deleteAccountAPIKey(keyId);

                const deleteEmbed = new EmbedBuilder()
                    .setTitle('🗑️ API Key Deleted')
                    .setDescription(`API key \`${keyId}\` has been deleted.`)
                    .setColor('#ff0000')
                    .setTimestamp();

                await interaction.editReply({ embeds: [deleteEmbed] });
            }
            break;
    }
}

async function handleFileCommands(interaction, client, subcommand) {
    const serverId = interaction.options.getString('server_id');

    switch (subcommand) {
        case 'list':
            const path = interaction.options.getString('path') || '/';
            const files = await client.listServerFiles(serverId, path);

            if (!files.data || files.data.length === 0) {
                return interaction.editReply({
                    content: `📭 No files found in \`${path}\``,
                    flags: MessageFlags.Ephemeral
                });
            }

            const fileList = files.data
                .slice(0, 15) // Limit to 15 files to avoid embed size limits
                .map((file, index) => {
                    const attrs = file.attributes;
                    const icon = attrs.is_file ? '📄' : '📁';
                    const size = attrs.is_file ? ` (${formatBytes(attrs.size)})` : '';
                    return `${icon} \`${attrs.name}\`${size}`;
                }).join('\n');

            const fileEmbed = new EmbedBuilder()
                .setTitle('📁 Server Files')
                .setDescription(`**Path:** \`${path}\`\n\n${fileList}`)
                .setColor('#0099ff')
                .setFooter({ text: `Showing ${Math.min(15, files.data.length)} of ${files.data.length} file(s)` })
                .setTimestamp();

            await interaction.editReply({ embeds: [fileEmbed] });
            break;
    }
}

async function handleDatabaseCommands(interaction, client, subcommand) {
    const serverId = interaction.options.getString('server_id');

    switch (subcommand) {
        case 'list':
            const databases = await client.listServerDatabases(serverId);

            if (!databases.data || databases.data.length === 0) {
                return interaction.editReply({
                    content: '📭 No databases found for this server.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const dbList = databases.data.map((db, index) => {
                const attrs = db.attributes;
                return `**${index + 1}.** ${attrs.name}\n   Host: \`${attrs.host.address}:${attrs.host.port}\`\n   Username: \`${attrs.username}\``;
            }).join('\n\n');

            const dbEmbed = new EmbedBuilder()
                .setTitle('🗄️ Server Databases')
                .setDescription(dbList)
                .setColor('#0099ff')
                .setFooter({ text: `Total: ${databases.data.length} database(s)` })
                .setTimestamp();

            await interaction.editReply({ embeds: [dbEmbed] });
            break;
    }
}

async function handleError(interaction, error) {
    let errorMessage = '❌ An error occurred while executing the command.';
    
    if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
            errorMessage = '❌ Authentication failed. Please check your API key using `/pyrobot`.';
        } else if (status === 404) {
            errorMessage = '❌ Resource not found. Please check your input.';
        } else {
            errorMessage = `❌ API Error (${status}): ${error.response.statusText || 'Unknown error'}`;
        }
    } else if (error.message) {
        errorMessage = `❌ Error: ${error.message}`;
    }

    await interaction.editReply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral
    });
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
