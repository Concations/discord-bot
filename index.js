import { Client, GatewayIntentBits, Partials, Events } from "discord.js";

// ================= CONFIG =================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// ⛔ THIS MUST BE THE *SERVER ID*, NOT A USER ID
const GUILD_ID = "1018115455443013672";

const ATTENDEE_ROLE_ID = "1469828678514118716";
const PRESENTER_ROLE_ID = "1469831189786530007";

const ATTENDEE_CODE = "KC26-Attendee!";
const PRESENTER_CODE = "KC26-Presenter!";
// =========================================

if (!DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN missing");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (client) => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  console.log("📋 Guilds visible to bot:");
  client.guilds.cache.forEach(g => {
    console.log(`• ${g.name} (${g.id})`);
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.guild) return; // DMs only

  const code = message.content.trim();
  console.log(`📩 DM from ${message.author.tag}: ${code}`);

  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      await message.reply("❌ Bot cannot see the server. Contact admin.");
      console.error("❌ Guild not found in cache:", GUILD_ID);
      return;
    }

    const member = await guild.members.fetch(message.author.id);

    if (code === ATTENDEE_CODE) {
      await member.roles.add(ATTENDEE_ROLE_ID);
      await message.reply("✅ You’ve been added as an **Attendee**!");
      return;
    }

    if (code === PRESENTER_CODE) {
      await member.roles.add([ATTENDEE_ROLE_ID, PRESENTER_ROLE_ID]);
      await message.reply("✅ You’ve been added as **Attendee + Presenter**!");
      return;
    }

    await message.reply("❌ Invalid code.");

  } catch (err) {
    console.error("🚨 Role assignment failed:", err);
    await message.reply("⚠️ I couldn’t add your role. Please try again.");
  }
});

client.login(DISCORD_TOKEN);
