"use client"; // This component might need client-side interactivity (button clicks)

import React from 'react';

interface QuizResultsProps {
    score: {
        correct: number;
        total: number;
        percentage: number;
    };
    onRetry: () => void;
    onFinish: () => void;
}

export function QuizResults({ score, onRetry, onFinish }: QuizResultsProps) {
    // Implement the UI for displaying quiz results
    // This is a minimal placeholder
    const resultColor = score.percentage >= 70 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm space-y-4">
            <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
            <div className="text-4xl font-bold">
                <span className={resultColor}>{score.correct}</span> / {score.total}
            </div>
            <div className={`text-lg font-semibold ${resultColor}`}>
                Score: {score.percentage}%
            </div>

            <div className="flex justify-center space-x-4 mt-6">
                <button
                    onClick={onRetry}
                    className="px-6 py-3 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                >
                    Retry Quiz
                </button>
                <button
                    onClick={onFinish}
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 font-semibold"
                >
                    Finish
                </button>
            </div>
        </div>
    );
}