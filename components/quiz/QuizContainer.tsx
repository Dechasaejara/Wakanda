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

// Icon imports
import {
  PlayCircleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { BASE_URL } from "@/utils/formatters";

interface FilteredQuestions {
  subject?: string;
  gradeLevel?: string;
  difficulty?: string;
  unit?: string;
  totalQuestions: number;
  topic?: string;
}

interface QuizContainerProps {
  questions: Question[];
  quiz: FilteredQuestions;
}

const DEFAULT_TIME_LIMIT = 20; // seconds

const QuizContainer: React.FC<QuizContainerProps> = ({ questions, quiz }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showingHint, setShowingHint] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
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
    if (!isQuizOver && quizStarted) {
      handleIncorrectAnswer("Time Ran Out");
    }
  });

  // Calculate time progress percentage
  const timeProgress = useMemo(() => {
    if (!timeLimit) return 100;
    return (timeLeft / timeLimit) * 100;
  }, [timeLeft, timeLimit]);

  // Get API base URL safely
  const getApiUrl = useCallback((endpoint: string) => {
    const baseUrl = BASE_URL || "";
    return `${baseUrl}/api/${endpoint}`.replace(/\/+/g, "/").replace(/^\/api/, "/api");
  }, []);

  // API call functions
  const postUserProgress = useCallback(async () => {
    if (!telegramUser?.id || !quizStarted) return;
    setApiError(null);

    try {
      const userId = telegramUser.id;
      const progressData = {
        userCode: userId.toString(),
        subject: quiz.subject === "All" ? undefined : quiz.subject,
        gradeLevel: quiz.gradeLevel === "All" ? undefined : quiz.gradeLevel,
        difficulty: quiz.difficulty === "All" ? undefined : quiz.difficulty,
        topic: quiz.topic === "All" ? undefined : quiz.topic,
        unit: quiz.unit === "All" ? undefined : quiz.unit,
        totalQuestions: quiz.totalQuestions,
        correctAnswers: score,
        score,
        timeSpent: timeLimit * (currentQuestionIndex + 1),
        completed: resultsTitle === "Quiz Complete!",
        completedAt: new Date().toISOString(),
      };

      const response = await fetch(getApiUrl("user-progress"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Failed to post user progress:", errorData);
        setApiError("Failed to save progress. Please try again.");
      }
    } catch (error) {
      console.error("Error posting user progress:", error);
      setApiError("An error occurred while saving progress.");
    }
  }, [
    telegramUser,
    quiz,
    score,
    timeLimit,
    currentQuestionIndex,
    quizStarted,
    resultsTitle,
    getApiUrl,
  ]);

  const postProfile = useCallback(
    async (userId: string) => {
      if (!telegramUser) return;

      try {
        const profile: InProfile = {
          userId: parseInt(userId, 10),
          firstName: telegramUser.first_name || "",
          lastName: telegramUser.last_name || "",
        };

        const response = await fetch(getApiUrl("profiles"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
          console.error("Failed to post user profile:", errorData);
          setApiError("Failed to create user profile.");
        }
      } catch (error) {
        console.error("Error posting user profile:", error);
        setApiError("An error occurred while creating user profile.");
      }
    },
    [telegramUser, getApiUrl]
  );

  const postUser = useCallback(async () => {
    if (!telegramUser?.id) return;

    try {
      const userId = telegramUser.id.toString();
      const userData: InUser = {
        code: userId,
        username: telegramUser.username || "Guest",
        userImage: telegramUser.photo_url || "",
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(getApiUrl("users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Failed to post user:", errorData);
        setApiError("Failed to create user.");
      } else {
        await postProfile(userId);
      }
    } catch (error) {
      console.error("Error posting user:", error);
      setApiError("An error occurred while creating user.");
    }
  }, [telegramUser, postProfile, getApiUrl]);

  const checkUserExists = useCallback(async () => {
    if (!telegramUser?.id) {
      setIsLoading(false);
      return;
    }

    const userId = telegramUser.id.toString();
    try {
      const response = await fetch(getApiUrl(`users/${userId}`));
      if (!response.ok) {
        await postUser();
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setApiError("An error occurred while checking user.");
    } finally {
      if (questions.length > 0) setIsLoading(false);
    }
  }, [telegramUser, postUser, questions.length, getApiUrl]);

  const handleStartQuiz = useCallback(() => {
    if (questions.length === 0) {
      console.log("No questions to start quiz.");
      setIsLoading(false);
      return;
    }

    setApiError(null);
    setIsLoading(true);

    // Filter questions based on quiz criteria
    const filtered = questions.filter((q) => {
      return (
        (!quiz.subject || q.subject === quiz.subject) &&
        (!quiz.gradeLevel || q.gradeLevel === quiz.gradeLevel) &&
        (!quiz.difficulty || q.difficulty === quiz.difficulty) &&
        (!quiz.unit || q.unit === quiz.unit) &&
        (!quiz.topic || q.topic === quiz.topic)
      );
    });

    setFilteredQuestions(filtered);
    startQuiz();
    setQuizStarted(true);
    setIsLoading(false);
  }, [questions, quiz, startQuiz]);

  const handleRestartQuiz = useCallback(() => {
    if (isQuizOver) postUserProgress();

    setApiError(null);
    setIsLoading(true);
    setQuizStarted(false);

    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [isQuizOver, postUserProgress]);

  const handleHintClick = useCallback(() => {
    if (hintsAvailable <= 0 || selectedOption) return;

    setShowingHint(true);
    useHint();
  }, [useHint, hintsAvailable, selectedOption]);

  useEffect(() => {
    if (!quizStarted) {
      checkUserExists();
    }
  }, [quizStarted, checkUserExists]);

  useEffect(() => {
    if (isQuizOver) {
      stopTimer();
      postUserProgress();
      return;
    }

    if (quizStarted && !isLoading && currentQuestion && answerStatus === null) {
      startTimer(currentQuestion.timeLimit || DEFAULT_TIME_LIMIT);
    } else {
      stopTimer();
    }
  }, [
    isQuizOver,
    quizStarted,
    isLoading,
    currentQuestion,
    answerStatus,
    startTimer,
    stopTimer,
    postUserProgress,
  ]);

  // Add font styles (unchanged from original)
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.8; }
        50% { opacity: 0.4; }
        100% { transform: scale(1.2); opacity: 0; }
      }
      @keyframes slide-in-bottom {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes scale-in {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-pulse-ring:before {
        content: '';
        position: absolute;
        inset: -5px;
        border-radius: inherit;
        background: currentColor;
        opacity: 0.3;
        z-index: -1;
        animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
      }
      .animate-slide-in-bottom {
        animation: slide-in-bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .animate-scale-in {
        animation: scale-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
      }
      @keyframes timer-warn {
        0%, 100% { background-color: rgb(245, 158, 11); }
        50% { background-color: rgb(252, 211, 77); }
      }
      .animate-timer-warn {
        animation: timer-warn 1s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const renderStartScreen = () => (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-4 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-8 border border-slate-100 dark:border-slate-700 animate-scale-in">
        <div className="relative inline-block mx-auto">
          <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-25 animate-pulse"></div>
          <PlayCircleIcon className="h-24 w-24 text-teal-500 dark:text-teal-400 relative animate-pulse-ring" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">
          Ready to Challenge Yourself?
        </h2>

        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-md mx-auto">
          You have {questions.length} question
          {questions.length === 1 ? "" : "s"} waiting. Let's see how well you do!
        </p>

        <button
          onClick={handleStartQuiz}
          disabled={questions.length === 0 || isLoading}
          className={`w-full py-3 sm:py-4 px-6 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            questions.length === 0 || isLoading
              ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              : "bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 dark:shadow-teal-600/20"
          }`}
        >
          {isLoading ? (
            <span className="inline-flex items-center">
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              Preparing...
            </span>
          ) : (
            <span className="inline-flex items-center">
              <PlayCircleIcon className="h-5 w-5 mr-2" />
              Start Quiz
            </span>
          )}
        </button>

        {questions.length === 0 && !isLoading && (
          <p className="text-sm text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg">
            No questions available for this selection. Please try different filters.
          </p>
        )}

        {apiError && (
          <div className="mt-4 p-3 text-sm bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{apiError}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLoadingScreen = () => (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-4 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-slate-100 dark:border-slate-700 animate-pulse">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-teal-500 dark:border-teal-400 border-l-transparent animate-spin"></div>
        </div>
        <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
          {isLoading && !quizStarted && questions.length > 0
            ? "Preparing your quiz..."
            : isLoading
            ? "Loading..."
            : "No questions available."}
        </p>
      </div>
    </div>
  );

  const renderQuizContent = () => (
    <div className="py-4 px-4 sm:px-6 animate-slide-in-bottom">
      <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700">
        <div className="space-y-4 sm:space-y-6">
          <Header
            score={score}
            lives={lives}
            timeLeft={timeLeft}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={filteredQuestions.length}
          />

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>
                Question {currentQuestionIndex + 1} of {filteredQuestions.length}
              </span>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span
                  className={`font-medium ${
                    timeLeft < 5 ? "text-amber-500 dark:text-amber-400" : ""
                  }`}
                >
                  {timeLeft}s left
                </span>
              </div>
            </div>

            <ProgressBar
              progress={
                (isQuizOver && resultsTitle === "Quiz Complete!") ||
                (currentQuestionIndex + 1 >= filteredQuestions.length && feedback.message)
                  ? 100
                  : ((currentQuestionIndex + 1) / filteredQuestions.length) * 100
              }
              isFailed={isQuizOver && lives <= 0}
            />

            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeProgress > 50
                    ? "bg-teal-500 dark:bg-teal-400"
                    : timeProgress > 25
                    ? "bg-amber-500 dark:bg-amber-400"
                    : "bg-rose-500 dark:bg-rose-400 animate-timer-warn"
                }`}
                style={{ width: `${timeProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {!isQuizOver && currentQuestion ? (
          <div className="space-y-6 mt-6 sm:mt-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white text-center font-heading leading-relaxed">
              {currentQuestion.question}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={handleHintClick}
                disabled={hintsAvailable <= 0 || !!selectedOption}
                className={`relative flex items-center justify-center py-2.5 sm:py-3 px-4 rounded-xl text-sm font-semibold transition-all
                  ${
                    hintsAvailable <= 0 || !!selectedOption
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      : "bg-amber-400 hover:bg-amber-500 text-amber-900 shadow hover:shadow-amber-200/50 hover:-translate-y-0.5 active:translate-y-0"
                  }`}
              >
                <LightBulbIcon className="h-5 w-5 mr-2" />
                <span>Use Hint {hintsAvailable > 0 && `(${hintsAvailable})`}</span>
                {hintsAvailable > 0 && !selectedOption && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {hintsAvailable}
                  </span>
                )}
              </button>

              <button
                onClick={handleRestartQuiz}
                className="flex items-center justify-center py-2.5 sm:py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Restart Quiz
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
            className={`mt-6 p-4 rounded-xl font-medium flex items-center gap-3 animate-scale-in
              ${
                feedback.type === "error"
                  ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30"
                  : feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30"
              }`}
          >
            {feedback.type === "error" ? (
              <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-800/30 flex items-center justify-center flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
            ) : feedback.type === "success" ? (
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {showingHint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 max-w-md w-full animate-scale-in shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  Hint
                </h3>
                <button
                  onClick={() => setShowingHint(false)}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-800 dark:text-amber-300 border border-amber-100 dark:border-amber-800/30">
                <p>
                  One or more options have been disabled. Choose wisely from the remaining options!
                </p>
              </div>
              <button
                onClick={() => setShowingHint(false)}
                className="w-full mt-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading && !quizStarted && questions.length === 0 && !telegramUser?.id) {
    return renderLoadingScreen();
  }

  if (!quizStarted) {
    return renderStartScreen();
  }

  if (isLoading || (!currentQuestion && !isQuizOver)) {
    return renderLoadingScreen();
  }

  return renderQuizContent();
};

export default QuizContainer;