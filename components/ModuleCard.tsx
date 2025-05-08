// components/ModuleCard.tsx

import React from 'react';
import Link from 'next/link'; // Assuming you use Next.js Link

interface ModuleCardProps {
    module: {
        id: string;
        title: string;
        description: string;
        status?: 'inProgress' | 'completed' | 'locked'; // Example status
        progress?: number; // Example progress percentage
    };
}

export function ModuleCard({ module }: ModuleCardProps) {
    // Implement the actual Module Card UI here
    // This is a minimal placeholder
    return (
        <Link href={`/modules/${module.id}`} className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-lg font-semibold mb-1">{module.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{module.description}</p>
            {/* Add progress bar, status indicator, etc. based on module data */}
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Status: {module.status || 'Not Started'}
                {module.status === 'inProgress' && module.progress !== undefined && ` (${module.progress}%)`}
            </div>
        </Link>
    );
}