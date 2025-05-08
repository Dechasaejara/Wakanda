import { FC, useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  timeLimit?: number; // Optional override for question's timeLimit
  showTimer?: boolean; // Whether to show and manage timer
  onTimeUp?: () => void; // Callback when timer expires
}

const QuestionCard: FC<QuestionCardProps> = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect,
  timeLimit,
  showTimer = false,
  onTimeUp
}) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Initialize or reset timer when question changes or timeLimit is provided
  useEffect(() => {
    if (showTimer) {
      const limit = timeLimit !== undefined ? timeLimit : question.timeLimit;
      setTimeLeft(limit);
    }
  }, [question.id, timeLimit, showTimer, question.timeLimit]);
  
  // Timer countdown
  useEffect(() => {
    if (!showTimer || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, showTimer, onTimeUp]);
  
  // Format time as MM:SS
  const formattedTime = timeLeft !== null
    ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
    : '';
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <h2 className="font-medium text-lg">{question.question}</h2>
        
        <div className="flex flex-col items-end">
          {showTimer && timeLeft !== null && (
            <div className={`flex items-center mb-2 ${
              timeLeft < 10 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-600 dark:text-gray-400'
            }`}>
              <ClockIcon className="w-5 h-5 mr-1" />
              <span className="font-medium">{formattedTime}</span>
            </div>
          )}
          
          {question.points > 0 && (
            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full">
              {question.points} pts
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(option)}
            className={`w-full text-left p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900 ${
              selectedAnswer === option
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-200 border-2 border-indigo-500 dark:border-indigo-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            disabled={selectedAnswer !== undefined && selectedAnswer !== option}
            aria-pressed={selectedAnswer === option}
          >
            <div className="flex items-center">
              <span className="flex-grow">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;