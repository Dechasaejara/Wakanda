// components/skeletons.tsx

// Minimal placeholder components for loading states

export function ModulesSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
}

export function LeaderboardSkeleton() {
     return (
        <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
             <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
}

export function ChallengesSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
}

export function ProgressSkeleton() {
     return (
        <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
             <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
}

export function ModuleDetailSkeleton() {
     return (
        <div className="space-y-6 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
             <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
             <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
}

export function LessonDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
    );
}

export function ChallengeDetailSkeleton() {
     return (
        <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
             <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
    );
}

export const ModuleListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 dark:bg-gray-700 rounded-xl p-5 shadow-sm animate-pulse"
        >
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      ))}
    </div>
  );
};