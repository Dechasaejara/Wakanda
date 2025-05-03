"use client";

import React, { useState, useMemo } from "react";
import { Question, DifficultyEnum } from "@/backend/db/schema";
import QuizContainer from "./QuizContainer";
import { useAppContext } from "@/components/layout/navigation";

interface QuizFilterProps {
  allQuestions: Question[];
}

// Helper function to get unique values for dropdowns
const getUniqueValues = (items: Question[], key: keyof Question): string[] => {
  if (!items) return [];
  const values = items
    .map((item) => item[key])
    .filter((value) => value != null);
  return ["All", ...Array.from(new Set(values as string[])).sort()];
};

const QuizFilter = ({ allQuestions }: QuizFilterProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedUnit, setSelectedUnit] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");
  const user = useAppContext().user; // Assuming you have a context to get user data

  // Dynamically filter options for each dropdown based on previous selections
  const filteredQuestionsBySubject = useMemo(() => {
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

  const filteredQuestionsBySection = useMemo(() => {
    return selectedSection === "All"
      ? filteredQuestionsByUnit
      : filteredQuestionsByUnit.filter((q) => q.topic === selectedSection);
  }, [filteredQuestionsByUnit, selectedSection]);

  // Generate dropdown options dynamically
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

  const filterSelectStyle =
    "border border-gray-300 bg-amber-600/90 rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto";

  return (
    <div className="flex flex-col w-full">
      <div className="py-4 px-6 rounded-lg mb-6 bg-indigo-600 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-400 p-2 text-center">
            Filter Questions
          </h2>
          <div className="p-2">
            <img
              src={user?.initDataUnsafe.user?.photo_url}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-indigo-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {/* Subject Filter */}
          {subjects.length > 1 && (
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedGradeLevel("All");
                setSelectedDifficulty("All");
                setSelectedUnit("All");
                setSelectedSection("All");
              }}
              className={filterSelectStyle}
              aria-label="Filter by subject"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === "All" ? "All Subjects" : subject}
                </option>
              ))}
            </select>
          )}

          {/* Grade Level Filter */}
          {gradeLevels.length > 1 && (
            <select
              value={selectedGradeLevel}
              onChange={(e) => {
                setSelectedGradeLevel(e.target.value);
                setSelectedDifficulty("All");
                setSelectedUnit("All");
                setSelectedSection("All");
              }}
              className={filterSelectStyle}
              aria-label="Filter by grade level"
            >
              {gradeLevels.map((grade) => (
                <option key={grade} value={grade}>
                  {grade === "All" ? "All Grades" : grade}
                </option>
              ))}
            </select>
          )}

          {/* Difficulty Filter */}
          {difficulties.length > 1 && (
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setSelectedUnit("All");
                setSelectedSection("All");
              }}
              className={filterSelectStyle}
              aria-label="Filter by difficulty"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === "All"
                    ? "All Difficulties"
                    : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          )}

          {/* Unit (Topic) Filter */}
          {units.length > 1 && (
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setSelectedSection("All");
              }}
              className={filterSelectStyle}
              aria-label="Filter by unit"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit === "All" ? "All Units" : unit}
                </option>
              ))}
            </select>
          )}

          {/* Section (Subtopic) Filter */}
          {sections.length > 1 && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={filterSelectStyle}
              aria-label="Filter by section"
            >
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section === "All" ? "All Sections" : section}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Render QuizContainer with filtered questions */}
      <QuizContainer
        key={JSON.stringify({
          selectedSubject,
          selectedGradeLevel,
          selectedDifficulty,
          selectedUnit,
          selectedSection,
         

        })}
        quiz={{
          subject:selectedSubject,
          difficulty:selectedDifficulty,
          gradeLevel:selectedGradeLevel,
          unit:selectedUnit,
          topic: selectedSection,
          totalQuestions: filteredQuestionsBySection.length,
        }}
        questions={filteredQuestionsBySection}
      />
    </div>
  );
};

export default QuizFilter;
