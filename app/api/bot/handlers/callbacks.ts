import { Bot, Context } from "grammy";
import { db } from "@/backend/db/drizzle";
import { eq, asc } from "drizzle-orm";
import { Profiles, Leaderboard } from "@/backend/db/schema";
import { DatabaseError } from "pg";

async function handleDatabaseOperation<T>(operation: Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await operation;
  } catch (error) {
    if (error instanceof DatabaseError) {
      console.error("Database error:", error.message);
      throw new Error("Database operation failed");
    }
    throw new Error(errorMessage);
  }
}

async function handleViewProfile(ctx: Context) {
  await ctx.answerCallbackQuery({ text: "Loading profile..." });
  
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply("❌ Could not identify user.");
    return;
  }

  try {
    const profile = await handleDatabaseOperation(
      db.select()
        .from(Profiles)
        .where(eq(Profiles.userId, userId))
        .limit(1)
        .execute(),
      "Failed to fetch profile"
    );

    if (!profile[0]) {
      await ctx.reply("❌ Profile not found. Use /start to create one.");
      return;
    }

    const p = profile[0];
    await ctx.reply(
      `👤 **Profile Information**\n` +
      `Name: ${p.firstName} ${p.lastName}\n` +
      `Email: ${p.email || "Not set"}\n` +
      `Phone: ${p.phone || "Not set"}\n` +
      `Badge: ${p.badge}\n` +
      `Points: ${p.points}\n` +
      `Hearts: ${p.heart}`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Profile error:", error);
    await ctx.reply("❌ Failed to load profile. Please try again later.");
  }
}

async function handleViewLeaderboard(ctx: Context) {
  await ctx.answerCallbackQuery({ text: "Loading leaderboard..." });

  try {
    const leaderboard = await handleDatabaseOperation(
      db.select({ username: Leaderboard.username, points: Leaderboard.points, rank: Leaderboard.rank })
        .from(Leaderboard)
        .orderBy(asc(Leaderboard.rank))
        .limit(10)
        .execute(),
      "Failed to fetch leaderboard"
    );

    if (!leaderboard.length) {
      await ctx.reply("🏆 Leaderboard is currently empty.");
      return;
    }

    const leaderboardMessage = leaderboard
      .map(entry => `#${entry.rank} ${entry.username} (${entry.points} pts)`)
      .join("\n");
    await ctx.reply(`🏆 **Top 10 Leaderboard**\n${leaderboardMessage}`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Leaderboard error:", error);
    await ctx.reply("❌ Failed to load leaderboard. Please try again later.");
  }
}

export function registerCallbackHandlers(bot: Bot) {
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    
    try {
      switch (data) {
        case "view_profile":
          await handleViewProfile(ctx);
          break;
        case "view_leaderboard":
          await handleViewLeaderboard(ctx);
          break;
        default:
          await ctx.answerCallbackQuery({ text: "⚠️ Unknown action" });
          return;
      }
    } catch (error) {
      console.error(`Callback [${data}] error:`, error);
      await ctx.answerCallbackQuery({ text: "❌ Action failed" });
    }
  });
}