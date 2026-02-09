import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Events } from "discord.js";

/* ========= CONFIG ========= */

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = "1231682810776129646";

// Roles
const ATTENDEE_ROLE_ID = "1469828678514118716";
const PRESENTER_ROLE_ID = "1469831189786530007";

// Codes
const ATTENDEE_CODE = "KC26-Attendee!";
const PRESENTER_CODE = "KC26-Presenter!";

/* ========================== */

if (!DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing");
  process.exit(1);
}

console.log("🔥 BOT FILE LOADED");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  console.log("📩 MESSAGE EVENT FIRED");

  if (message.author.bot) return;

  // DM only
  if (message.guild) return;

  const code = message.content.trim();
  console.log(`📩 DM from ${message.author.tag}: ${code}`);

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(message.author.id);

    if (code === ATTENDEE_CODE) {
      await member.roles.add(ATTENDEE_ROLE_ID);
      await message.reply("✅ You’ve been added as an **Attendee**!");
      return;
    }

    if (code === PRESENTER_CODE) {
      await member.roles.add(ATTENDEE_ROLE_ID);
      await member.roles.add(PRESENTER_ROLE_ID);
      await message.reply("✅ You’ve been added as an **Attendee + Presenter**!");
      return;
    }

    await message.reply("❌ Invalid code. Please check and try again.");

  } catch (err) {
    console.error("❌ Role assignment error:", err);
    await message.reply(
      "⚠️ I couldn’t add your role.\n" +
      "• Make sure you are already in the server\n" +
      "• Make sure the code is correct\n" +
      "• Try again in a moment"
    );
  }
});

client.login(DISCORD_TOKEN);
