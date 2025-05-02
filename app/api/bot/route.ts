import { Bot, webhookCallback } from "grammy";
import { registerCommandHandlers } from "./handlers/commands";
import { registerCallbackHandlers } from "./handlers/callbacks";
import { NextRequest, NextResponse } from "next/server";

const token = process.env.PRODUCTION_BOT_TOKEN as string;
const ADMIN_ID = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;

if (!token) {
  throw new Error("PRODUCTION_BOT_TOKEN environment variable not found.");
}
if (!ADMIN_ID) {
  throw new Error("ADMIN_ID environment variable not set or invalid.");
}

 const bot = new Bot(token);

// Register bot handlers
registerCommandHandlers(bot, ADMIN_ID);
registerCallbackHandlers(bot);

// Create the webhook handler
const endpoint = "https://josad-meet.onrender.com/api/bot"; // <-- put your URL here
await bot.api.setWebhook(endpoint);
export const POST = webhookCallback(bot, 'std/http')