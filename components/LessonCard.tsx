// components/LessonCard.tsx

import React from 'react';
import Link from 'next/link'; // Assuming Next.js Link
import { CheckCircleIcon, ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline';

// Add LockClosedIcon to components/icons.tsx
/*
export function LockClosedIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    );
}
*/


interface LessonCardProps {
    lesson: {
        id: string;
        title: string;
        description: string;
        completionTime: number; // Example
        // Add other lesson properties
    };
    isCompleted: boolean;
    isLocked: boolean;
    order: number;
}

export function LessonCard({ lesson, isCompleted, isLocked, order }: LessonCardProps) {
    // Implement the UI for a single lesson card within a module
    // This is a minimal placeholder
     const cardClasses = isLocked
        ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer";

    const titleClasses = isLocked
        ? "text-gray-500 dark:text-gray-400"
        : "text-gray-800 dark:text-gray-200";

    return (
        <Link
            href={isLocked ? '#' : `/lessons/${lesson.id}`} // Disable link if locked
            className={`flex items-center p-4 rounded-lg shadow-sm transition-colors ${cardClasses}`}
            aria-disabled={isLocked}
            onClick={(e) => isLocked && e.preventDefault()} // Prevent navigation if locked
        >
            <div className="flex-shrink-0 w-10 text-center mr-4">
                {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                ) : isLocked ? (
                    <LockClosedIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                ) : (
                    <div className="w-6 h-6 flex items-center justify-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {order}
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <h3 className={`font-medium ${titleClasses}`}>{lesson.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lesson.description}</p>
            </div>
            {!isLocked && (
                 <div className="flex-shrink-0 ml-4 text-sm text-gray-500 dark:text-gray-400">
                     <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{lesson.completionTime} mins</span>
                    </div>
                 </div>
            )}
        </Link>
    );
}