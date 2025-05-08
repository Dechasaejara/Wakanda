"use client"; // This component might need client-side interactivity (button clicks)

import { SparklesIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface ChallengeResultsProps {
    score: {
        correct: number;
        total: number;
        percentage: number;
        points: number; // Points earned in the challenge
    };
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    onRetry: () => void;
    onFinish: () => void;
}

export function ChallengeResults({ score, difficulty, onRetry, onFinish }: ChallengeResultsProps) {
    // Implement the UI for displaying challenge results
    // This is a minimal placeholder
    const resultColor = score.percentage >= 70 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm space-y-4">
            <h2 className="text-2xl font-bold mb-2">Challenge Completed!</h2>
            <div className="text-4xl font-bold">
                 <span className={resultColor}>{score.correct}</span> / {score.total}
            </div>
            <div className={`text-lg font-semibold ${resultColor}`}>
                Accuracy: {score.percentage}%
            </div>

            {score.points > 0 && (
                <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-300 font-semibold text-xl">
                    <SparklesIcon className="w-6 h-6 mr-2" />
                    You earned {score.points} points!
                </div>
            )}


            <div className="flex justify-center space-x-4 mt-6">
                <button
                    onClick={onRetry}
                    className="px-6 py-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                >
                    Retry Challenge
                </button>
                <button
                    onClick={onFinish}
                    className="px-6 py-3 rounded-lg bg-orange-600 text-white dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800 font-semibold"
                >
                    Finish
                </button>
            </div>
        </div>
    );
}