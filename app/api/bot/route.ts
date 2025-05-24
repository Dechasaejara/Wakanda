import { Bot, webhookCallback } from "grammy";
import { registerCommandHandlers } from "./handlers/commands";
import { registerCallbackHandlers } from "./handlers/callbacks";
import { NextRequest, NextResponse } from "next/server";

const token = process.env.PRODUCTION_BOT_TOKEN!;
const ADMIN_ID =  parseInt(process.env.ADMIN_ID!);
const endpoint = "https://josad-meet.onrender.com/api/bot";

function validateEnvironment() {
  if (!token) throw new Error("PRODUCTION_BOT_TOKEN environment variable not found.");
  if (!ADMIN_ID || isNaN(ADMIN_ID)) throw new Error("ADMIN_ID environment variable invalid.");
}

try {
  validateEnvironment();
} catch (error) {
  console.error("Fatal startup error:", error);
  process.exit(1);
}

const bot = new Bot(token);

// Register handlers with centralized error handling
bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error(`Error processing update ${ctx.update.update_id}:`, err);
    await ctx.reply("❌ An unexpected error occurred. Please try again later.");
  }
});

registerCommandHandlers(bot, ADMIN_ID);
registerCallbackHandlers(bot);

// Webhook configuration
bot.start({
  onStart: async () => {
    try {
      await bot.api.setWebhook(endpoint);
      console.log("Webhook set successfully");
    } catch (error) {
      console.error("Failed to set webhook:", error);
      process.exit(1);
    }
  }
});

export const POST = async (req: NextRequest) => {
  try {
    const handler = webhookCallback(bot, 'std/http');
    return await handler(req);
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
};