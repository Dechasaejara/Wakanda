"use client";
import React, { useEffect, useMemo, useCallback } from "react";
// Assuming components exist at these paths - adjust if necessary
import Header from "./Header";
import ProgressBar from "./ProgressBar";
import Options from "./Options";
import ResultsScreen from "./ResultsScreen";
import QuestionTitle from "./Question";
// Hooks and Types
import { useQuiz } from "./hooks/useQuiz";
import { useTimer } from "./hooks/useTimer";
import { Question } from "@/backend/db/schema";

interface QuizContainerProps {
  questions: Question[];
}

const DEFAULT_TIME_LIMIT = 20; // Default time per question if not specified

const QuizContainer = ({ questions }: QuizContainerProps) => {
  const {
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
    // Actions (already memoized by useQuiz hook where beneficial)
    startQuiz,
    selectAnswer,
    useHint,
    endQuiz, // Keep endQuiz if needed (e.g., for explicit quit button later)
    handleIncorrectAnswer,
  } = useQuiz(questions);

  // Memoize current question object
  const currentQuestion = useMemo(() => {
      if (!questions || questions.length === 0 || currentQuestionIndex >= questions.length) {
          return null; // Handle cases where questions are not ready or index is out of bounds
      }
      return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  // Define the timeout handler using useCallback
  const handleTimeout = useCallback(() => {
      // Ensure quiz is not over and handleIncorrectAnswer is available
      if (!isQuizOver && handleIncorrectAnswer) {
            // Trigger incorrect answer logic, providing context
            handleIncorrectAnswer("N/A - Time Ran Out");
      }
  }, [isQuizOver, handleIncorrectAnswer]); // Depends on these states/functions

  // Determine time limit for the current question
  const timeLimit = useMemo(() => currentQuestion?.timeLimit || DEFAULT_TIME_LIMIT, [currentQuestion]);

  // Initialize timer hook
  const { timeLeft, startTimer, stopTimer } = useTimer(
      timeLimit, // Initial time based on the first question's limit
      handleTimeout // Pass the memoized timeout handler
  );

  // Effect to manage the timer state based on quiz progression
  useEffect(() => {
    // Stop timer immediately if quiz is over
    if (isQuizOver) {
        stopTimer();
        return; // Exit effect early
    }

    // If ready for a new question (no answer selected yet)
    if (answerStatus === null && currentQuestion) {
      // Start timer with the specific time limit for the *current* question
      startTimer(currentQuestion.timeLimit || DEFAULT_TIME_LIMIT);
    } else {
      // Stop timer if an answer has been selected (or question isn't ready)
      stopTimer();
    }

    // Return cleanup function to stop timer if dependencies change or component unmounts
    // Note: startTimer/stopTimer are stable due to useCallback in useTimer
    // currentQuestion dependency ensures timer restarts with potentially new limit
  }, [isQuizOver, answerStatus, currentQuestion, startTimer, stopTimer]);


  // Memoize progress calculation
  const progress = useMemo(() => {
      if (!questions || questions.length === 0) return 0;
      // Progress represents completed questions
      return (currentQuestionIndex / questions.length) * 100;
  }, [currentQuestionIndex, questions]);

  // Memoize hint disabled state calculation
  const isHintDisabled = useMemo(() => {
    // Disable if no hints, quiz over, answer selected, or cannot remove more options
    if (hintsAvailable <= 0 || isQuizOver || answerStatus !== null || !currentQuestion?.options) return true;

    const options = Array.isArray(currentQuestion.options) ? currentQuestion.options.map(String) : [];
    const availableOptions = options.filter(opt => !disabledOptions.includes(opt));
    // Disable hint if only 2 options (correct + 1 incorrect) are left active
    return availableOptions.length <= 2;
  }, [hintsAvailable, isQuizOver, answerStatus, currentQuestion?.options, disabledOptions]);


  // --- Rendering Logic ---

  // Loading or No Questions State
  if (!currentQuestion && !isQuizOver) {
     // Show generic loading/waiting state if quiz isn't over but question isn't ready
     // (Could happen briefly between questions or if initial load fails)
    return (
      <div className="flex justify-center items-center min-h-screen p-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto text-center text-gray-600">
          {(!questions || questions.length === 0) ? "No questions available." : "Loading quiz..."}
        </div>
      </div>
    );
  }

  // Main Quiz UI
  return (
    <div
      className="flex justify-center items-center min-h-screen p-4 font-sans" // Added font-sans
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out">
        {/* Pass memoized callbacks where necessary if Header/ProgressBar are memoized */}
        <Header
          score={score}
          lives={lives} // Display lives remaining
          timeLeft={timeLeft}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions?.length || 0}
        />
        <ProgressBar
           // Show 100% only on successful completion
           progress={isQuizOver && resultsTitle === "Quiz Complete!" ? 100 : progress}
           // Indicate failure visually if quiz ended and lives were 0 (optional)
           isFailed={isQuizOver && lives <= 0}
        />

        {/* Display Feedback Messages */}
         {feedback.message && !isQuizOver && ( // Show feedback only during the quiz
              <div className={`text-center my-3 p-2 rounded-md font-semibold ${feedback.color === 'text-red-600' ? 'bg-red-100' : feedback.color === 'text-emerald-600' ? 'bg-green-100' : 'bg-blue-100'} ${feedback.color}`}>
                  {feedback.message}
              </div>
          )}

        {/* Conditional Rendering: Quiz Active vs. Results Screen */}
        {!isQuizOver && currentQuestion ? (
          <div className="mt-4">
            <QuestionTitle question={currentQuestion.question} />
            {/* Assuming Options is memoized, pass memoized selectAnswer */}
            <Options
              options={Array.isArray(currentQuestion.options) ? currentQuestion.options.map(String) : []}
              selectAnswer={selectAnswer} // selectAnswer is memoized in useQuiz
              answerStatus={answerStatus}
              selectedOption={selectedOption}
              correctAnswer={currentQuestion.correctAnswer}
              disabledOptions={disabledOptions}
            />
            <div className="mt-5 text-center">
                 {/* Assuming Hint Button uses useHint directly */}
                 <button
                      onClick={useHint} // useHint is memoized in useQuiz
                      disabled={isHintDisabled}
                      aria-label={`Use Hint (${hintsAvailable} left)`}
                      className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isHintDisabled
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 focus:ring-yellow-400'
                      }`}
                  >
                      Use Hint ({hintsAvailable} left)
                  </button>
            </div>
          </div>
        ) : (
          // Assuming ResultsScreen is memoized, pass memoized startQuiz
          <ResultsScreen
            finalScore={score}
            bestScore={bestScore}
            title={resultsTitle}
            message={resultsMessage}
            restartQuiz={startQuiz} // startQuiz is memoized in useQuiz
          />
        )}
      </div>
    </div>
  );
};

export default QuizContainer;