import { BASE_URL } from "@/utils/formatters";
import { Bot } from "grammy";

export function registerCommandHandlers(bot: Bot, ADMIN_ID: number) {
  const addQuestionsState = new Map<number, boolean>(); // Track users in the "add questions" state

  bot.command("start", async (ctx) => {
    try {
      const inlineKeyboard = new (require("grammy").InlineKeyboard)()
        .text("View Questions", "view_questions")
        .text("Help", "help")
        .row()
        .text("Add Questions", "add_questions");

      await ctx.reply(
        `Welcome, ${ctx.from?.first_name || "User"}! Please choose an option:`,
        { reply_markup: inlineKeyboard }
      );
    } catch (error) {
      console.error(error);
      await ctx.reply("An error occurred while processing your request.");
    }
  });

  bot.command("help", async (ctx) => {
    try {
      await ctx.reply(
        "Available commands:\n" +
          "/start - Show main menu\n" +
          "/help - Show this help message\n" +
          "/questions - Fetch and display questions from the API\n" +
          "/addquestions - Add new questions by uploading a JSON file"
      );
    } catch (error) {
      console.error(error);
      await ctx.reply("An error occurred while processing your request.");
    }
  });

  bot.command("questions", async (ctx) => {
    try {
      const response = await fetch(`${BASE_URL}/api/questions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }
      const questions = await response.json();

      if (questions.length === 0) {
        await ctx.reply("No questions available at the moment.");
        return;
      }

      for (const question of questions) {
        await ctx.reply(
          `Question: ${question.question}\nOptions: ${question.options.join(
            ", "
          )}`
        );
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      await ctx.reply("An error occurred while fetching questions.");
    }
  });

  bot.command("addquestions", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
      await ctx.reply("You are not authorized to use this command.");
      return;
    }

    addQuestionsState.set(ctx.from.id, true); // Set the user in "add questions" state

    await ctx.reply(
      "Please upload a JSON file containing the questions array. Example format:\n" +
        "```json\n" +
        "[\n" +
        "  {\n" +
        '    "question": "What is 2 + 2?",\n' +
        '    "options": ["3", "4", "5"],\n' +
        '    "correctAnswer": "4"\n' +
        "  },\n" +
        "  {\n" +
        '    "question": "What is the capital of France?",\n' +
        '    "options": ["Berlin", "Paris", "Rome"],\n' +
        '    "correctAnswer": "Paris"\n' +
        "  }\n" +
        "]```",
      { parse_mode: "Markdown" }
    );
  });

  bot.on("message:document", async (ctx) => {
    // const isAddingQuestions = addQuestionsState.get(ctx.from?.id || 0);

    // if (!isAddingQuestions) {
    //   return; // Ignore file uploads if the user is not in the "add questions" state
    // }

    try {
      const fileId = ctx.message.document?.file_id;
      if (!fileId) {
        await ctx.reply("No file detected. Please upload a valid JSON file.");
        return;
      }

      // Get the file URL from Telegram
      const file = await ctx.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.PRODUCTION_BOT_TOKEN}/${file.file_path}`;

      // Fetch the file content
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to download the file.");
      }
      const fileContent = await response.text();

      let questionsArray;
      try {
        questionsArray = JSON.parse(fileContent);
        if (!Array.isArray(questionsArray)) {
          throw new Error("File content is not a valid JSON array.");
        }
      } catch (error) {
        await ctx.reply("Invalid JSON format in the file. Please try again.");
        return;
      }

      // Send the questions to the API
      const apiResponse = await fetch(`${BASE_URL}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionsArray),
      });
      console.log({ apiResponse });
      if (!apiResponse.ok) {
        throw new Error(`Failed to add questions: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      await ctx.reply(`Successfully added ${result.length} questions.`);
    } catch (error) {
      console.error("Error adding questions:", error);
      await ctx.reply("An error occurred while adding questions.");
    } finally {
      // addQuestionsState.delete(ctx.from?.id || 0); // Remove the user from "add questions" state
    }
  });

  bot.callbackQuery("view_questions", async (ctx) => {
    try {
      const response = await fetch(`${BASE_URL}/api/questions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }
      const questions = await response.json();

      if (questions.length === 0) {
        await ctx.answerCallbackQuery("No questions available at the moment.");
        return;
      }

      const firstQuestion = questions[0];
      await ctx.reply(
        `Question: ${
          firstQuestion.question
        }\nOptions: ${firstQuestion.options.join(", ")}`
      );
      await ctx.answerCallbackQuery();
    } catch (error) {
      console.error("Error fetching questions:", error);
      await ctx.answerCallbackQuery(
        "An error occurred while fetching questions."
      );
    }
  });
}
