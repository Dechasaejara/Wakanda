"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "@/components/layout/navigation";
import { LessonCard } from "@/components/LessonCard";
import { ModuleDetailSkeleton } from "@/components/Skeletons";
import { Lesson, Module } from "@/types";

interface ModuleDetailPageProps {
  params: { id: string };
}

export default function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const id = params.id;
  const router = useRouter();
  const { showError } = useAppContext();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        setIsLoading(true);
        // In real app, replace with actual API calls
        const [moduleRes, lessonsRes] = await Promise.all([
          fetch(`/api/modules/${id}`),
          fetch(`/api/modules/${id}/lessons`)
        ]);
        
        if (!moduleRes.ok || !lessonsRes.ok) {
          throw new Error("Failed to fetch module details");
        }
        
        const moduleData = await moduleRes.json();
        const lessonsData = await lessonsRes.json();
        
        setModule(moduleData);
        setLessons(lessonsData);
      } catch (error) {
        console.error("Failed to fetch module details:", error);
        showError("Failed to load module details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModuleDetails();
  }, [id]);

  if (isLoading) {
    return <ModuleDetailSkeleton />;
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-xl text-gray-600 dark:text-gray-400">Module not found</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module header with background image */}
      <header 
        className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 shadow-sm"
        style={{
          backgroundImage: module.imageUrl ? `url(${module.imageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '200px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
        <div className="relative h-full p-6 flex flex-col justify-end z-10">
          <div className="text-sm font-medium text-blue-200 mb-1">Module {module.order || module.level}</div>
          <h1 className="text-2xl font-bold mb-2 text-white">{module.title}</h1>
          <p className="text-blue-100 mb-4 line-clamp-2">{module.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-white">
            <div className="flex items-center">
              <BookOpenIcon className="w-4 h-4 mr-1" />
              <span>{lessons.length} Lessons</span>
            </div>
            <div className="flex items-center">
              <SparklesIcon className="w-4 h-4 mr-1" />
              <span>{module.requiredPoints} Points</span>
            </div>
          </div>
        </div>
      </header>

      {/* Description section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">About this Module</h2>
        <p className="text-gray-700 dark:text-gray-300">{module.description}</p>
      </section>

      {/* Lessons list */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold px-1">Lessons</h2>
        
        {lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <LessonCard 
                key={lesson.id}
                lesson={lesson}
                isCompleted={lesson.isCompleted}
                isLocked={lesson.isLocked}
                order={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400">No lessons available for this module</p>
          </div>
        )}
      </section>
    </div>
  );
}