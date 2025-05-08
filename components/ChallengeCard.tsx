// components/ChallengeCard.tsx

import React from 'react';
import Link from 'next/link'; // Assuming you use Next.js Link
import { FireIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getDifficultyLabel } from '@/utils/formatters';


interface ChallengeCardProps {
    challenge: {
        id: number;
        title: string;
        description: string;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        points: number;
        isCompleted?: boolean; // Example status
    };
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
    // Implement the actual Challenge Card UI here
    // This is a minimal placeholder
     const difficultyColors = {
        beginner: 'text-green-600 dark:text-green-300',
        intermediate: 'text-yellow-600 dark:text-yellow-300',
        advanced: 'text-red-600 dark:text-red-300',
    };

    return (
        <Link href={`/challenges/${challenge.id}`} className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-1">{challenge.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{challenge.description}</p>
            <div className="flex items-center justify-between mt-3 text-sm">
                 <div className={`flex items-center ${difficultyColors[challenge.difficulty]}`}>
                    <FireIcon className="w-4 h-4 mr-1" />
                    <span>{getDifficultyLabel(challenge.difficulty)}</span>
                </div>
                 <div className="flex items-center text-yellow-600 dark:text-yellow-300">
                    <SparklesIcon className="w-4 h-4 mr-1" />
                    <span>{challenge.points} pts</span>
                </div>
            </div>
             {challenge.isCompleted && (
                 <div className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">Completed</div>
             )}
        </Link>
    );
}