import React from 'react';
import type { GameState } from '@/app/types';

interface RoundInfoBarProps {
  state: GameState;
}

export function RoundInfoBar({ state }: RoundInfoBarProps) {
  return (
    <div className="w-full max-w-lg flex gap-2 mb-4">
        {/* Round & Day Info */}
        <div className="flex-1 bg-purple-900 border-2 border-purple-400 p-2 text-center">
            <div className="text-[10px] text-purple-200">ROUND {state.round}</div>
            <div className="text-xl text-white">DAY {state.currentDay}/{state.maxDays}</div>
        </div>

        {/* Goal Progress */}
        <div className={`flex-1 border-2 p-2 text-center ${state.credits >= state.currentGoal ? 'bg-green-900 border-green-400 animate-pulse' : 'bg-black border-white'}`}>
            <div className="text-[10px] text-gray-400">GOAL</div>
            <div className={`text-xl ${state.credits >= state.currentGoal ? 'text-green-400' : 'text-white'}`}>
                {state.currentGoal}
            </div>
        </div>

        {/* Spins Left */}
        <div className={`flex-1 border-2 p-2 text-center ${state.spinsLeft <= 3 ? 'bg-red-900 border-red-500 animate-pulse' : 'bg-black border-white'}`}>
            <div className="text-[10px] text-gray-400">SPINS LEFT</div>
            <div className={`text-xl ${state.spinsLeft <= 3 ? 'text-red-500' : 'text-white'}`}>
                {state.spinsLeft}/{state.maxSpins}
            </div>
        </div>
    </div>
  );
}
