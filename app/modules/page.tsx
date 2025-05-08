"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/layout/navigation";
import { ModuleCard } from "@/components/ModuleCard";
import { ModuleListSkeleton } from "@/components/Skeletons";
import { Module } from "@/types";

export default function ModulesPage() {
  const router = useRouter();
  const { showError } = useAppContext();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/modules`);

        if (!response.ok) {
          throw new Error("Failed to fetch modules");
        }

        const modulesData = await response.json();
        setModules(modulesData);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
        showError("Failed to load modules. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (isLoading) {
    return <ModuleListSkeleton />;
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No modules available
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Modules</h1>
        <p className="text-blue-100">
          Explore and complete modules to earn points and badges
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold px-1">Available Modules</h2>

        {modules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400">
              No modules available
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
