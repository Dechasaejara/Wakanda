import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ChevronRightIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { getDifficultyLabel } from '@/utils/formatters';
import { Lesson } from '@/types';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted?: boolean;
  isLocked?: boolean;
  order: number;
}

const LessonCard: FC<LessonCardProps> = ({ 
  lesson, 
  isCompleted = false, 
  isLocked = false, 
  order 
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (!isLocked) {
      router.push(`/lessons/${lesson.id}`);
    }
  };
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
        isLocked 
          ? "opacity-80 cursor-not-allowed" 
          : "hover:shadow-md hover:translate-y-[-2px] active:translate-y-[0px] active:shadow-sm cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isCompleted ? (
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isLocked
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-indigo-100 dark:bg-indigo-900/30"
              }`}>
                <span className={`text-base font-medium ${
                  isLocked
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-indigo-600 dark:text-indigo-400"
                }`}>{order}</span>
              </div>
            )}
            
            <div>
              <h3 className="font-medium line-clamp-1">{lesson.title}</h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span>{lesson.completionTime} min</span>
                <span className="mx-1">•</span>
                <span>{getDifficultyLabel(lesson.difficulty)}</span>
              </div>
            </div>
          </div>
          
          {isLocked ? (
            <LockClosedIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <div className="flex items-center text-indigo-600 dark:text-indigo-400">
              <span className="mr-1">{lesson.points} pts</span>
              <ChevronRightIcon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonCard;