require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('[INFO] Force clearing ALL commands (global and guild-specific)...');

        // Clear global commands
        console.log('[INFO] Clearing global commands...');
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: [] },
        );
        console.log('[SUCCESS] ✅ Cleared all global commands.');

        // If you have a specific guild ID, clear that too
        if (process.env.GUILD_ID && process.env.GUILD_ID !== 'your_guild_id_here') {
            console.log(`[INFO] Clearing guild commands for guild ID: ${process.env.GUILD_ID}...`);
            await rest.put(
                Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID),
                { body: [] },
            );
            console.log('[SUCCESS] ✅ Cleared all guild commands.');
        }

        console.log('\n[SUCCESS] ✨ All old commands have been cleared!');
        console.log('[INFO] Now restart your bot or run "npm run deploy" to register new commands.');
        console.log('[INFO] Discord may take up to 1 hour to fully update global commands.');
        console.log('[INFO] Guild commands update instantly.');

    } catch (error) {
        console.error('[ERROR] ❌ Failed to clear commands:', error);
        process.exit(1);
    }
})();
