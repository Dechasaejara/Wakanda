import { useState, useEffect, useRef } from "react";
import { AnswerStatus } from "@/types";
import { Question } from "@/backend/db/schema";

export function useQuiz(
  quizData: Question[],
  initialLives = 3,
  initialHints = 1
) {
  let [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [hintsAvailable, setHintsAvailable] = useState(initialHints);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; color: string }>({
    message: "",
    color: "",
  });
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [resultsTitle, setResultsTitle] = useState("");
  const [resultsMessage, setResultsMessage] = useState("");
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const savedScore = localStorage.getItem("quizAppBestScore");
    if (savedScore) setBestScore(parseInt(savedScore, 10));
    startQuiz();
  }, []);

  function startQuiz() {
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(initialLives);
    setHintsAvailable(initialHints);
    setIsQuizOver(false);
    setAnswerStatus(null);
    setSelectedOption(null);
    setDisabledOptions([]);
    setFeedback({ message: "", color: "" });
    setResultsTitle("");
    setResultsMessage("");
  }

  function selectAnswer(option: string) {
    if (answerStatus !== null || isQuizOver) return;

    const currentQuestion = quizData[++currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    setSelectedOption(option);
    setAnswerStatus(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer(currentQuestion.correctAnswer);
    }
  }

  function handleCorrectAnswer() {
    setScore((prev) => prev + 10);
    setFeedback({ message: "Correct!", color: "text-emerald-600" });
    setTimeout(nextQuestion, 1500);
  }

  function handleIncorrectAnswer(correctAnswer: string) {
    setLives((prev) => {
      const updatedLives = prev - 1;
      if (updatedLives <= 0) {
        setTimeout(() => endQuiz(false, "Out of lives!"), 1500);
      } else {
        setTimeout(nextQuestion, 1500);
      }
      return updatedLives;
    });

    setFeedback({
      message: `Incorrect! The correct answer was ${correctAnswer}`,
      color: "text-red-600",
    });
  }

  function nextQuestion() {
    if (currentQuestionIndex + 1 >= quizData.length) {
      endQuiz(true, "You've completed the quiz!");
    } else {
      setAnswerStatus(null);
      setSelectedOption(null);
      setFeedback({ message: "", color: "" });
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  function useHint() {
    if (hintsAvailable <= 0 || isQuizOver) return;

    const currentQuestion = quizData[currentQuestionIndex];
    const options = currentQuestion.options as string[];
    const incorrectOptions = options.filter(
      (opt) =>
        opt !== currentQuestion.correctAnswer && !disabledOptions.includes(opt)
    );

    if (incorrectOptions.length > 0) {
      const optionToDisable = incorrectOptions[0];
      setDisabledOptions((prev) => [...prev, optionToDisable]);
      setHintsAvailable((prev) => prev - 1);
      setFeedback({
        message: `Hint used! ${currentQuestion.explanation}`,
        color: "text-blue-600",
      });
    }
  }

  function endQuiz(completed: boolean, message: string = "Game Over!") {
    setIsQuizOver(true);

    if (completed) {
      handleQuizCompletion();
    } else {
      handleQuizFailure(message);
    }
  }

  function handleQuizCompletion() {
    setResultsTitle("Quiz Complete!");
    let msg = "Congratulations! You've answered all questions.";
    if (score >= quizData.length * 10 * 0.8) msg += " Excellent work!";
    else if (score >= quizData.length * 10 * 0.5) msg += " Good job!";
    else msg += " Keep practicing!";

    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("quizAppBestScore", score.toString());
      msg += " New high score!";
    }

    setResultsMessage(msg);
  }

  function handleQuizFailure(message: string) {
    setResultsTitle(message);
    setResultsMessage("Better luck next time!");

    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("quizAppBestScore", score.toString());
    }
  }

  return {
    currentQuestionIndex,
    score,
    lives,
    hintsAvailable,
    answerStatus,
    selectedOption,
    disabledOptions,
    feedback,
    isQuizOver,
    resultsTitle,
    resultsMessage,
    bestScore,
    startQuiz,
    selectAnswer,
    nextQuestion,
    useHint,
    endQuiz,
  };
}
