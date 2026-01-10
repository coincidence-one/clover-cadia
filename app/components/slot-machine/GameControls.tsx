'use client';

import React from 'react';
import { Button } from '@/components/ui/8bit/button';
import type { Translations } from '@/app/locales/en';

interface GameControlsProps {
  credits: number;
  spinsLeft: number;
  bonusSpins: number;
  currentDay: number;
  maxDays: number;
  isSpinning: boolean;
  onSpin: () => void;
  onEndDay: () => void;
  t: Translations;
}

export function GameControls({
  credits,
  spinsLeft,
  bonusSpins,
  currentDay,
  maxDays,
  isSpinning,
  onSpin,
  onEndDay,
  t,
}: GameControlsProps) {
  const safeSpinsLeft = typeof spinsLeft !== 'number' || isNaN(spinsLeft) ? 0 : spinsLeft;
  const isDeadlineCheck = currentDay >= maxDays;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
      <div className="flex gap-4 w-full">
        <div className="flex-1 bg-black border-2 border-stone-600 p-2 text-center">
          <div className="text-[10px] text-stone-400">{t.coins}</div>
          <div className="text-xl text-yellow-400">{credits}</div>
        </div>
        <div className="flex-1 bg-black border-2 border-stone-600 p-2 text-center">
          <div className="text-[10px] text-stone-400">{t.spins || 'SPINS LEFT'}</div>
          <div className={`text-xl ${safeSpinsLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
            {safeSpinsLeft}
          </div>
        </div>
      </div>

      {safeSpinsLeft <= 0 ? (
        <Button 
          className="w-full h-16 text-xl md:text-2xl tracking-widest bg-blue-700 hover:bg-blue-600 border-b-4 border-blue-900 active:border-b-0 active:mt-1 animate-pulse"
          onClick={onEndDay}
        >
          {isDeadlineCheck ? '💀 CHECK DEADLINE 💀' : `🌙 FINISH DAY ${currentDay}`}
        </Button>
      ) : (
        <Button 
          className={`w-full h-16 text-2xl tracking-widest ${isSpinning ? 'bg-stone-700' : 'bg-red-600 hover:bg-red-500'} border-b-4 border-red-800 active:border-b-0 active:mt-1`}
          onClick={onSpin}
          disabled={isSpinning}
        >
          {isSpinning ? '...' : bonusSpins > 0 ? `FREE SPIN (${bonusSpins})` : 'SPIN'}
        </Button>
      )}
    </div>
  );
}
