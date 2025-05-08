"use client";

import { useState, useEffect } from "react";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "@/components/layout/navigation";
import FilterTabs from "@/components/quiz/FilterTabs";
import { Challenge } from "@/types";
import { ChallengesSkeleton } from "@/components/Skeletons";
import { ChallengeCard } from "@/components/ChallengeCard";

export default function ChallengesPage() {
  const { showError } = useAppContext();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("all");

  const difficultyOptions = [
    { id: "all", label: "All Levels" },
    { id: "beginner", label: "Beginner", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    { id: "intermediate", label: "Intermediate", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    { id: "advanced", label: "Advanced", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" }
  ];

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsLoading(true);
        // In real app, replace with actual API call
        const response = await fetch(`/api/challenges?difficulty=${difficulty}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch challenges");
        }
        
        const data = await response.json();
        setChallenges(data);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
        showError("Failed to load challenges. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [difficulty, showError]);

  return (
    <div className="space-y-6">
      <header className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 rounded-xl p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Challenges</h1>
        <p className="text-amber-100 mb-1">Test your knowledge and earn extra points!</p>
        <div className="flex items-center mt-2">
          <SparklesIcon className="w-5 h-5 text-yellow-300 mr-2" />
          <span className="font-semibold">Earn up to 500 points</span>
        </div>
      </header>

      <FilterTabs 
        options={difficultyOptions}
        activeId={difficulty}
        onChange={setDifficulty}
        containerClassName="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
      />

      <section className="space-y-4">
        {isLoading ? (
          <ChallengesSkeleton  />
        ) : (
          <div className="space-y-4">
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  {difficulty === "all" 
                    ? "No challenges available yet" 
                    : `No ${difficulty} challenges found`}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}