// types.ts
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

export type AnswerStatus = "correct" | "incorrect" | "timeout" | null;
export type QuizType = "multiple-choice" | "true-false" | "fill-in-the-blank";
