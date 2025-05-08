import { db } from "@/backend/db/drizzle";
import { Questions } from "@/backend/db/schema";
import QuizFilter from "@/components/ui/quiz/QuizFilter";

export default async function Home() {
  const allQuestions = await db.select().from(Questions);

  return (
    <main
      className="container mx-auto py-8 px-2 sm:px-1 lg:px-8"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <h1 className="text-3xl font-bold text-center text-amber-600 mb-6">
        Welcome to the Quiz App
      </h1>
      <QuizFilter allQuestions={allQuestions} />
    </main>
  );
}