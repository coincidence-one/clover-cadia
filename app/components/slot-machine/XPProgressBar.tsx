'use client';

import React from 'react';

interface XPProgressBarProps {
  currentXP: number;
  currentLevelXP: number;
  nextLevelXP: number | null;
}

export function XPProgressBar({ currentXP, currentLevelXP, nextLevelXP }: XPProgressBarProps) {
  const progress = nextLevelXP 
    ? ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 
    : 100;

  return (
    <div className="w-full max-w-2xl bg-stone-800 border-2 border-stone-600 h-3 mb-4 rounded-full overflow-hidden flex flex-row items-center relative">
      <div 
        className="bg-purple-600 h-full transition-all duration-500"
        style={{ width: `${progress}%` }} 
      />
      <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-mono z-10 w-full text-center">
        XP {Math.floor(currentXP)} / {nextLevelXP ?? 'MAX'}
      </div>
    </div>
  );
}
