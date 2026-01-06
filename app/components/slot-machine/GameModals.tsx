import React from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/8bit/dialog';
import type { GameState } from '@/app/types';

interface GameModalsProps {
  state: GameState;
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  onNextRound: () => void;
  onRestart: () => void;
}

export function GameModals({ state, showLevelUp, setShowLevelUp, onNextRound, onRestart }: GameModalsProps) {
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
      <Dialog open={state.credits >= state.currentGoal && !state.gameOver && state.round > 0} onOpenChange={() => {}}>
        <DialogContent className="bg-green-900 border-4 border-green-400 text-center pointer-events-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl animate-bounce">🎉 ROUND CLEARED! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-white">
             <p className="mb-4">GOAL REACHED!</p>
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
          <div className="py-6 text-white">
             <div className="text-6xl mb-4">🪦</div>
             <p className="text-xl mb-2">OUT OF SPINS!</p>
             <p className="text-xs text-red-300">Target was {state.currentGoal} coins.</p>
          </div>
          <Button className="w-full bg-white text-black text-xl h-12 hover:bg-gray-200" onClick={onRestart}>
            🔄 RESTART GAME
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
