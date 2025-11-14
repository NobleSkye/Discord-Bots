require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`\n✅ Logged in as ${client.user.tag}\n`);
    console.log('📋 Your Guild IDs:');
    console.log('─'.repeat(60));
    
    client.guilds.cache.forEach(guild => {
        console.log(`Guild: ${guild.name}`);
        console.log(`ID: ${guild.id}`);
        console.log('─'.repeat(60));
    });
    
    console.log('\n💡 Copy one of these IDs and add it to your .env file:');
    console.log('   GUILD_ID=<paste_id_here>');
    console.log('\nPress Ctrl+C to exit.');
});

client.login(process.env.DISCORD_TOKEN);
