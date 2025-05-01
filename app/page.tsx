import { db } from "@/backend/db/drizzle";
import { Questions } from "@/backend/db/schema";
import QuizContainer from "@/components/ui/quiz/QuizContainer";

export default async function Home() {
  const questions = await db.select().from(Questions);
// console.log({ questions });
  return (
    <>
      <QuizContainer questions={questions} />
    </>
  );
}
