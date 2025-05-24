import { Bot, InlineKeyboard } from "grammy";
import { BASE_URL } from "@/utils/formatters";
import { db } from "@/backend/db/drizzle";
import { Challenges } from "@/backend/db/schema";
import { DatabaseError } from "pg";

const addQuestionsState = new Map<number, boolean>();

async function validateJsonQuestions(content: string): Promise<any[]> {
  try {
    const questions = JSON.parse(content);
    if (!Array.isArray(questions)) throw new Error("Not an array");
    return questions;
  } catch (error) {
    throw new Error("Invalid JSON format");
  }
}

async function storeQuestionsInDatabase(questions: any[]) {
  try {
    return await db.transaction(async (tx) => {
      const inserted = [];
      for (const q of questions) {
        const [question] = await tx.insert(Challenges)
          .values(q)
          .returning();
        inserted.push(question);
      }
      return inserted;
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database error:", error.message);
      throw new Error("Failed to store questions in database");
    }
    throw error;
  }
}

export function registerCommandHandlers(bot: Bot, ADMIN_ID: number) {
  bot.command("start", async (ctx) => {
    try {
      const keyboard = new InlineKeyboard()
        .text("View Questions", "view_questions")
        .text("Help", "help")
        .row()
        .text("Add Questions", "add_questions");

      await ctx.reply(
        `Welcome ${ctx.chat.first_name}! Choose an option:`,
        { reply_markup: keyboard }
      );
    } catch (error) {
      console.error("Start command error:", error);
      await ctx.reply("⚠️ Failed to initialize. Please try again.");
    }
  });

  bot.command("addquestions", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
      await ctx.reply("⛔ Unauthorized");
      return;
    }

    addQuestionsState.set(ctx.from.id, true);
    await ctx.reply(
      "📤 Upload a JSON file with questions array. Format:\n" +
      "[\n" +
      "  {\n" +
      '    "question": "...",\n' +
      '    "options": ["...", "..."],\n' +
      '    "correctAnswer": "..."\n' +
      "  }\n" +
      "]",
      { parse_mode: "MarkdownV2" }
    );
  });

  bot.on("message:document", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId || !addQuestionsState.get(userId)) return;

    try {
      const fileId = ctx.message.document.file_id;
      const file = await ctx.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.PRODUCTION_BOT_TOKEN}/${file.file_path}`;
      
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("File download failed");
      
      const questions = await validateJsonQuestions(await response.text());
      const result = await storeQuestionsInDatabase(questions);
      
      await ctx.reply(`✅ Added ${result.length} questions`);
    } catch (error) {
      console.error("File upload error:", error);
      await ctx.reply("❌ Failed to process file: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      addQuestionsState.delete(userId);
    }
  });

  // Other commands with similar error handling improvements...
}