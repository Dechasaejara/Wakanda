import React from "react";

interface HeaderProps {
  score: number;
  lives: number;
  timeLeft: number;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const Header: React.FC<HeaderProps> = ({
  score,
  lives,
  timeLeft,
  currentQuestionIndex,
  totalQuestions,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold text-indigo-600">Score: {score}</div>
        <div className="flex items-center gap-1 text-red-500">
          {Array.from({ length: 3 }, (_, i) => (
            <i
              key={i}
              className={`fas fa-heart ${
                i < lives ? "text-red-500" : "text-gray-300"
              } ${lives === 1 && i === 0 ? "heart-animation" : ""}`}
            ></i>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-indigo-100 px-3 py-1 rounded-full">
        <i className="fas fa-clock text-indigo-600"></i>
        <div
          className={`text-lg font-semibold text-indigo-600 ${
            timeLeft <= 5 ? "text-red-500 font-bold animate-pulse" : ""
          }`}
        >
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}
        </div>
      </div>
      <div className="text-lg font-semibold text-indigo-600">
        Question: {currentQuestionIndex + 1}/{totalQuestions}
      </div>
    </div>
  );
};

export default Header;