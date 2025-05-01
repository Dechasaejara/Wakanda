// ResultsScreen.tsx
import React from 'react';
  
interface ResultsScreenProps {
  finalScore: number;
  bestScore: number;
  title: string;
  message: string;
  restartQuiz: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ finalScore, bestScore, title, message, restartQuiz }) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4 text-indigo-700">{title}</h2>
      <p className="text-xl mb-2">Your final score is:</p>
      <p className="text-4xl font-extrabold text-purple-600 mb-4">{finalScore}</p>
      <p className="text-md mb-6 text-gray-500">Your best score: <span className="font-semibold">{bestScore}</span></p>
      <p className="text-lg mb-6 text-gray-600">{message}</p>
      <button
        onClick={restartQuiz}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out text-lg"
      >
        Play Again?
      </button>
    </div>
  );
};

export default ResultsScreen;