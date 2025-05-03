import { useState, useEffect, useRef, useCallback } from "react";
// Assuming types are defined in these paths - adjust if necessary
import { AnswerStatus } from "@/types";
import { Question } from "@/backend/db/schema";

const SCORE_INCREMENT = 1;
const FEEDBACK_DISPLAY_TIME_MS = 2500; // Time to show feedback before next question

/**
 * Custom hook to manage the state and logic of a quiz.
 * @param quizData - Array of question objects.
 * @param initialLives - Starting number of lives.
 * @param initialHints - Starting number of hints.
 */
export function useQuiz(
  quizData: Question[],
  initialLives = 3,
  initialHints = 1
) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(initialLives);
  const [hintsAvailable, setHintsAvailable] = useState(initialHints);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>(null); // null | 'correct' | 'incorrect'
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; color: string }>({ message: "", color: "" });
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [resultsTitle, setResultsTitle] = useState("");
  const [resultsMessage, setResultsMessage] = useState("");
  const [bestScore, setBestScore] = useState(0);

  // Ref to prevent multiple initializations
  const isInitialized = useRef(false);
  // Ref for timeout IDs to allow clearing if needed
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load best score from storage on mount
  useEffect(() => {
    try {
        const savedScore = localStorage.getItem("quizAppBestScore");
        if (savedScore) {
            const parsedScore = parseInt(savedScore, 10);
            if (!isNaN(parsedScore)) {
                setBestScore(parsedScore);
            } else {
                 console.warn("Invalid best score found in localStorage:", savedScore);
            }
        }
    } catch (error) {
        console.error("Could not read best score from localStorage:", error);
    }
  }, []); // Run only once on mount

  // Start quiz when data is available
  // Using useCallback for startQuiz as it's returned and used in QuizContainer
  const startQuiz = useCallback(() => {
    console.log("Starting/Restarting quiz...");
    // Clear any pending timeouts from previous state
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }

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
    isInitialized.current = true;
  }, [initialHints, initialLives]); // Depend on initial values

  // Effect to initialize quiz once data is ready
   useEffect(() => {
       if (quizData && quizData.length > 0 && !isInitialized.current) {
           startQuiz();
       }
   }, [quizData, startQuiz]); // Rerun if quizData changes or startQuiz identity changes


  // --- Core Quiz Logic ---

  const endQuiz = useCallback((completed: boolean, message: string = "Game Over!") => {
    if(isQuizOver) return; // Prevent multiple calls

    setIsQuizOver(true);
    // Clear any pending timeouts
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }

    // Update best score if current score is higher
    let finalMessage = "";
    if (score > bestScore) {
        setBestScore(score);
        try {
            localStorage.setItem("quizAppBestScore", score.toString());
            finalMessage = "New high score! "; // Add to message below
        } catch (error) {
            console.error("Could not save best score to localStorage:", error);
        }
    }

    if (completed) {
        setResultsTitle("Quiz Complete!");
        let msg = "Congratulations! You've answered all questions.";
        const maxScore = (quizData?.length || 0) * SCORE_INCREMENT;
        if (maxScore > 0) { // Avoid division by zero
             if (score >= maxScore * 0.8) msg += " Excellent work!";
             else if (score >= maxScore * 0.5) msg += " Good job!";
             else msg += " Keep practicing!";
        }
        setResultsMessage(finalMessage + msg);
    } else {
        setResultsTitle(message); // e.g., "Out of time!" - passed from caller
        setResultsMessage(finalMessage + "Better luck next time!");
    }
  }, [isQuizOver, score, bestScore, quizData]); // Dependencies for endQuiz logic

  const nextQuestion = useCallback(() => {
     // Clear existing timeout if moving manually or quickly
      if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
      }

     // Check if it was the last question
     if (currentQuestionIndex + 1 >= quizData.length) {
          endQuiz(true, "You've completed the quiz!"); // Quiz ends successfully
     } else {
          // Move to the next question: Reset relevant states
          setAnswerStatus(null);
          setSelectedOption(null);
          setDisabledOptions([]); // Reset hints for the new question
          setFeedback({ message: "", color: "" });
          setCurrentQuestionIndex((prev) => prev + 1);
     }
  }, [currentQuestionIndex, quizData, endQuiz]);

  const handleCorrectAnswer = useCallback(() => {
    setScore((prev) => prev + SCORE_INCREMENT);
    setFeedback({ message: "Correct!", color: "text-emerald-600" });
    // Schedule moving to the next question
    timeoutRef.current = setTimeout(nextQuestion, FEEDBACK_DISPLAY_TIME_MS);
  }, [nextQuestion]); // Depends on nextQuestion identity

  const handleIncorrectAnswer = useCallback((correctAnswer: string) => {
    // Decrement life, ensuring it doesn't go below 0
    setLives((prev) => Math.max(0, prev - 1));

    // Set feedback message
    const message = correctAnswer === "N/A - Time Ran Out"
      ? "Time's up!"
      : `Incorrect! The correct answer was ${correctAnswer}`;
    setFeedback({ message: message, color: "text-red-600" });

    // Schedule moving to the next question (lives don't end the quiz anymore)
    timeoutRef.current = setTimeout(nextQuestion, FEEDBACK_DISPLAY_TIME_MS);
  }, [nextQuestion]); // Depends on nextQuestion identity

  const selectAnswer = useCallback((option: string) => {
    // Prevent action if already answered, quiz is over, or no question data
    if (answerStatus !== null || isQuizOver || !quizData || quizData.length === 0) return;

    const currentQuestion = quizData[currentQuestionIndex];
    if (!currentQuestion) return; // Safety check

    const isCorrect = option === currentQuestion.correctAnswer;

    setSelectedOption(option);
    setAnswerStatus(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleIncorrectAnswer(currentQuestion.correctAnswer);
    }
  }, [answerStatus, isQuizOver, quizData, currentQuestionIndex, handleCorrectAnswer, handleIncorrectAnswer]);

  const useHint = useCallback(() => {
    // Prevent hint if none available, quiz over, already answered, or no question/options
    const currentQuestion = quizData[currentQuestionIndex];
    if (hintsAvailable <= 0 || isQuizOver || answerStatus !== null || !currentQuestion || !Array.isArray(currentQuestion.options)) return;

    const options = currentQuestion.options as string[];
    const availableIncorrectOptions = options.filter(
      (opt) =>
        opt !== currentQuestion.correctAnswer && !disabledOptions.includes(opt)
    );

    // Only allow hint if there are at least 2 incorrect options to remove from
    // (leaving the correct answer and at least one incorrect choice)
    if (availableIncorrectOptions.length >= 1 && (options.length - disabledOptions.length) > 2) {
       // Randomly select one incorrect option to disable
       const randomIndex = Math.floor(Math.random() * availableIncorrectOptions.length);
       const optionToDisable = availableIncorrectOptions[randomIndex];

       setDisabledOptions((prev) => [...prev, optionToDisable]);
       setHintsAvailable((prev) => prev - 1);
       setFeedback({
            message: `Hint used! ${currentQuestion.explanation || 'An incorrect option was removed.'}`,
            color: "text-blue-600",
       });
    } else {
         setFeedback({
            message: "Hint cannot remove more options.", // Provide feedback if hint can't be used
            color: "text-orange-600",
         });
    }
  }, [hintsAvailable, isQuizOver, answerStatus, quizData, currentQuestionIndex, disabledOptions]);


  // Return state and actions
  return {
    currentQuestionIndex,
    score,
    lives, // Still useful for display
    hintsAvailable,
    answerStatus,
    selectedOption,
    disabledOptions,
    feedback,
    isQuizOver,
    resultsTitle,
    resultsMessage,
    bestScore,
    // Return memoized functions for stable identities
    startQuiz,
    selectAnswer,
    nextQuestion, // Returned in case needed externally, though primarily used internally
    useHint,
    endQuiz, // Returned in case needed externally
    handleIncorrectAnswer, // Returned for use in timeout handler
  };
}