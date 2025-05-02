"use client";
import React, { useEffect, useMemo, useCallback } from "react";
import Header from "./Header"; // Assuming component exists
import ProgressBar from "./ProgressBar"; // Assuming component exists
import Options from "./Options"; // Assuming component exists
import ResultsScreen from "./ResultsScreen"; // Assuming component exists
import { useQuiz } from "./hooks/useQuiz";
import { useTimer } from "./hooks/useTimer";
import { Question } from "@/backend/db/schema"; // Assuming schema exists
import QuestionTitle from "./Question"; // Assuming component exists

interface QuizContainerProps {
  questions: Question[];
}

const QuizContainer = ({ questions }: QuizContainerProps) => {
  // Initial loading state or handle empty questions properly
  if (!questions || questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
         <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto">
            <div className="text-center text-gray-600">Loading questions or no questions available...</div>
         </div>
      </div>
    );
  }

  const {
    currentQuestionIndex,
    score,
    lives,
    hintsAvailable,
    answerStatus,
    selectedOption,
    disabledOptions,
    feedback, // Get feedback from useQuiz
    isQuizOver,
    resultsTitle,
    resultsMessage,
    handleIncorrectAnswer,
    bestScore,
    startQuiz,
    selectAnswer,
    nextQuestion,
    useHint,
    endQuiz,
  } = useQuiz(questions); // Pass questions here

  // Memoize currentQuestion to prevent unnecessary recalculations
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  // Define the timeout callback using useCallback
  const handleTimeout = useCallback(() => {
      // Check lives *before* calling endQuiz or nextQuestion
      if (lives - 1 <= 0) {
          if (!isQuizOver) { // Prevent calling endQuiz multiple times
              endQuiz(false, "Out of time and lives!");
          }
      } else {
           // Deduct a life when time runs out for a question
           // Note: useQuiz's handleIncorrectAnswer already deducts a life,
           // so we might need a specific state update or function for time out
           // For now, just move to next question, life deduction happens in handleIncorrectAnswer implicitly if called
           // OR explicitly call a function to deduct life due to time out.
           // Let's assume running out of time forces an incorrect answer scenario
           // This might require adjusting useQuiz logic slightly, or pass a flag
           console.log("Time out, moving to next question.");
           // Simulate an incorrect answer due to time out
           selectAnswer(""); // Pass an empty string or a specific value to indicate timeout? Needs careful handling in useQuiz.
           // OR, more directly:
           // setLives(prev => prev -1); // Deduct life directly?
           // nextQuestion(); // Then move on
           // The safest way without altering useQuiz heavily: treat timeout as failure for the question
           if (!isQuizOver) { // Ensure quiz isn't already over
                handleIncorrectAnswer("N/A - Time Ran Out"); // Use existing logic, pass a specific message
           }
      }
  }, [lives, endQuiz, nextQuestion, isQuizOver, handleIncorrectAnswer]); // Add dependencies


  // Get the time limit for the current question, default to 20
  const timeLimit = currentQuestion?.timeLimit || 20;

  const { timeLeft, startTimer, stopTimer } = useTimer(
      timeLimit, // Initial time based on the first question
      handleTimeout // Pass the memoized callback
  );

  // Manage the timer based on quiz state and question changes
  useEffect(() => {
    if (isQuizOver) {
        stopTimer(); // Stop timer if quiz is over
    } else if (answerStatus === null && currentQuestion) {
      // --- FIX START ---
      // Start timer with the specific time limit for the CURRENT question
      startTimer(currentQuestion.timeLimit || 20);
      // --- FIX END ---
    } else {
      // Stop timer if an answer has been selected but quiz not over
      stopTimer();
    }

    // Cleanup function to stop timer if component unmounts or dependencies change
    return stopTimer;
    // --- FIX START ---
    // Add dependencies: isQuizOver, answerStatus, currentQuestionIndex, startTimer, stopTimer
    // Adding currentQuestionIndex ensures timer restarts for new question
    // Adding startTimer/stopTimer based on ESLint recommendation for hook dependencies
  }, [isQuizOver, answerStatus, currentQuestionIndex, currentQuestion, startTimer, stopTimer]); // Use currentQuestion directly
  // --- FIX END ---

  // Handle potential case where currentQuestion is momentarily undefined during state transitions
  if (!currentQuestion) {
     // Can show a loading state or return null briefly
     return (
       <div className="flex justify-center items-center min-h-screen p-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto">
             <div className="text-center text-gray-600">Loading next question...</div>
          </div>
       </div>
     );
  }


  const progress = useMemo(
    // Calculate progress based on the *next* index to show progress for completed questions
    () => ((currentQuestionIndex) / questions.length) * 100,
    [currentQuestionIndex, questions.length]
  );

  // Determine if hint should be disabled
  const isHintDisabled = useMemo(() => {
    if (hintsAvailable <= 0 || !currentQuestion?.options || answerStatus !== null) return true;

    const options = Array.isArray(currentQuestion.options) ? currentQuestion.options.map(String) : [];
    const availableOptions = options.filter(opt => !disabledOptions.includes(opt));

    // Disable hint if only 2 options (correct + 1 incorrect) are left
    return availableOptions.length <= 2;
  }, [hintsAvailable, currentQuestion?.options, disabledOptions, answerStatus]);

  return (
    <div
      className="flex justify-center items-center min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out">
        <Header
          score={score}
          lives={lives}
          timeLeft={timeLeft}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />
        <ProgressBar
          // Show 100% progress only when quiz is successfully completed, otherwise base on index
           progress={isQuizOver && resultsTitle === "Quiz Complete!" ? 100 : progress}
           isFailed={isQuizOver && lives <= 0} // Indicate failure if quiz over and no lives
        />

        {/* Feedback Area */}
         {feedback.message && (
              <div className={`text-center my-2 font-semibold ${feedback.color}`}>
                  {feedback.message}
              </div>
          )}


        {!isQuizOver ? (
          <div className="mt-4"> {/* Add margin top */}
            <QuestionTitle question={currentQuestion.question} />
            <Options
              // Ensure options are always string[] for the component
              options={Array.isArray(currentQuestion.options) ? currentQuestion.options.map(String) : []}
              selectAnswer={selectAnswer}
              answerStatus={answerStatus}
              selectedOption={selectedOption}
              correctAnswer={currentQuestion.correctAnswer}
              disabledOptions={disabledOptions} // Pass disabled options
            />
            {/* --- FIX START: Add Hint Button --- */}
            <div className="mt-4 text-center"> {/* Add margin top and center */}
                 <button
                      onClick={useHint}
                      disabled={isHintDisabled}
                      className={`px-4 py-2 rounded font-semibold transition-colors duration-200 ease-in-out ${
                          isHintDisabled
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                      }`}
                  >
                      Use Hint ({hintsAvailable} left)
                  </button>
            </div>
            {/* --- FIX END --- */}
          </div>
        ) : (
          <ResultsScreen
            finalScore={score}
            bestScore={bestScore}
            title={resultsTitle}
            message={resultsMessage}
            restartQuiz={startQuiz} // Use startQuiz to restart
          />
        )}
      </div>
    </div>
  );
};

export default QuizContainer;