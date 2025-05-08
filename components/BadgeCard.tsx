// components/BadgeCard.tsx

import React from 'react';

interface BadgeCardProps {
    badge: {
        id: number;
        name: string;
        imageUrl?: string; // Example
        description: string;
    };
}

export function BadgeCard({ badge }: BadgeCardProps) {
    // Implement the UI for a single badge
    // This is a minimal placeholder
    return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            {/* Add badge image/icon */}
             <div className="w-12 h-12 mx-auto bg-gray-300 dark:bg-gray-600 rounded-full mb-2">
                 {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 text-xl font-semibold">
                        🏆
                    </div>
                )}
             </div>
            <div className="font-medium text-sm">{badge.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.description}</div>
        </div>
    );
}