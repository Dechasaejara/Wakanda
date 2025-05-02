import { useState, useEffect, useRef } from "react";
import { AnswerStatus } from "@/types"; // Assuming types are defined here
import { Question } from "@/backend/db/schema"; // Assuming schema is defined here

export function useQuiz(
  quizData: Question[],
  initialLives = 3,
  initialHints = 1
) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  // Ref to ensure questions are available before starting
  const isInitialized = useRef(false);

  useEffect(() => {
    const savedScore = localStorage.getItem("quizAppBestScore");
    if (savedScore) setBestScore(parseInt(savedScore, 10));
    // Ensure quizData is populated before starting
    if (quizData && quizData.length > 0 && !isInitialized.current) {
        startQuiz();
        isInitialized.current = true;
    }
  // Add quizData dependency to handle async loading
  }, [quizData]);

  function startQuiz() {
    console.log("Starting quiz..."); // Debug log
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
    isInitialized.current = true; // Mark as initialized
  }

  function selectAnswer(option: string) {
    if (answerStatus !== null || isQuizOver) return;

    // --- FIX START ---
    // Get the current question *before* potentially changing the index
    const currentQuestion = quizData[currentQuestionIndex];
    if (!currentQuestion) return; // Safety check

    const isCorrect = option === currentQuestion.correctAnswer;
    // --- FIX END ---

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
    // Wait slightly longer before moving to the next question to show feedback
    setTimeout(nextQuestion, 1500);
  }

  function handleIncorrectAnswer(correctAnswer: string) {
    setLives((prev) => {
      const updatedLives = prev - 1;
      if (updatedLives <= 0) {
        // End quiz immediately if lives run out
        setTimeout(() => endQuiz(false, "Out of lives!"), 1500); // Keep timeout consistent
      } else {
        // Wait before moving to the next question
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
    // Check if it was the last question
    if (currentQuestionIndex + 1 >= quizData.length) {
      // Check lives again in case timeout occurred simultaneously
      if(lives > 0) {
        endQuiz(true, "You've completed the quiz!");
      } else if (!isQuizOver) { // Ensure endQuiz due to lives isn't already called
         endQuiz(false, "Out of lives!");
      }
    } else {
      // Reset state for the next question
      setAnswerStatus(null);
      setSelectedOption(null);
      setDisabledOptions([]); // Reset disabled options for the new question
      setFeedback({ message: "", color: "" });
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  function useHint() {
    if (hintsAvailable <= 0 || isQuizOver || answerStatus !== null) return; // Don't allow hint after answering

    const currentQuestion = quizData[currentQuestionIndex];
    if (!currentQuestion || !Array.isArray(currentQuestion.options)) return; // Safety check

    const options = currentQuestion.options as string[];
    const incorrectOptions = options.filter(
      (opt) =>
        opt !== currentQuestion.correctAnswer && !disabledOptions.includes(opt)
    );

    // Ensure there's more than one incorrect option left to remove
    if (incorrectOptions.length > 0 && (options.length - disabledOptions.length) > 2) {
      // Randomly select one incorrect option to disable
      const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
      const optionToDisable = incorrectOptions[randomIndex];

      setDisabledOptions((prev) => [...prev, optionToDisable]);
      setHintsAvailable((prev) => prev - 1);
      setFeedback({
        // Provide explanation if available, otherwise a generic message
        message: `Hint used! ${currentQuestion.explanation || 'An incorrect option was removed.'}`,
        color: "text-blue-600",
      });
    } else {
         setFeedback({
            message: "Hint cannot remove more options.",
            color: "text-orange-600",
         });
    }
  }

   function endQuiz(completed: boolean, message: string = "Game Over!") {
    if(isQuizOver) return; // Prevent multiple calls

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
    // Adjust score calculation if needed (assuming 10 points per question)
    const maxScore = quizData.length * 10;
    if (score >= maxScore * 0.8) msg += " Excellent work!";
    else if (score >= maxScore * 0.5) msg += " Good job!";
    else msg += " Keep practicing!";

    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("quizAppBestScore", score.toString());
      msg += " New high score!";
    }

    setResultsMessage(msg);
  }

  function handleQuizFailure(message: string) {
    setResultsTitle(message); // Use the message passed (e.g., "Out of lives!", "Out of time!")
    setResultsMessage("Better luck next time!");

    // Update best score even on failure if the current score is higher
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("quizAppBestScore", score.toString());
    }
  }

  // Make sure to return all necessary states and functions
  return {
    currentQuestionIndex,
    score,
    lives,
    hintsAvailable,
    answerStatus,
    selectedOption,
    disabledOptions,
    feedback, // Return feedback state
    isQuizOver,
    resultsTitle,
    resultsMessage,
    bestScore,
    startQuiz,
    selectAnswer,
    handleIncorrectAnswer,
    nextQuestion, // nextQuestion is needed by timer
    useHint,
    endQuiz, // endQuiz is needed by timer
  };
}