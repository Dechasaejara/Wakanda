// Options.tsx
import { AnswerStatus } from "@/types";
import React from "react";

interface OptionsProps {
  options: string[];
  selectAnswer: (option: string) => void;
  answerStatus: AnswerStatus;
  selectedOption: string | null;
  correctAnswer: string;
  disabledOptions: string[];
}

const Options: React.FC<OptionsProps> = ({
  options,
  selectAnswer,
  answerStatus,
  selectedOption,
  correctAnswer,
  disabledOptions,
}) => {
  // Ensure options is an array of strings
  const opts = Array.isArray(options) ? options.map(String) : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 font-thin w-full">
      {opts.map((option, index) => (
        <button
          key={option}
          onClick={() => selectAnswer(option)}
          disabled={answerStatus !== null || disabledOptions.includes(option)}
          className={`option-btn text-start font-semibold w-full py-3 px-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-150 ease-in-out ${
            answerStatus && selectedOption === option
              ? answerStatus === "correct"
                ? " text-white border-emerald-600 flash-correct"
                : " text-white border-red-600 flash-incorrect"
              : answerStatus && option === correctAnswer
              ? " text-white border-emerald-600"
              : disabledOptions.includes(option)
              ? "bg-gray-200 opacity-50 cursor-not-allowed"
              : "bg-white hover:bg-indigo-100 text-indigo-700 border-indigo-200"
          }`}
        >
          {`${++index}. ${option}`}
        </button>
      ))}
    </div>
  );
};

export default Options;
