import { Bot, webhookCallback } from "grammy";
import { registerCommandHandlers } from "./handlers/commands";
import { registerCallbackHandlers } from "./handlers/callbacks";

const token = process.env.PRODUCTION_BOT_TOKEN as string;
const ADMIN_ID = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;

if (!token)
  throw new Error("PRODUCTION_BOT_TOKEN environment variable not found.");
if (!ADMIN_ID)
  throw new Error("ADMIN_ID environment variable not set or invalid.");

const bot = new Bot(token);

// Register bot handlers
registerCommandHandlers(bot, ADMIN_ID);
registerCallbackHandlers(bot);

export async function POST(request: Request) {
  try {
    const text = await request.text();
    // Process the webhook payload
    webhookCallback(bot, "std/http");
  } catch (error) {
    return new Response(`Webhook error: ${error}`, {
      status: 400,
    });
  }

  return new Response("Success!", {
    status: 200,
  });
}
