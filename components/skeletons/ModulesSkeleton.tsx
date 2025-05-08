import { FC } from 'react';

interface ModulesSkeletonProps {
  count?: number;
}

const ModulesSkeleton: FC<ModulesSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
          <div className="h-36 bg-gray-200 dark:bg-gray-700"></div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-4"></div>
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModulesSkeleton;