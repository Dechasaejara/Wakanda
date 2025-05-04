"use client";

import React, { useEffect, useMemo, useCallback, useState } from "react";
import Header from "./Header";
import ProgressBar from "./ProgressBar";
import Options from "./Options";
import ResultsScreen from "./ResultsScreen";
import { useQuiz } from "./hooks/useQuiz";
import { useTimer } from "./hooks/useTimer";
import { Question, InUser, InProfile } from "@/backend/db/schema";
import { useAppContext } from "@/components/layout/navigation";

interface FilteredQuestions {
  subject: string;
  gradeLevel: string;
  difficulty: string;
  unit: string;
  totalQuestions: number;
  topic: string;
}

interface QuizContainerProps {
  questions: Question[];
  quiz: FilteredQuestions;
}

const DEFAULT_TIME_LIMIT = 20;

const QuizContainer: React.FC<QuizContainerProps> = ({ questions, quiz }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppContext();
  const telegramUser = user?.initDataUnsafe?.user;

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
    handleIncorrectAnswer,
  } = useQuiz(filteredQuestions);

  const currentQuestion = useMemo(
    () => filteredQuestions[currentQuestionIndex] || null,
    [filteredQuestions, currentQuestionIndex]
  );

  const timeLimit = useMemo(
    () => currentQuestion?.timeLimit || DEFAULT_TIME_LIMIT,
    [currentQuestion]
  );

  const { timeLeft, startTimer, stopTimer } = useTimer(timeLimit, () => {
    if (!isQuizOver) {
      handleIncorrectAnswer("Time Ran Out");
    }
  });

  // Post user progress to API
  const postUserProgress = useCallback(async () => {
    if (!telegramUser?.id) return;

    try {
      const progressData = {
        userId: telegramUser.id,
        subject: quiz.subject,
        gradeLevel: quiz.gradeLevel,
        difficulty: quiz.difficulty,
        topic: quiz.topic,
        unit: quiz.unit,
        totalQuestions: quiz.totalQuestions,
        correctAnswers: score / 10, // Assuming 10 points per correct answer
        score,
        timeSpent: timeLimit * currentQuestionIndex,
        completed: true,
        completedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/userProgress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        console.error("Failed to post user progress:", await response.json());
      }
    } catch (error) {
      console.error("Error posting user progress:", error);
    }
  }, [telegramUser, quiz, score, timeLimit, currentQuestionIndex]);

  // Post user profile to API
  const postProfile = useCallback(async (userId: number) => {
    try {
      const profile: InProfile = {
        userId,
        firstName: telegramUser?.first_name || "",
        lastName: telegramUser?.last_name || "",
      };

      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        console.error("Failed to post user profile:", await response.json());
      }
    } catch (error) {
      console.error("Error posting user profile:", error);
    }
  }, [telegramUser]);

  // Post user data to API
  const postUser = useCallback(async () => {
    if (!telegramUser?.id) return;

    try {
      const userdata: InUser = {
        code: telegramUser.id.toString(),
        username: telegramUser.username || "Guest",
        userImage: telegramUser.photo_url || "",
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userdata),
      });

      if (!response.ok) {
        console.error("Failed to post user:", await response.json());
      } else {
        await postProfile(telegramUser.id);
      }
    } catch (error) {
      console.error("Error posting user:", error);
    }
  }, [telegramUser, postProfile]);

  // Check if user exists in the database
  const checkUserExists = useCallback(async () => {
    if (!telegramUser?.id) return;

    try {
      const response = await fetch(`/api/user/${telegramUser.id}`);
      if (!response.ok) {
        await postUser();
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  }, [telegramUser, postUser]);

  // Start the quiz
  const handleStartQuiz = useCallback(() => {
    if (questions.length === 0) return;

    setIsLoading(true);
    setFilteredQuestions(questions);
    setQuizStarted(true);
    startQuiz();
    setIsLoading(false);
  }, [questions, startQuiz]);

  // Restart the quiz
  const handleRestartQuiz = useCallback(() => {
    postUserProgress();
    setQuizStarted(false);
    setIsLoading(true);
    setTimeout(() => {
      handleStartQuiz();
    }, 0);
  }, [postUserProgress, handleStartQuiz]);

  // Manage timer and quiz state
  useEffect(() => {
    if (isQuizOver) {
      stopTimer();
      postUserProgress();
      return;
    }

    if (answerStatus === null && currentQuestion && !isLoading) {
      startTimer(currentQuestion.timeLimit || DEFAULT_TIME_LIMIT);
    } else {
      stopTimer();
    }
  }, [isQuizOver, answerStatus, currentQuestion, startTimer, stopTimer, postUserProgress, isLoading]);

  // Render start screen
  const renderStartScreen = () => (
    <div className="flex justify-center min-h-screen p-4 font-sans bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to Start the Quiz?
        </h2>
        <p className="text-gray-600 mb-6">
          Click the button below to begin your quiz journey!
        </p>
        <button
          onClick={handleStartQuiz}
          disabled={questions.length === 0}
          className={`px-6 py-3 rounded-lg font-bold shadow-md transition-all duration-200 ${
            questions.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          }`}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );

  // Render loading or no questions screen
  const renderLoadingScreen = () => (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto text-center text-gray-600">
        {isLoading ? "Loading quiz..." : "No questions available."}
      </div>
    </div>
  );

  // Render quiz content
  const renderQuizContent = () => (
    <div className="flex justify-center min-h-screen p-4 w-full font-sans bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out">
        <Header
          score={score}
          lives={lives}
          timeLeft={timeLeft}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={filteredQuestions.length}
        />
        <ProgressBar
          progress={
            isQuizOver && resultsTitle === "Quiz Complete!"
              ? 100
              : (currentQuestionIndex / filteredQuestions.length) * 100
          }
          isFailed={isQuizOver && lives <= 0}
        />
        {!isQuizOver && currentQuestion ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-5 text-center text-gray-700">
              {`${currentQuestion.id}. ${currentQuestion.question}`}
            </h2>
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
            <div className="mt-5 text-center flex gap-4 items-center justify-center">
              <button
                onClick={useHint}
                disabled={hintsAvailable <= 0}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  hintsAvailable <= 0
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
            user={telegramUser?.id || 0}
            finalScore={score}
            bestScore={bestScore}
            title={resultsTitle}
            message={resultsMessage}
            restartQuiz={handleRestartQuiz}
          />
        )}
        {feedback.message && !isQuizOver && (
          <div
            className={`text-center my-3 p-2 rounded-md font-semibold ${
              feedback.color === "text-red-600"
                ? "bg-red-100 text-red-600"
                : feedback.color === "text-emerald-600"
                ? "bg-green-100 text-emerald-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );

  // Initial user check
  useEffect(() => {
    if (!quizStarted) {
      checkUserExists();
    }
  }, [quizStarted, checkUserExists]);

  if (!quizStarted) {
    return renderStartScreen();
  }

  if (!currentQuestion && !isQuizOver) {
    return renderLoadingScreen();
  }

  return renderQuizContent();
};

export default QuizContainer;