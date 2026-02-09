import { Client, GatewayIntentBits, Partials, Events } from "discord.js";

// ===== CONFIG =====
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = "1231682810776129646";

const ATTENDEE_ROLE_ID = "1469828678514118716";
const PRESENTER_ROLE_ID = "1469831189786530007";

const ATTENDEE_CODE = "KC26-Attendee!";
const PRESENTER_CODE = "KC26-Presenter!";
// ==================

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

// ✅ Use modern ready event
client.once(Events.ClientReady, (c) => {
  console.log(`✅ Bot logged in as ${c.user.tag}`);
});

// DM handler
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.guild) return; // DM only

  const code = message.content.trim();
  console.log(`📩 DM from ${message.author.tag}: "${code}"`);

  try {
    const guild = await client.guilds.fetch(GUILD_ID);

    // 🔑 FORCE fresh member fetch (this is the fix)
    const member = await guild.members.fetch({
      user: message.author.id,
      force: true,
    });

    if (!member) {
      await message.reply("❌ I can’t find you in the server. Please join first.");
      return;
    }

    if (code === ATTENDEE_CODE) {
      await member.roles.add(ATTENDEE_ROLE_ID);
      await message.reply("✅ You’ve been added as an **Attendee**!");
      return;
    }

    if (code === PRESENTER_CODE) {
      await member.roles.add([ATTENDEE_ROLE_ID, PRESENTER_ROLE_ID]);
      await message.reply("✅ You’ve been added as an **Attendee + Presenter**!");
      return;
    }

    await message.reply("❌ Invalid code. Please double-check and try again.");

  } catch (err) {
    console.error("❌ Role assignment error:", err);

    await message.reply(
      "⚠️ I couldn’t add your role.\n" +
      "• Make sure you are already in the server\n" +
      "• Try again in a moment"
    );
  }
});

client.login(DISCORD_TOKEN);
