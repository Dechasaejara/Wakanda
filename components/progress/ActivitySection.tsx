import { ActivityItem } from '@/components/ActivityItem';
import { UserProgressSummary } from '@/types';

interface ActivitySectionProps {
  progress: UserProgressSummary | null;
}

export function ActivitySection({ progress }: ActivitySectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
      {progress?.recentActivities && progress.recentActivities.length > 0 ? (
        <div className="space-y-3">
          {progress.recentActivities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      )}
    </section>
  );
}