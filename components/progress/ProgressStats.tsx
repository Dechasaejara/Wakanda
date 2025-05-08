import { ProgressStat } from '@/components/ProgressStat';
import { UserProgressSummary } from '@/types';

interface ProgressStatsProps {
  progress: UserProgressSummary | null;
}

export function ProgressStats({ progress }: ProgressStatsProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Overall Progress</h2>
      <div className="grid grid-cols-2 gap-4">
        <ProgressStat 
          title="Total Modules"
          value={`${progress?.completedModules || 0}/${progress?.totalModules || 0}`}
          bgColor="bg-indigo-50 dark:bg-indigo-900/30"
          textColor="text-indigo-700 dark:text-indigo-300"
        />
        <ProgressStat
          title="Total Lessons"
          value={`${progress?.completedLessons || 0}/${progress?.totalLessons || 0}`}
          bgColor="bg-green-50 dark:bg-green-900/30"
          textColor="text-green-700 dark:text-green-300"
        />
        <ProgressStat
          title="Points Earned"
          value={`${progress?.totalPoints || 0}`}
          bgColor="bg-amber-50 dark:bg-amber-900/30"
          textColor="text-amber-700 dark:text-amber-300"
        />
        <ProgressStat
          title="Correct Answers"
          value={`${progress?.correctAnswers || 0}/${progress?.totalQuestions || 0}`}
          bgColor="bg-purple-50 dark:bg-purple-900/30"
          textColor="text-purple-700 dark:text-purple-300"
        />
      </div>
    </section>
  );
}