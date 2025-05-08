import React from 'react';

interface FilterOption {
  id: string;
  label: string;
  className?: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  activeId: string;
  onChange: (id: string) => void;
  containerClassName?: string;
}

export default function FilterTabs({ 
  options, 
  activeId, 
  onChange, 
  containerClassName = "bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm overflow-hidden" 
}: FilterTabsProps) {
  return (
    <div className={containerClassName}>
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900 ${
              activeId === option.id
                ? option.className || "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}