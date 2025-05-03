"use client";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import Header from "./Header";
import ProgressBar from "./ProgressBar";
import Options from "./Options";
import ResultsScreen from "./ResultsScreen";
import { useQuiz } from "./hooks/useQuiz";
import { useTimer } from "./hooks/useTimer";
import { Question } from "@/backend/db/schema";
import { useAppContext } from "@/components/layout/navigation";

interface filteredQuestions {
  subject: string;
  gradeLevel: string;
  difficulty: string;
  unit: string;
  totalQuestions: number;
  topic: string;
}
interface QuizContainerProps {
  questions: Question[];
  quiz: filteredQuestions;
}

const DEFAULT_TIME_LIMIT = 20;

const QuizContainer = ({ questions, quiz }: QuizContainerProps) => {
  const [quizStarted, setQuizStarted] = useState(false); // Track if the quiz has started
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]); // Store filtered questions
  const user = useAppContext().user; // Assuming you have a context to get user data

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

  // useEffect(() => {
  //   if (isQuizOver) {

  //     stopTimer();
  //     return;
  //   }

  //   if (answerStatus === null && currentQuestion) {
  //     startTimer(currentQuestion.timeLimit || DEFAULT_TIME_LIMIT);
  //   } else {
  //     stopTimer();
  //   }
  // }, [isQuizOver, answerStatus, currentQuestion, startTimer, stopTimer]);

  useEffect(() => {
    const postUserProgress = async () => {
      try {
        const progressData = {
          userId: user?.initDataUnsafe.user?.id || 0,
          subject: quiz.subject,
          gradeLevel: quiz.gradeLevel,
          difficulty: quiz.difficulty,
          topic: quiz.topic,
          unit: quiz.unit,
          totalQuestions: quiz.totalQuestions,
          correctAnswers: score / 10, // Assuming each correct answer gives 10 points
          score,
          timeSpent: timeLimit * currentQuestionIndex, // Example: total time spent
          completed: true,
          completedAt: new Date().toISOString(),
        };

        const response = await fetch("/api/userProgress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(progressData),
        });

        if (!response.ok) {
          console.error("Failed to post user progress:", await response.json());
        }
      } catch (error) {
        console.error("Error posting user progress:", error);
      }
    };

    if (isQuizOver) {
      stopTimer();
      postUserProgress(); // Post user progress when the quiz is over
      return;
    }

    if (answerStatus === null && currentQuestion) {
      startTimer(currentQuestion.timeLimit || DEFAULT_TIME_LIMIT);
    } else {
      stopTimer();
    }
  }, [
    isQuizOver,
    answerStatus,
    currentQuestion,
    startTimer,
    stopTimer,
    user,
    quiz,
    score,
    timeLimit,
    currentQuestionIndex,
  ]);

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
        className="flex justify-center  min-h-screen p-1 font-sans"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm p-2 sm:p-1 rounded-xl shadow-2xl w-full max-w-2xl mx-auto text-center">
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
      <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-2 rounded-xl shadow-2xl w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out ">
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

        {/* Conditional Rendering: Quiz Active vs. Results Screen */}
        {!isQuizOver && currentQuestion ? (
          <div className="mt-2 flex flex-col items-center justify-between">
            <h2 className="text-xl font-semibold mb-5 text-center text-gray-700">{`${currentQuestion.id}. ${currentQuestion.question}`}</h2>
            ;
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
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isHintDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 focus:ring-yellow-400"
                }`}
              >
                Hint ({hintsAvailable} left)
              </button>
              <button
                onClick={handleRestartQuiz}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Restart
              </button>
            </div>
          </div>
        ) : (
          <ResultsScreen
            user={user?.initDataUnsafe?.user?.id || 0}
            finalScore={score}
            bestScore={bestScore}
            title={resultsTitle}
            message={resultsMessage}
            restartQuiz={handleRestartQuiz}
          />
        )}

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
      </div>
    </div>
  );
};

export default QuizContainer;
