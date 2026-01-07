'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/8bit/dialog';
import type { GameState } from '@/app/types';
import { useGameSync } from '@/app/hooks/useGameSync';

interface GameModalsProps {
  state: GameState;
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  onNextRound: () => void;
  onRestart: () => void;
}

export function GameModals({ state, showLevelUp, setShowLevelUp, onNextRound, onRestart }: GameModalsProps) {
  const { syncGameOver, isLoggedIn } = useGameSync();
  const [synced, setSynced] = useState(false);
  const [cloverEarned, setCloverEarned] = useState(0);
  const [newRecord, setNewRecord] = useState(false);

  // Sync game over data when gameOver becomes true
  useEffect(() => {
    if (state.gameOver && !synced && isLoggedIn) {
      const timer = setTimeout(() => {
        setSynced(true);
      }, 0);
      syncGameOver(state).then((result) => {
        if (result) {
          setCloverEarned(result.cloverPointsEarned);
          setNewRecord(result.newBestRound);
        }
      });
      return () => clearTimeout(timer);
    }
    
    // Reset sync state when game restarts
    if (!state.gameOver && synced) {
      const timer = setTimeout(() => {
        setSynced(false);
        setCloverEarned(0);
        setNewRecord(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state.gameOver, state, synced, isLoggedIn, syncGameOver]);

  return (
    <>
      {/* Level Up Modal */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
         <DialogContent className="bg-stone-800 border-4 border-green-400 text-center">
            <DialogHeader>
                <DialogTitle className="text-green-400 text-2xl">LEVEL UP!</DialogTitle>
            </DialogHeader>
            <div className="text-6xl my-4">⬆️</div>
            <div className="text-white">LEVEL {state.level} REACHED!</div>
            <div className="text-yellow-400 text-sm mt-2">+100 COINS</div>
         </DialogContent>
      </Dialog>

      {/* Round Clear Modal */}
      <Dialog open={state.paidAmount >= (state.currentDebt || state.currentGoal) && !state.gameOver && state.round > 0} onOpenChange={() => {}}>
        <DialogContent className="bg-green-900 border-4 border-green-400 text-center pointer-events-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl animate-bounce">🎉 DEBT PAID! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-white">
             <p className="mb-4">PAYMENT COMPLETE!</p>
             <div className="text-3xl mb-2">🎟️ REWARD READY</div>
             <p className="text-xs text-green-200">Advance to next round for harder challenge & more tickets!</p>
          </div>
          <Button className="w-full bg-yellow-500 text-black text-xl h-12 hover:bg-yellow-400" onClick={onNextRound}>
            NEXT ROUND ➡️
          </Button>
        </DialogContent>
      </Dialog>

      {/* Game Over Modal */}
      <Dialog open={state.gameOver} onOpenChange={() => {}}>
        <DialogContent className="bg-red-950 border-4 border-red-600 text-center pointer-events-auto">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-3xl font-bold">☠️ GAME OVER ☠️</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-white">
             <div className="text-5xl mb-3">🪦</div>
             <p className="text-lg mb-2">ROUND {state.round} FAILED</p>
             <p className="text-xs text-red-300 mb-4">Target: {state.currentGoal} | Got: {state.credits}</p>
             
             {/* Clover Points Earned */}
             {isLoggedIn && cloverEarned > 0 && (
               <div className="bg-black/50 border-2 border-green-600 p-3 mb-4">
                 <div className="text-green-400 text-sm">🍀 CLOVER POINTS EARNED</div>
                 <div className="text-2xl text-green-400">+{cloverEarned}</div>
                 {newRecord && (
                   <div className="text-yellow-400 text-xs mt-1">⭐ NEW BEST ROUND!</div>
                 )}
               </div>
             )}
             
             {!isLoggedIn && (
               <div className="text-stone-400 text-xs mb-3">
                 Log in to save your progress!
               </div>
             )}
          </div>
          
          <div className="space-y-2">
            <Button className="w-full bg-white text-black text-lg h-10 hover:bg-gray-200" onClick={onRestart}>
              🔄 TRY AGAIN
            </Button>
            <Link href="/lobby" className="block">
              <Button className="w-full bg-purple-600 text-white text-sm h-8 hover:bg-purple-500">
                🏠 LOBBY
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

