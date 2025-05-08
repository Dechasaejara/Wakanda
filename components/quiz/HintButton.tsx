 // HintButton.tsx
 import React from 'react';
  
 interface HintButtonProps {
   hintsAvailable: number;
   useHint: () => void;
   isDisabled: boolean;
 }
 
 const HintButton: React.FC<HintButtonProps> = ({ hintsAvailable, useHint, isDisabled }) => {
   return (
     <button
       onClick={useHint}
       disabled={isDisabled}
       className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
     >
       <i className="fas fa-lightbulb"></i> Hint (<span>{hintsAvailable}</span>)
     </button>
   );
 };
 
 export default HintButton;