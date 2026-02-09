import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

console.log('🚀 FILE LOADED');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', () => {
  console.log('✅ READY EVENT FIRED');
});

client.login(process.env.DISCORD_TOKEN);
