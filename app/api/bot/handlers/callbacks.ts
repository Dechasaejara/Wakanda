import { Bot } from "grammy";
import { db } from "@/backend/db/drizzle";
import { eq,asc } from "drizzle-orm";
import {
  Profiles,
  Leaderboard,
  UserProgress,
  Challenges,
} from "@/backend/db/schema";

export function registerCallbackHandlers(bot: Bot) {
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from?.id;

    try {
      switch (data) {
        case "view_profile":
          if (!userId) {
            await ctx.answerCallbackQuery({ text: "User ID not found." });
            return;
          }
          const profile = await db
            .select()
            .from(Profiles)
            .where(eq(Profiles.userId, userId))
            .limit(1)
            .execute();

          if (profile.length === 0) {
            await ctx.reply("Profile not found. Please register first.");
          } else {
            const p = profile[0];
            await ctx.reply(
              `Profile Info:\n` +
                `Name: ${p.firstName} ${p.lastName}\n` +
                `Email: ${p.email || "N/A"}\n` +
                `Phone: ${p.phone || "N/A"}\n` +
                `Badge: ${p.badge}\n` +
                `Points: ${p.points}\n` +
                `Hearts: ${p.heart}`
            );
          }
          await ctx.answerCallbackQuery();
          break;

        case "view_leaderboard":
          const leaderboard = await db
            .select()
            .from(Leaderboard)
            .orderBy(asc(Leaderboard.rank))
            .limit(10)
            .execute();

          if (leaderboard.length === 0) {
            await ctx.reply("Leaderboard is empty.");
          } else {
            let message = "🏆 Leaderboard Top 10 🏆\n";
            leaderboard.forEach((entry: any) => {
              message += `#${entry.rank} - ${entry.username} (${entry.points} points)\n`;
            });
            await ctx.reply(message);
          }
          await ctx.answerCallbackQuery();
          break;

        case "view_challenges":
          const challenges = await db
            .select()
            .from(Challenges)
            .limit(5)
            .execute();
          if (challenges.length === 0) {
            await ctx.reply("No active challenges at the moment.");
          } else {
            let message = "🔥 Active Challenges 🔥\n";
            challenges.forEach((c: any) => {
              message += `• ${c.title} (${c.difficulty}) - ${c.points} points\n`;
            });
            await ctx.reply(message);
          }
          await ctx.answerCallbackQuery();
          break;

        case "view_progress":
          if (!userId) {
            await ctx.answerCallbackQuery({ text: "User ID not found." });
            return;
          }
          const progress = await db
            .select()
            .from(UserProgress)
            .where(eq(UserProgress.userId, userId))
            .limit(10)
            .execute();

          if (progress.length === 0) {
            await ctx.reply("No progress found. Start learning!");
          } else {
            let message = "📊 Your Progress 📊\n";
            progress.forEach((p: any) => {
              message += `Module ${p.moduleId}, Lesson ${p.lessonId}: Score ${
                p.score
              }, Completed: ${p.completed ? "Yes" : "No"}\n`;
            });
            await ctx.reply(message);
          }
          await ctx.answerCallbackQuery();
          break;

        default:
          await ctx.answerCallbackQuery({ text: "Unknown action." });
      }
    } catch (error) {
      console.error(error);
      try {
        await ctx.reply("An error occurred while processing your request.");
      } catch {}
    }
  });
}
