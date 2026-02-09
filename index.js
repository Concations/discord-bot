import { Client, GatewayIntentBits, Partials, Events } from "discord.js";

// ================= CONFIG =================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const GUILD_ID = "1018115455443013672";

const ATTENDEE_ROLE_ID = "1469828678514118716";
const PRESENTER_ROLE_ID = "1469831189786530007";

const ATTENDEE_CODE = "KC26-Attendee!";
const PRESENTER_CODE = "KC26-Presenter!";
// =========================================

// HARD FAIL if token missing
if (!DISCORD_TOKEN || !DISCORD_TOKEN.trim()) {
  console.error("❌ DISCORD_TOKEN is missing or empty");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,     // REQUIRED for roles
    GatewayIntentBits.DirectMessages,   // REQUIRED for DMs
    GatewayIntentBits.MessageContent,   // REQUIRED to read codes
  ],
  partials: [Partials.Channel], // REQUIRED for DM channels
});

// ✅ Correct modern ready event
client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Bot logged in as ${c.user.tag}`);

  try {
    const guild = await c.guilds.fetch(GUILD_ID);
    await guild.members.fetchMe();

    const botMember = guild.members.me;
    console.log("🔎 Bot highest role:", botMember.roles.highest.name);
  } catch (err) {
    console.error("❌ Error during startup guild check:", err);
  }
});

// ✅ DM HANDLER
client.on(Events.MessageCreate, async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // ONLY allow DMs
  if (message.guild) return;

  const code = message.content.trim();
  console.log(`📩 DM from ${message.author.tag}: "${code}"`);

  try {
    const guild = await client.guilds.fetch(GUILD_ID);

    // Force full member fetch (avoids partial/cached failures)
    await guild.members.fetch();

    const member = await guild.members.fetch(message.author.id);

    if (!member) {
      await message.reply("❌ You are not a member of the server.");
      return;
    }

    console.log("👤 Member found:", member.user.tag);
    console.log("🧱 Bot role:", guild.members.me.roles.highest.name);
    console.log(
      "🎟️ Attendee role:",
      guild.roles.cache.get(ATTENDEE_ROLE_ID)?.name
    );

    // ================= ATTENDEE =================
    if (code === ATTENDEE_CODE) {
      await member.roles.add(ATTENDEE_ROLE_ID);
      await message.reply("✅ You’ve been added as an **Attendee**!");
      console.log("✅ Attendee role added");
      return;
    }

    // ================= PRESENTER =================
    if (code === PRESENTER_CODE) {
      await member.roles.add([
        ATTENDEE_ROLE_ID,
        PRESENTER_ROLE_ID,
      ]);
      await message.reply("✅ You’ve been added as **Attendee + Presenter**!");
      console.log("✅ Presenter + Attendee roles added");
      return;
    }

    // ================= INVALID =================
    await message.reply("❌ Invalid code. Please double-check and try again.");

  } catch (err) {
    console.error("🚨 ROLE ASSIGNMENT ERROR:", err);

    await message.reply(
      "⚠️ I couldn’t add your role.\n\n" +
      "Please make sure:\n" +
      "• You are already in the server\n" +
      "• The code is correct\n" +
      "• Try again in a moment"
    );
  }
});

// ================= START =================
client.login(DISCORD_TOKEN.trim()).catch((err) => {
  console.error("❌ Login failed:", err);
  process.exit(1);
});
