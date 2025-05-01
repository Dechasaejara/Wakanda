"use client";
import React, { useEffect, useMemo } from "react";
import Header from "./Header";
import ProgressBar from "./ProgressBar";
import Options from "./Options";
import ResultsScreen from "./ResultsScreen";
import { useQuiz } from "./hooks/useQuiz";
import { useTimer } from "./hooks/useTimer";
import { Question } from "@/backend/db/schema";
import QuestionTitle from "./Question";

interface QuizContainerProps {
  questions: Question[];
}

const QuizContainer = ({ questions }: QuizContainerProps) => {
  // Handle the case where questions are empty or undefined
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center text-red-500">No questions available.</div>
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
  } = useQuiz(questions);

  const currentQuestion = questions[currentQuestionIndex];

  const { timeLeft, startTimer, stopTimer } = useTimer(
    currentQuestion?.timeLimit || 20,
    () => {
      if (lives - 1 <= 0) {
        endQuiz(false, "Out of time and lives!");
      } else {
        nextQuestion();
      }
    }
  );

  // Manage the timer based on quiz state
  useEffect(() => {
    if (!isQuizOver && answerStatus === null) {
      startTimer();
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [isQuizOver, answerStatus, startTimer, stopTimer]);

  // Handle the case where currentQuestion is undefined
  if (!currentQuestion) {
    return (
      <div className="text-center text-red-500">Invalid question index.</div>
    );
  }

  const progress = useMemo(
    () => (currentQuestionIndex / questions.length) * 100,
    [currentQuestionIndex, questions.length]
  );

  // Helper function to determine if the hint button should be disabled
  const isHintDisabled = useMemo(() => {
    if (hintsAvailable <= 0 || !currentQuestion?.options) return true;

    const options = Array.isArray(currentQuestion.options)
      ? currentQuestion.options.map(String)
      : [];

    const availableOptions = options.filter(
      (opt) => !disabledOptions.includes(opt)
    );

    return availableOptions.length <= 2;
  }, [hintsAvailable, currentQuestion?.options, disabledOptions]);

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
          progress={isQuizOver ? 100 : progress}
          isFailed={isQuizOver && lives <= 0}
        />
        {!isQuizOver ? (
          <div>
            <QuestionTitle question={currentQuestion.question} />
            <Options
              options={currentQuestion.options as string[]}
              selectAnswer={selectAnswer}
              answerStatus={answerStatus}
              selectedOption={selectedOption}
              correctAnswer={currentQuestion.correctAnswer}
              disabledOptions={disabledOptions}
            />
          </div>
        ) : (
          <ResultsScreen
            finalScore={score}
            bestScore={bestScore}
            title={resultsTitle}
            message={resultsMessage}
            restartQuiz={startQuiz}
          />
        )}
      </div>
    </div>
  );
};

export default QuizContainer;