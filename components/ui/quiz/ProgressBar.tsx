
  // ProgressBar.tsx
  import React from 'react';
  
  interface ProgressBarProps {
    progress: number;
    isFailed: boolean;
  }
  
  const ProgressBar: React.FC<ProgressBarProps> = ({ progress, isFailed }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className={`h-2.5 rounded-full progress-bar-fill ${isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-indigo-600'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };
  
  export default ProgressBar;