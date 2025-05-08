// components/LeaderboardPodium.tsx

import React from 'react';

interface LeaderboardPodiumProps {
    rank: 1 | 2 | 3;
    user: {
        id: number;
        name?: string;
        points: number;
        avatarUrl?: string; // Example
    };
    className?: string; // For background color classes
}

export function LeaderboardPodium({ rank, user, className }: LeaderboardPodiumProps) {
    // Implement the podium UI for top 3 users
    // This is a minimal placeholder
    const rankColors = {
        1: 'text-yellow-500 dark:text-yellow-300',
        2: 'text-gray-500 dark:text-gray-400',
        3: 'text-amber-500 dark:text-amber-300',
    };

    return (
        <div className={`flex flex-col items-center p-4 rounded-xl text-center ${className}`}>
            <div className={`text-4xl font-bold mb-2 ${rankColors[rank]}`}>
                #{rank}
            </div>
            {/* Add user avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 mb-2 overflow-hidden">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                        {user?.name?.charAt(0)}
                    </div>
                )}
            </div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{user.points} pts</div>
        </div>
    );
}