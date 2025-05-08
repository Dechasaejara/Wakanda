// components/ActivityItem.tsx

import React from 'react';

interface ActivityItemProps {
    activity: {
        type: 'module_completed' | 'lesson_completed' | 'challenge_completed' | 'badge_earned' | 'points_earned'; // Example types
        description: string;
        timestamp: string; // Or Date object
        // Add other relevant data (e.g., points earned, item name)
    };
}

export function ActivityItem({ activity }: ActivityItemProps) {
    // Implement the UI for a single activity item
    // This is a minimal placeholder
    const getIcon = (type: string) => {
        switch (type) {
            case 'module_completed': return '📚';
            case 'lesson_completed': return '📖';
            case 'challenge_completed': return '🔥';
            case 'badge_earned': return '🏅';
            case 'points_earned': return '✨';
            default: return '紀錄';
        }
    }

    const formatTimestamp = (timestamp: string) => {
        // Simple formatting, use a library like date-fns or moment for robust handling
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-shrink-0 text-xl mr-3">{getIcon(activity.type)}</div>
            <div className="flex-grow">
                <div className="text-gray-800 dark:text-gray-200">{activity.description}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimestamp(activity.timestamp)}</div>
            </div>
        </div>
    );
}