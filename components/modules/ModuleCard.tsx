import { FC } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SparklesIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Module } from '@/types';

interface ModuleCardProps {
  module: Module;
}

const ModuleCard: FC<ModuleCardProps> = ({ module }) => {
  const router = useRouter();
  
  // Calculate progress percentage
  const progressPercent = module.completedLessons !== undefined && module.totalLessons !== undefined
    ? Math.round((module.completedLessons / module.totalLessons) * 100)
    : 0;
  
  const isLocked = module.requiredPoints > 0 && module.isUnlocked === false;
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
        isLocked ? "opacity-80 cursor-not-allowed" : "hover:shadow-md hover:translate-y-[-2px] active:translate-y-[0px] active:shadow-sm cursor-pointer"
      }`}
      onClick={() => !isLocked && router.push(`/modules/${module.id}`)}
    >
      <div className="relative h-36 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800">
        {module.imageUrl && (
          <Image 
            src={module.imageUrl} 
            alt={module.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
        )}
        
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white/20 p-3 rounded-full">
              <LockClosedIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-1">{module.title}</h3>
          
          {module.level && (
            <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded">
              Level {module.level}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {module.description}
        </p>
        
        {isLocked ? (
          <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
            <SparklesIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{module.requiredPoints} points required to unlock</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{module.completedLessons || 0}/{module.totalLessons || 0} lessons</span>
              <span>{progressPercent}% complete</span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleCard;