"use client";

import { useAppContext } from "@/components/layout/navigation";
import { LeaderboardPodium } from "@/components/LeaderboardPodium";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import FilterTabs from "@/components/quiz/FilterTabs";
import ModulesSkeleton from "@/components/skeletons/ModulesSkeleton";
import { LeaderboardEntry } from "@/types";
import { BASE_URL } from "@/utils/formatters";
import { useState, useEffect } from "react";


export default function LeaderboardPage() {
  const { showError } = useAppContext();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("weekly");

  const timeframeOptions = [
    { id: "weekly", label: "This Week" },
    { id: "monthly", label: "This Month" },
    { id: "allTime", label: "All Time" }
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        // In real app, replace with actual API call
        const response = await fetch(`${BASE_URL}/api/leaderboard?timeframe=${timeframe}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        
        const data = await response.json();
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        showError("Failed to load leaderboard. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe, showError]);

  return (
    <div className="space-y-6">
      <header className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          See who's leading the pack in learning achievements!
        </p>
        
        <FilterTabs 
          options={timeframeOptions}
          activeId={timeframe}
          onChange={setTimeframe}
        />
      </header>

      {isLoading ? (
        <ModulesSkeleton />
      ) : (
        <>
          {/* Top 3 users podium */}
          {leaderboard.length > 2 && (
            <section className="grid grid-cols-3 gap-3">
              {/* 2nd place */}
              <div className="col-start-1 pt-8">
                <LeaderboardPodium 
                  rank={2}
                  user={leaderboard[1]} 
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </div>
              
              {/* 1st place */}
              <div className="col-start-2">
                <LeaderboardPodium 
                  rank={1}
                  user={leaderboard[0]} 
                  className="bg-yellow-100 dark:bg-yellow-900/30"
                />
              </div>
              
              {/* 3rd place */}
              <div className="col-start-3 pt-12">
                <LeaderboardPodium 
                  rank={3} 
                  user={leaderboard[2]} 
                  className="bg-amber-100 dark:bg-amber-900/30"
                />
              </div>
            </section>
          )}

          {/* Full leaderboard list */}
          <section className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
              <h2 className="font-semibold">All Rankings</h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.length > 0 ? (
                // Skip top 3 if we displayed the podium
                leaderboard.slice(leaderboard.length > 3 ? 3 : 0).map((entry, index) => (
                  <LeaderboardRow
                    key={entry.id} 
                    rank={leaderboard.length > 3 ? index + 4 : index + 1} 
                    user={entry} 
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No leaderboard data available</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}