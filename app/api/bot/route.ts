import { Bot, webhookCallback } from "grammy";
import { db } from "@/backend/db/drizzle";
import { Questions } from "@/backend/db/schema";
import { DatabaseError } from "@neondatabase/serverless";

// --- Environment Validation ---
const token = process.env.PRODUCTION_BOT_TOKEN;
const adminId = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID) : null;
const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_BASE_URL
    : process.env.DEVELOPMENT_BASE_URL;

if (!token) {
  throw new Error("PRODUCTION_BOT_TOKEN environment variable not found.");
}
if (!adminId) {
  throw new Error("ADMIN_ID environment variable not set or invalid.");
}
if (!baseUrl) {
  throw new Error("BASE_URL environment variable not set.");
}

const webhookUrl = `${baseUrl}/api/bot`;

// --- Bot Initialization ---
const bot = new Bot(token);

// --- Helper Functions ---
async function validateJsonQuestions(content: string): Promise<any[]> {
  const questions = JSON.parse(content);

  if (!Array.isArray(questions)) {
    throw new Error("JSON data must be an array.");
  }

  questions.forEach((q, index) => {
    if (typeof q.question !== "string" || !q.question.trim()) {
      throw new Error(
        `Question at index ${index} is missing a valid 'question' field.`
      );
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      throw new Error(
        `Question at index ${index} must have an 'options' array with at least 2 items.`
      );
    }
    if (typeof q.correctAnswer !== "string" || !q.correctAnswer.trim()) {
      throw new Error(
        `Question at index ${index} is missing a valid 'correctAnswer' field.`
      );
    }
  });

  return questions;
}

async function storeQuestionInDatabase(question: any) {
  try {
    const result = await db.insert(Questions).values(question).returning();
    // console.log(`✅ Successfully added question:`, question);
    return result;
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database error during question storage:", error.message);
      throw new Error("A database error occurred while saving.");
    }
    throw error;
  }
}

// --- Command Handlers ---
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Welcome! Use /upload to upload a JSON file containing questions."
  );
});

bot.command("upload", async (ctx) => {
  await ctx.reply("📤 Please upload a JSON file containing questions.");
});

bot.on("message:document", async (ctx) => {
  if (ctx.message.document.mime_type !== "application/json") {
    await ctx.reply("❌ Invalid file type. Please upload a JSON file.");
    return;
  }

  await ctx.reply("⏳ Processing file...");

  try {
    const file = await ctx.api.getFile(ctx.message.document.file_id);

    if (!file.file_path) {
      throw new Error("File path is not available.");
    }

    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file (status: ${response.status}).`);
    }

    const fileContent = await response.text();
    const questions = await validateJsonQuestions(fileContent);

    // Upload questions one by one
    for (const question of questions) {
      await storeQuestionInDatabase(question);
    }

    await ctx.reply(
      `✅ Successfully added ${questions.length} questions to the database.`
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database error during question storage:", error.message);
      throw new Error("A database error occurred while saving.");
    }
    throw error;
  }
});

// --- Start the Bot ---
// bot.start();
// console.log("Bot started in long-polling mode...");

// Export the webhook handler for Next.js API routes
export const POST = webhookCallback(bot, "std/http");

// Optional: Add a dedicated endpoint for setting the webhook
export async function setupWebhook() {
  try {
    await bot.api.setWebhook(webhookUrl);
    console.log(`Webhook set to: ${webhookUrl}`);
  } catch (error) {
    console.error("Failed to set webhook:", error);
  }
}
