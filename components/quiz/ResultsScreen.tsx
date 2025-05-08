"use client";

import React, { useEffect, useState } from "react";
import { ArrowPathIcon, TrophyIcon, ShareIcon } from "@heroicons/react/24/outline";

interface ResultsScreenProps {
  finalScore: number;
  bestScore: number;
  title: string;
  message: string;
  user?: number;
  restartQuiz: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  finalScore,
  bestScore,
  title,
  message,
  restartQuiz,
}) => {
  const isNewBestScore = finalScore > 0 && finalScore >= bestScore;
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Show confetti animation for new best scores
  useEffect(() => {
    if (isNewBestScore) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isNewBestScore]);

  // Add confetti animation
  useEffect(() => {
    if (!showConfetti) return;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-slow {
        0% { transform: translate3d(0, 0, 0) rotateX(0) rotateY(0); }
        100% { transform: translate3d(25px, 105vh, 0) rotateX(360deg) rotateY(180deg); }
      }
      
      @keyframes confetti-medium {
        0% { transform: translate3d(0, 0, 0) rotateX(0) rotateY(0); }
        100% { transform: translate3d(100px, 105vh, 0) rotateX(100deg) rotateY(360deg); }
      }
      
      @keyframes confetti-fast {
        0% { transform: translate3d(0, 0, 0) rotateX(0) rotateY(0); }
        100% { transform: translate3d(-50px, 105vh, 0) rotateX(10deg) rotateY(250deg); }
      }
      
      .confetti-container {
        perspective: 700px;
        position: absolute;
        overflow: hidden;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
      }
      
      .confetti {
        position: absolute;
        z-index: 1;
        top: -10px;
        border-radius: 0%;
      }
      
      .confetti--animation-slow {
        animation: confetti-slow 2.5s linear 1 forwards;
      }
      
      .confetti--animation-medium {
        animation: confetti-medium 2s linear 1 forwards;
      }
      
      .confetti--animation-fast {
        animation: confetti-fast 1.5s linear 1 forwards;
      }
      
      @keyframes float-upward {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      .float-upward {
        animation: float-upward 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
      }
      
      @keyframes glow-pulse {
        0%, 100% { text-shadow: 0 0 10px rgba(6, 182, 212, 0.5); }
        50% { text-shadow: 0 0 20px rgba(6, 182, 212, 0.8); }
      }
      
      .glow-pulse {
        animation: glow-pulse 2s ease-in-out infinite;
      }
      
      @keyframes bounce-in {
        0% { transform: scale(0); opacity: 0; }
        60% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .bounce-in {
        animation: bounce-in 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
      }
    `;
    document.head.appendChild(style);
    
    // Create confetti elements
    const confettiCount = 100;
    const colors = [
      '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', // pinks
      '#f7aef8', '#b388eb', '#8093f1', '#72ddf7', '#0aa1dd', // purples to blues
      '#f7d002', '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', // yellow through purple
      '#06d6a0', '#1b9aaa', '#ef476f', '#ffc43d', '#1b9aaa', // teals and accent colors
    ];
    
    const shapes = [
      'circle', 'triangle', 'square', 'star'
    ];
    
    // Create confetti container if it doesn't exist
    let container = document.querySelector('.confetti-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'confetti-container';
      document.body.appendChild(container);
    }
    
    // Generate confetti elements
    Array.from({ length: confettiCount }).forEach((_, i) => {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.className = 'confetti';
      confetti.style.left = `${Math.floor(Math.random() * 100)}%`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = color;
      confetti.style.boxShadow = `0 0 5px ${color}`;
      confetti.style.opacity = Math.random().toString();
      
      // Randomly assign animation speed
      const animationTime = ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)];
      confetti.classList.add(`confetti--animation-${animationTime}`);
      
      container.appendChild(confetti);
      
      // Remove confetti after animation completes
      setTimeout(() => {
        if (confetti && container.contains(confetti)) {
          container.removeChild(confetti);
        }
        
        // Clean up container when all confetti are gone
        if (container && container.childElementCount === 0) {
          document.body.removeChild(container);
        }
      }, 3000);
    });
    
    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
      
      // Clean up any remaining confetti on unmount
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, [showConfetti]);

  return (
    <div className="py-8 px-4 font-sans">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 text-center space-y-6 border border-slate-100 dark:border-slate-700 float-upward">
        {/* Achievement Icon with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400/20 dark:bg-teal-500/30 rounded-full blur-2xl opacity-70"></div>
          <div className="w-28 h-28 flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/30 rounded-full mx-auto mb-2 relative bounce-in overflow-hidden border border-teal-200 dark:border-teal-700/50">
            <div className={`absolute inset-0 ${isNewBestScore ? 'bg-gradient-to-br from-amber-200/20 to-amber-400/20 dark:from-amber-400/20 dark:to-amber-600/20' : ''}`}></div>
            <TrophyIcon 
              className={`h-14 w-14 ${isNewBestScore ? 'text-amber-500 dark:text-amber-400' : 'text-teal-500 dark:text-teal-400'}`} 
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading leading-tight">
          {title}
        </h2>

        {/* Final Score */}
        <div className="relative">
          <div className="absolute inset-0 bg-teal-400/10 dark:bg-teal-400/20 rounded-full blur-xl opacity-80"></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl py-5 border border-teal-200/50 dark:border-teal-700/30 shadow-inner">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 font-medium">
              Your final score
            </p>
            <p className={`text-5xl font-extrabold text-teal-500 dark:text-teal-400 font-heading ${isNewBestScore ? 'glow-pulse' : ''}`}>
              {finalScore}
            </p>
          </div>
        </div>

        {/* Best Score & Message */}
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Previous best: <span className="font-medium text-slate-800 dark:text-slate-200">{bestScore}</span>
          </p>
          
          {isNewBestScore && finalScore > 0 && (
            <div className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-300 dark:from-amber-600 dark:to-amber-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-amber-500/20 bounce-in">
              <span className="mr-1">🎉</span> New Best Score! <span className="ml-1">🏆</span>
            </div>
          )}
          
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-2 text-sm md:text-base">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={restartQuiz}
            className="w-full py-3 px-6 rounded-xl bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-lg font-semibold shadow-lg hover:shadow-teal-500/30 dark:hover:shadow-teal-600/30 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Play Again
          </button>
          
          <button
            onClick={() => {
              // Share logic would go here
              alert("Share functionality would go here!");
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-lg font-semibold transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Share Score
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;