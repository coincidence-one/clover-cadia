'use client';

import React from 'react';
import { SYMBOLS } from '@/app/hooks/useSlotMachine';

interface SlotGridProps {
  grid: string[];
  winningCells: number[];
  reelSpinning: boolean[];
  showCurse: boolean;
  lastWin: number;
  bet: number;
}

export function SlotGrid({ 
  grid, 
  winningCells, 
  reelSpinning, 
  showCurse, 
  lastWin, 
  bet 
}: SlotGridProps) {
  const getWinTierClass = () => {
    if (showCurse) return 'border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]';
    if (winningCells.length === 0) return '';
    
    if (lastWin >= bet * 10) return 'win-tier-jackpot';
    if (lastWin >= bet * 5) return 'win-tier-3';
    if (lastWin >= bet * 2) return 'win-tier-2';
    return 'win-tier-1';
  };

  return (
    <div className={`relative bg-stone-800 p-3 border-4 border-white mb-4 ${getWinTierClass()}`}>
      {/* Payline indicator */}
      <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-[8px] text-stone-500">
        {Array.from({ length: 5 }).map((_, i) => <div key={i}>►</div>)}
      </div>

      <div className="grid grid-cols-5 gap-1 bg-black p-1">
        {grid.map((cell, i) => {
          const col = i % 5;
          const isColSpinning = reelSpinning[col];
          const isWinning = winningCells.includes(i);
          
          return (
            <div 
              key={i} 
              className={`
                w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl bg-stone-900 border 
                ${isColSpinning 
                  ? 'border-stone-800 text-stone-600 blur-[2px] scale-90 translate-y-1' 
                  : isWinning 
                    ? 'border-yellow-400 bg-yellow-900/50 animate-bounce z-10' 
                    : 'border-stone-700'
                }
                transition-all duration-100 overflow-hidden relative
              `}
            >
              {/* Spin Reel Effect Layer */}
              {isColSpinning && (
                <div className="absolute inset-0 overflow-hidden bg-stone-900 z-20 rounded-md">
                  <div className="flex flex-col items-center animate-scroll">
                    {/* Strip A */}
                    {SYMBOLS.map((s, idx) => (
                      <div key={`a-${idx}`} className="h-12 md:h-16 w-full flex items-center justify-center p-2">
                        <img src={s.icon} alt={s.id} className="w-full h-full object-contain" />
                      </div>
                    ))}
                    {/* Strip B (Loop) */}
                    {SYMBOLS.map((s, idx) => (
                      <div key={`b-${idx}`} className="h-12 md:h-16 w-full flex items-center justify-center p-2">
                        <img src={s.icon} alt={s.id} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actual Symbol */}
              <div className={isColSpinning ? 'opacity-0' : 'opacity-100 scale-100 transition-transform duration-200 w-full h-full p-2 flex items-center justify-center'}>
                <img src={cell} alt="symbol" className="w-full h-full object-contain" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
