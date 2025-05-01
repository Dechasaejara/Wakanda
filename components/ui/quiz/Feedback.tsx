 // 
 import React from 'react';
  
 interface FeedbackProps {
   message: string;
   color: string;
 }
 
 const Feedback: React.FC<FeedbackProps> = ({ message, color }) => {
   return (
     <div className={`text-lg font-medium h-6 ${color} ${message ? 'feedback-animation' : ''}`}>
       {message}
     </div>
   );
 };
 
 export default Feedback;