import { Badge } from '@/backend/db/schema';
import { BadgeCard } from '@/components/BadgeCard';

interface BadgesSectionProps {
  badges: Badge[];
}

export function BadgesSection({ badges }: BadgesSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Badges Earned</h2>
      {badges.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No badges earned yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Complete challenges to earn badges
          </p>
        </div>
      )}
    </section>
  );
}