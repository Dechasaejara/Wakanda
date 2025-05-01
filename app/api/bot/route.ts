import { Bot } from "grammy";
import { registerCommandHandlers } from "./handlers/commands";
import { registerCallbackHandlers } from "./handlers/callbacks";

const token = process.env.PRODUCTION_BOT_TOKEN as string;
const ADMIN_ID = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;
if (!token) throw new Error("PRODUCTION_BOT_TOKEN environment variable not found.");
if (!ADMIN_ID) throw new Error("ADMIN_ID environment variable not set or invalid.");

export const bot = new Bot(token);

try {
  registerCommandHandlers(bot, ADMIN_ID);
  registerCallbackHandlers(bot);
  bot.start().then(() => {
    console.log("Bot started successfully.");
  });
} catch (error) {
  console.error("Failed to start bot:", error);
  process.exit(1);
}
