import { Client, GatewayIntentBits } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const defaultChannelId = process.env.DISCORD_CHANNEL_ID;
const prefix = process.env.DISCORD_COMMAND_PREFIX || "!";

let discordClient = null;

export async function initializeBot() {
  console.log("Initializing bot...");
  console.log("Discord token exists:", Boolean(token));

  if (!token) {
    console.log("Discord bot token missing. Add DISCORD_BOT_TOKEN in .env");
    return;
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  discordClient.once("ready", () => {
    console.log(`Discord bot logged in as ${discordClient.user.tag}`);
  });

  discordClient.on("messageCreate", async (discordMessage) => {
    console.log("Message received:", discordMessage.content);

    if (discordMessage.author.bot) return;
    if (!discordMessage.content.startsWith(prefix)) return;

    const [command, ...args] = discordMessage.content
      .slice(prefix.length)
      .trim()
      .split(/\s+/);

    await handleCommand(command?.toLowerCase(), args, discordMessage);
  });

  try {
    console.log("Trying Discord login...");
    await discordClient.login(token);
    console.log("Discord login call finished");
  } catch (error) {
    console.error("Discord login failed:", error.message);
  }
}

async function handleCommand(command, args, discordMessage) {
  if (command === "help") {
    return sendDiscordMessage("Available commands: !help, !room <roomName>, !usage", {
      replyTo: discordMessage
    });
  }

  if (command === "room") {
    const roomName = args.join(" ") || "unknown room";

    return sendDiscordMessage(`Dummy room reply for ${roomName}.`, {
      replyTo: discordMessage
    });
  }

  if (command === "usage") {
    return sendDiscordMessage("Dummy usage reply: total power right now is 420W.", {
      replyTo: discordMessage
    });
  }

  return sendDiscordMessage("Unknown command. Try !help.", {
    replyTo: discordMessage
  });
}

export async function sendDiscordMessage(message, options = {}) {
  if (!discordClient) {
    console.log("Discord client is not initialized");
    return;
  }

  if (options.replyTo) {
    return options.replyTo.reply(message);
  }

  const channelId = options.channelId || defaultChannelId;

  if (!channelId) {
    console.log("Discord channel ID missing. Add DISCORD_CHANNEL_ID in .env");
    return;
  }

  const channel = await discordClient.channels.fetch(channelId);
  return channel.send(message);
}