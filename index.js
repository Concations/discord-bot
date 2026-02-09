import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: ["CHANNEL"]
});

/* =========================
   CONFIG
   ========================= */

// Discord server (guild)
const GUILD_ID = "1231682810776129646";

// Role IDs
const ROLE_ATTENDEE = "1469828678514118716";       // KC26-Attendee
const ROLE_PRESENTER = "1469831189786530007";     // KC26 Presenter Team

// Access codes → roles
const CODES = {
  "KC26-Attendee!": [ROLE_ATTENDEE],
  "KC26-Presenter!": [ROLE_ATTENDEE, ROLE_PRESENTER]
};

/* =========================
   READY
   ========================= */

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

/* =========================
   DM MESSAGE HANDLER
   ========================= */

client.on("messageCreate", async (message) => {

  // Only respond to DMs
  if (message.guild) return;
  if (!message.content) return;

  const content = message.content.trim();

  // Expected format: !claim CODE
  if (!content.startsWith("!claim")) return;

  const parts = content.split(" ");
  if (parts.length < 2) {
    return message.reply(
      "❌ Please use this format:\n\n`!claim KC26-Attendee!` or `!claim KC26-Presenter!`"
    );
  }

  const code = parts.slice(1).join(" ").trim();

  // Validate code
  if (!CODES[code]) {
    return message.reply("❌ That access code is not valid.");
  }

  try {
    // Fetch guild
    const guild = await client.guilds.fetch(GUILD_ID);

    // Fetch member
    const member = await guild.members.fetch(message.author.id).catch(() => null);

    if (!member) {
      return message.reply(
        "❌ Please join the Discord server first, then try again."
      );
    }

    // Determine which roles need to be added
    const rolesToAdd = CODES[code].filter(
      roleId => !member.roles.cache.has(roleId)
    );

    if (rolesToAdd.length === 0) {
      return message.reply("✅ You already have the correct access.");
    }

    // Add roles
    await member.roles.add(rolesToAdd);

    // Success message
    if (rolesToAdd.length === 1) {
      return message.reply(
        "✅ Access granted! You now have **Attendee** access."
      );
    }

    return message.reply(
      "✅ Access granted! You now have **Attendee** and **Presenter** access."
    );

  } catch (error) {
    console.error("Error assigning roles:", error);
    return message.reply(
      "❌ An error occurred while assigning roles. Please contact an admin."
    );
  }
});

/* =========================
   LOGIN
   ========================= */

client.login(process.env.DISCORD_TOKEN);
