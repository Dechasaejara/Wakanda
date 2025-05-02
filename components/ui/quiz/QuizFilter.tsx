// src/components/ui/quiz/QuizFilter.tsx
"use client"; // Important: Mark this as a Client Component

import React, { useState, useMemo } from "react";
import { Question, DifficultyEnum } from "@/backend/db/schema"; // Import Question type and DifficultyEnum
import QuizContainer from "./QuizContainer"; // Import the QuizContainer

interface QuizFilterProps {
  allQuestions: Question[]; // Receive all questions from the server component
}

// Helper function to get unique values for dropdowns, handling null/undefined
const getUniqueValues = (items: any[], key: keyof Question): string[] => {
  if (!items) return [];
  // Filter out null/undefined values before creating the set
  const values = items.map(item => item[key]).filter(value => value != null);
  return ["All", ...Array.from(new Set(values as string[])).sort()];
};

const QuizFilter = ({ allQuestions }: QuizFilterProps) => {
  // State for each filter criterion
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("All");
  // Use DifficultyEnum type or string for state consistency
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedUnit, setSelectedUnit] = useState<string>("All"); // Maps to 'topic' in schema
  const [selectedSection, setSelectedSection] = useState<string>("All"); // Maps to 'subtopic' in schema

  // Derive unique options for filters using useMemo for optimization
  const subjects = useMemo(() => getUniqueValues(allQuestions, 'subject'), [allQuestions]);
  const gradeLevels = useMemo(() => getUniqueValues(allQuestions, 'gradeLevel'), [allQuestions]);
  // Use DifficultyEnum values for the difficulty dropdown options
  const difficulties = useMemo(() => ["All", ...Object.values(DifficultyEnum.enumValues)].sort(), []);
  const units = useMemo(() => getUniqueValues(allQuestions, 'unit'), [allQuestions]); // Use 'unit' (topic)
  const sections = useMemo(() => getUniqueValues(allQuestions, 'section'), [allQuestions]); // Use 'section' (subtopic)


  // Filter questions based on selected criteria using useMemo
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((question) => {
      const subjectMatch = selectedSubject === "All" || question.subject === selectedSubject;
      const gradeLevelMatch = selectedGradeLevel === "All" || question.gradeLevel === selectedGradeLevel;
      const difficultyMatch = selectedDifficulty === "All" || question.difficulty === selectedDifficulty;
      const unitMatch = selectedUnit === "All" || question.unit === selectedUnit; // Filter by 'unit' (topic)
      const sectionMatch = selectedSection === "All" || question.section === selectedSection; // Filter by 'section' (subtopic)

      return subjectMatch && gradeLevelMatch && difficultyMatch && unitMatch && sectionMatch;
    });
  }, [allQuestions, selectedSubject, selectedGradeLevel, selectedDifficulty, selectedUnit, selectedSection]);

  // Basic styling for filters (customize as needed)
  const filterSelectStyle = "border border-gray-300 bg-amber-600 rounded-md p-2 mr-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      {/* Filter UI Section */}
      <div className=" p-4 rounded-lg mb-6 bg-amber-800 shadow ">
        <h2 className="text-xl font-semibold mb-3 text-gray-400 p-2 text-center">Filter Questions</h2>
        <div className=" flex flex-wrap  justify-center items-center">
          {/* Subject Filter */}
          {subjects.length > 1 && ( // Only show filter if options exist
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
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
                onChange={(e) => setSelectedGradeLevel(e.target.value)}
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
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={filterSelectStyle}
                aria-label="Filter by difficulty"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff === "All" ? "All Difficulties" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
           )}

           {/* Unit (Topic) Filter */}
           {units.length > 1 && (
              <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
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
      {/* Add a key based on filters to force re-mount QuizContainer on filter change if desired */}
      {/* Or manage state reset internally in QuizContainer via useEffect */}
      <QuizContainer
         key={JSON.stringify({selectedSubject, selectedGradeLevel, selectedDifficulty, selectedUnit, selectedSection})} // Optional: Force remount on filter change
         questions={filteredQuestions}
      />
    </div>
  );
};

export default QuizFilter;