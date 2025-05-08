"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Question, DifficultyEnum } from "@/backend/db/schema";
import QuizContainer from "./QuizContainer";
import { useAppContext } from "@/components/layout/navigation";

// Icon imports
import { 
  FunnelIcon, 
  ChevronDownIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface QuizFilterProps {
  allQuestions: Question[];
}

// Helper function to get unique values for dropdowns
const getUniqueValues = (items: Question[] | undefined, key: keyof Question): string[] => {
  if (!items || items.length === 0) return ["All"];
  const values = items
    .map((item) => item[key])
    .filter((value) => value != null && value !== "");
  const uniqueValues = Array.from(new Set(values as string[])).sort();
  return ["All", ...uniqueValues];
};

const QuizFilter = ({ allQuestions }: QuizFilterProps) => {
  const { user } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedUnit, setSelectedUnit] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");
  const [activeFilters, setActiveFilters] = useState<number>(0);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedSubject !== "All") count++;
    if (selectedGradeLevel !== "All") count++;
    if (selectedDifficulty !== "All") count++;
    if (selectedUnit !== "All") count++;
    if (selectedSection !== "All") count++;
    setActiveFilters(count);
  }, [selectedSubject, selectedGradeLevel, selectedDifficulty, selectedUnit, selectedSection]);

  // Reset filters function
  const resetFilters = useCallback(() => {
    setSelectedSubject("All");
    setSelectedGradeLevel("All");
    setSelectedDifficulty("All");
    setSelectedUnit("All");
    setSelectedSection("All");
  }, []);

  // Cascading filters
  const filteredQuestionsBySubject = useMemo(() => {
    if (!allQuestions) return [];
    return selectedSubject === "All"
      ? allQuestions
      : allQuestions.filter((q) => q.subject === selectedSubject);
  }, [allQuestions, selectedSubject]);

  const filteredQuestionsByGrade = useMemo(() => {
    return selectedGradeLevel === "All"
      ? filteredQuestionsBySubject
      : filteredQuestionsBySubject.filter(
          (q) => q.gradeLevel === selectedGradeLevel
        );
  }, [filteredQuestionsBySubject, selectedGradeLevel]);

  const filteredQuestionsByDifficulty = useMemo(() => {
    return selectedDifficulty === "All"
      ? filteredQuestionsByGrade
      : filteredQuestionsByGrade.filter(
          (q) => q.difficulty === selectedDifficulty
        );
  }, [filteredQuestionsByGrade, selectedDifficulty]);

  const filteredQuestionsByUnit = useMemo(() => {
    return selectedUnit === "All"
      ? filteredQuestionsByDifficulty
      : filteredQuestionsByDifficulty.filter((q) => q.unit === selectedUnit);
  }, [filteredQuestionsByDifficulty, selectedUnit]);

  const finalFilteredQuestions = useMemo(() => {
    return selectedSection === "All"
      ? filteredQuestionsByUnit
      : filteredQuestionsByUnit.filter((q) => q.topic === selectedSection);
  }, [filteredQuestionsByUnit, selectedSection]);

  // Memoized options for dropdowns
  const subjects = useMemo(
    () => getUniqueValues(allQuestions, "subject"),
    [allQuestions]
  );
  const gradeLevels = useMemo(
    () => getUniqueValues(filteredQuestionsBySubject, "gradeLevel"),
    [filteredQuestionsBySubject]
  );
  const difficulties = useMemo(
    () => ["All", ...Object.values(DifficultyEnum.enumValues).sort()],
    []
  );
  const units = useMemo(
    () => getUniqueValues(filteredQuestionsByDifficulty, "unit"),
    [filteredQuestionsByDifficulty]
  );
  const sections = useMemo(
    () => getUniqueValues(filteredQuestionsByUnit, "topic"),
    [filteredQuestionsByUnit]
  );

  // Add font and animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-in {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slide-out {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-20px); opacity: 0; }
      }
      @keyframes slide-in-right {
        from { transform: translateX(20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slide-in-left {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse-soft {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .animate-slide-in {
        animation: slide-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .animate-slide-out {
        animation: slide-out 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .animate-slide-in-right {
        animation: slide-in-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .animate-slide-in-left {
        animation: slide-in-left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      .animate-pulse-soft {
        animation: pulse-soft 1.5s ease-in-out infinite;
      }
      
      /* Custom select styles */
      .custom-select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 1.25rem;
        padding-right: 2.5rem;
      }
      
      .dark .custom-select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Component for each filter select group
  interface FilterSelectGroupProps {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    options: string[];
    optionsLabelPrefix?: string;
    id: string;
  }

  const FilterSelectGroup: React.FC<FilterSelectGroupProps> = ({
    label,
    value,
    onChange,
    options,
    optionsLabelPrefix = "All",
    id,
  }) => {
    if (options.length <= 1 && label !== "Difficulty") return null;

    return (
      <div className="w-full animate-slide-in">
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
          {label}
        </label>
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={onChange}
            className="custom-select appearance-none w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition-colors"
            aria-label={`Filter by ${label.toLowerCase()}`}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "All"
                  ? `${optionsLabelPrefix} ${label}`
                  : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 mb-24">
      {/* Filter Toggle Button (Mobile) */}
      <div className="flex justify-between items-center mb-2 lg:hidden px-2">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span>Filters {activeFilters > 0 && `(${activeFilters})`}</span>
        </button>
        
        {activeFilters > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-rose-500 dark:text-rose-400 hover:underline py-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 transition-all duration-300 overflow-hidden ${isFilterOpen ? 'max-h-[1000px]' : 'max-h-[72px] lg:max-h-[1000px]'}`}>
        {/* Filter Header */}
        <div className="flex justify-between items-center p-4 cursor-pointer lg:cursor-default" onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <div className="flex items-center space-x-3">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg">
              <FunnelIcon className="h-5 w-5 text-teal-500 dark:text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white font-heading">
              Question Filters
            </h2>
            {activeFilters > 0 && (
              <span className="inline-flex items-center justify-center bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 text-xs font-medium rounded-full px-2 py-0.5 min-w-[20px]">
                {activeFilters}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {activeFilters > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetFilters();
                }}
                className="hidden lg:block text-sm text-rose-500 dark:text-rose-400 hover:underline"
              >
                Reset Filters
              </button>
            )}
            
            <div className="lg:hidden">
              <ChevronDownIcon className={`h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {user?.initDataUnsafe?.user?.photo_url && (
              <img
                src={user.initDataUnsafe.user.photo_url}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border-2 border-teal-500/30 dark:border-teal-400/30 shadow-sm"
              />
            )}
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="px-4 pb-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FilterSelectGroup
            id="subject-filter"
            label="Subject"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedGradeLevel("All");
              setSelectedDifficulty("All");
              setSelectedUnit("All");
              setSelectedSection("All");
            }}
            options={subjects}
            optionsLabelPrefix="All"
          />

          <FilterSelectGroup
            id="grade-level-filter"
            label="Grade Level"
            value={selectedGradeLevel}
            onChange={(e) => {
              setSelectedGradeLevel(e.target.value);
              setSelectedDifficulty("All");
              setSelectedUnit("All");
              setSelectedSection("All");
            }}
            options={gradeLevels}
            optionsLabelPrefix="All"
          />

          <FilterSelectGroup
            id="difficulty-filter"
            label="Difficulty"
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setSelectedUnit("All");
              setSelectedSection("All");
            }}
            options={difficulties}
            optionsLabelPrefix="All"
          />

          <FilterSelectGroup
            id="unit-filter"
            label="Unit"
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setSelectedSection("All");
            }}
            options={units}
            optionsLabelPrefix="All"
          />

          <FilterSelectGroup
            id="section-filter"
            label="Section"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            options={sections}
            optionsLabelPrefix="All"
          />
        </div>
        
        {/* Active Filters Pills */}
        {activeFilters > 0 && (
          <div className="px-4 pb-4 flex flex-wrap gap-2 animate-slide-in">
            {selectedSubject !== "All" && (
              <div className="inline-flex items-center bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full px-3 py-1 text-sm">
                <span>{selectedSubject}</span>
                <button 
                  onClick={() => setSelectedSubject("All")}
                  className="ml-1 p-0.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-800"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            {selectedGradeLevel !== "All" && (
              <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-sm">
                <span>Grade: {selectedGradeLevel}</span>
                <button 
                  onClick={() => setSelectedGradeLevel("All")}
                  className="ml-1 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            {selectedDifficulty !== "All" && (
              <div className="inline-flex items-center bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-3 py-1 text-sm">
                <span>{selectedDifficulty}</span>
                <button 
                  onClick={() => setSelectedDifficulty("All")}
                  className="ml-1 p-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-800"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            {selectedUnit !== "All" && (
              <div className="inline-flex items-center bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-3 py-1 text-sm">
                <span>Unit: {selectedUnit}</span>
                <button 
                  onClick={() => setSelectedUnit("All")}
                  className="ml-1 p-0.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            {selectedSection !== "All" && (
              <div className="inline-flex items-center bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full px-3 py-1 text-sm">
                <span>Section: {selectedSection}</span>
                <button 
                  onClick={() => setSelectedSection("All")}
                  className="ml-1 p-0.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-800"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Questions Count Indicator */}
      <div className="flex justify-between items-center px-2 animate-slide-in-right">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-800 dark:text-slate-200">{finalFilteredQuestions.length}</span> questions found
        </p>
        
        {finalFilteredQuestions.length > 0 && (
          <div className="text-sm text-teal-600 dark:text-teal-400 animate-pulse-soft">
            Ready to start!
          </div>
        )}
      </div>

      {/* Quiz Container */}
      <QuizContainer
        key={JSON.stringify({
          selectedSubject,
          selectedGradeLevel,
          selectedDifficulty,
          selectedUnit,
          selectedSection,
        })}
        quiz={{
          subject: selectedSubject === "All" ? undefined : selectedSubject,
          difficulty: selectedDifficulty === "All" ? undefined : selectedDifficulty,
          gradeLevel: selectedGradeLevel === "All" ? undefined : selectedGradeLevel,
          unit: selectedUnit === "All" ? undefined : selectedUnit,
          topic: selectedSection === "All" ? undefined : selectedSection,
          totalQuestions: finalFilteredQuestions.length,
        }}
        questions={finalFilteredQuestions}
      />
    </div>
  );
};

export default QuizFilter;