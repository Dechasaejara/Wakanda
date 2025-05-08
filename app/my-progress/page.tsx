import { db } from "@/backend/db/drizzle";
import { Badges, UserProgress } from "@/backend/db/schema";
import { ActivitySection } from "@/components/progress/ActivitySection";
import { BadgesSection } from "@/components/progress/BadgesSection";
import { Header } from "@/components/progress/Header";
import { ProgressStats } from "@/components/progress/ProgressStats";
import { UserProgressSummary, Badge } from "@/types";


export default async function ProgressPage() {
  const badges = await db.select().from(Badges);
const progress = await db.select().from (UserProgress);
  return (
    <div className="space-y-6">
      <Header />
      {/* <ProgressStats progress={progress[0]} /> */}
      <BadgesSection badges={badges} />
      {/* <ActivitySection progress={progress} /> */}
    </div>
  );
}
