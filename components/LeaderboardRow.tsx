// components/LeaderboardRow.tsx

import React from "react";

interface LeaderboardRowProps {
  rank: number;
  user: {
    id: number;
    name: string;
    points: number;
    avatarUrl?: string; // Example
  };
}

export function LeaderboardRow({ rank, user }: LeaderboardRowProps) {
  // Implement the row UI for the rest of the leaderboard
  // This is a minimal placeholder
  return (
    <div className="flex items-center p-4 last:border-b-0">
      <div className="w-10 text-center font-semibold text-gray-700 dark:text-gray-300 mr-4">
        {rank}
      </div>
      {/* Add user avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-3 overflow-hidden">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-semibold">
            {user.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-grow font-medium">{user.name}</div>
      <div className="font-semibold text-indigo-600 dark:text-indigo-300">
        {user.points} pts
      </div>
    </div>
  );
}
