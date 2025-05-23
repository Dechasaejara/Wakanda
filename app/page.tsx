import { db } from "@/backend/db/drizzle";
import { Questions } from "@/backend/db/schema";
import QuizFilter from "@/components/quiz/QuizFilter";
import { unstable_cache } from "next/cache";

export const dynamic = 'force-dynamic'
const getQuestions = unstable_cache(
  async () => {
    return await db.select().from(Questions);
  },
  ["questions"],
  { revalidate: 60, tags: ["questions"] }
);
export default async function Home() {
  const allQuestions = await getQuestions();

  return (
    <main
      className="container mx-auto py-8 px-3 sm:px-1 lg:px-2"
      style={{
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 className="text-3xl font-bold text-center text-amber-600 mb-6">
        Welcome to the Quiz App
      </h1>
      <QuizFilter allQuestions={allQuestions} />
    </main>
  );
}
