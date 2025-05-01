 // Question.tsx
 import React from 'react';
  
 interface QuestionProps {
   question: string;
 }
 
 const QuestionTitle: React.FC<QuestionProps> = ({ question }) => {
   return <h2 className="text-2xl font-semibold mb-5 text-center text-gray-700">{question}</h2>;
 };
 
 export default QuestionTitle;