"use client";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import Header from "./Header";
import ProgressBar from "./ProgressBar";
import Options from "./Options";
import ResultsScreen from "./ResultsScreen";
import QuestionTitle from "./Question";
import { useQuiz } from "./hooks/useQuiz";
import { useTimer } from "./hooks/useTimer";
import { Question } from "@/backend/db/schema";

interface QuizContainerProps {
  questions: Question[];
}

const DEFAULT_TIME_LIMIT = 20;

const QuizContainer = ({ questions }: QuizContainerProps) => {
  const [quizStarted, setQuizStarted] = useState(false); // Track if the quiz has started
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]); // Store filtered questions

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
    startQuiz,
    selectAnswer,
    useHint,
    endQuiz,
    handleIncorrectAnswer,
  } = useQuiz(filteredQuestions);

  const currentQuestion = useMemo(() => {
    if (
      !filteredQuestions ||
      filteredQuestions.length === 0 ||
      currentQuestionIndex >= filteredQuestions.length
    ) {
      return null;
    }
    return filteredQuestions[currentQuestionIndex];
  }, [filteredQuestions, currentQuestionIndex]);

  const handleTimeout = useCallback(() => {
    if (!isQuizOver && handleIncorrectAnswer) {
      handleIncorrectAnswer("N/A - Time Ran Out");
    }
  }, [isQuizOver, handleIncorrectAnswer]);

  const timeLimit = useMemo(
    () => currentQuestion?.timeLimit || DEFAULT_TIME_LIMIT,
    [currentQuestion]
  );

  const { timeLeft, startTimer, stopTimer } = useTimer(
    timeLimit,
    handleTimeout
  );

  useEffect(() => {
    if (isQuizOver) {
      stopTimer();
      return;
    }

    if (answerStatus === null && currentQuestion) {
      startTimer(currentQuestion.timeLimit || DEFAULT_TIME_LIMIT);
    } else {
      stopTimer();
    }
  }, [isQuizOver, answerStatus, currentQuestion, startTimer, stopTimer]);

  const progress = useMemo(() => {
    if (!filteredQuestions || filteredQuestions.length === 0) return 0;
    return (currentQuestionIndex / filteredQuestions.length) * 100;
  }, [currentQuestionIndex, filteredQuestions]);

  const isHintDisabled = useMemo(() => {
    if (
      hintsAvailable <= 0 ||
      isQuizOver ||
      answerStatus !== null ||
      !currentQuestion?.options
    )
      return true;

    const options = Array.isArray(currentQuestion.options)
      ? currentQuestion.options.map(String)
      : [];
    const availableOptions = options.filter(
      (opt) => !disabledOptions.includes(opt)
    );
    return availableOptions.length <= 2;
  }, [
    hintsAvailable,
    isQuizOver,
    answerStatus,
    currentQuestion?.options,
    disabledOptions,
  ]);

  const handleStartQuiz = () => {
    if (questions.length > 0) {
      setFilteredQuestions(questions); // Use all questions or filtered ones
      setQuizStarted(true); // Mark quiz as started
      startQuiz(); // Initialize the quiz state
    }
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false); // Reset the quizStarted state
    setTimeout(() => {
      handleStartQuiz(); // Restart the quiz after resetting
    }, 0); // Ensure state resets before restarting
  };

  // --- Rendering Logic ---

  // Show Start Screen if Quiz Hasn't Started
  if (!quizStarted) {
    return (
      <div
        className="flex justify-center items-center min-h-screen p-4 font-sans"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Start the Quiz?
          </h2>
          <p className="text-gray-600 mb-6">
            Click the button below to begin your quiz journey!
          </p>
          <button
            onClick={handleStartQuiz}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Loading or No Questions State
  if (!currentQuestion && !isQuizOver) {
    return (
      <div
        className="flex justify-center items-center min-h-screen p-4"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto text-center text-gray-600">
          {!filteredQuestions || filteredQuestions.length === 0
            ? "No questions available."
            : "Loading quiz..."}
        </div>
      </div>
    );
  }

  // Main Quiz UI
  return (
    <div
      className="flex justify-center  min-h-screen p-4 w-full font-sans"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out ">
        {/* Header */}
        <Header
          score={score}
          lives={lives}
          timeLeft={timeLeft}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={filteredQuestions?.length || 0}
        />

        {/* Progress Bar */}
        <ProgressBar
          progress={
            isQuizOver && resultsTitle === "Quiz Complete!" ? 100 : progress
          }
          isFailed={isQuizOver && lives <= 0}
        />

        {/* Feedback Messages */}
        {feedback.message && !isQuizOver && (
          <div
            className={`text-center my-3 p-2 rounded-md font-semibold ${
              feedback.color === "text-red-600"
                ? "bg-red-100"
                : feedback.color === "text-emerald-600"
                ? "bg-green-100"
                : "bg-blue-100"
            } ${feedback.color}`}
          >
            {feedback.message}
          </div>
        )}

        {/* Conditional Rendering: Quiz Active vs. Results Screen */}
        {!isQuizOver && currentQuestion ? (
          <div className="mt-2 flex flex-col items-center justify-between">
            <QuestionTitle question={currentQuestion.question} />
            <Options
              options={
                Array.isArray(currentQuestion.options)
                  ? currentQuestion.options.map(String)
                  : []
              }
              selectAnswer={selectAnswer}
              answerStatus={answerStatus}
              selectedOption={selectedOption}
              correctAnswer={currentQuestion.correctAnswer}
              disabledOptions={disabledOptions}
            />
            <div className=" m-auto mt-5 text-center flex gap-4 items-center">
              <button
                onClick={useHint}
                disabled={isHintDisabled}
                aria-label={`Use Hint (${hintsAvailable} left)`}
                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isHintDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 focus:ring-yellow-400"
                }`}
              >
                Use Hint ({hintsAvailable} left)
              </button>
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Restart Quiz
              </button>
            </div>
          </div>
        ) : (
          <ResultsScreen
            finalScore={score}
            bestScore={bestScore}
            title={resultsTitle}
            message={resultsMessage}
            restartQuiz={handleRestartQuiz}
          />
        )}
      </div>
    </div>
  );
};

export default QuizContainer;
