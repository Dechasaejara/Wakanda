"use client"; // This component might need client-side interactivity (button clicks)

import React from 'react';

interface QuestionCardProps {
    question: {
        id: string | number;
        question: string;
        options: string[];
        // correctAnswer: string; // Not needed for display, but used in scoring
    };
    selectedAnswer: string | undefined;
    onAnswerSelect: (answer: string) => void;
}

export function QuestionCard({ question, selectedAnswer, onAnswerSelect }: QuestionCardProps) {
    // Implement the UI for a single question and its options
    // This is a minimal placeholder
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h2 className="font-medium text-lg mb-4">{question.question}</h2>

            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onAnswerSelect(option)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                            selectedAnswer === option
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-2 border-indigo-500 dark:border-indigo-400"
                            : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                        }`}
                         disabled={selectedAnswer !== undefined} // Disable after selecting an answer (optional)
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}