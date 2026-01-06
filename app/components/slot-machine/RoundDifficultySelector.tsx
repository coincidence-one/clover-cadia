import React from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/8bit/dialog';
import { useLocale } from '@/app/contexts/LocaleContext';
import { getRoundConfig } from '@/app/constants/rounds';

interface RoundDifficultySelectorProps {
  open: boolean;
  onSelect: (isRisky: boolean) => void;
  roundNumber: number;
  currentDay: number;
  maxDays: number;
}

export function RoundDifficultySelector({ open, onSelect, roundNumber, currentDay, maxDays }: RoundDifficultySelectorProps) {
  const { t } = useLocale();
  const config = getRoundConfig(roundNumber);
  
  // Fallback if config failed (shouldn't happen)
  const safe = config.safe;
  const risky = config.risky;

  return (
    <Dialog open={open}>
      <DialogContent 
        className="max-w-[90vw] sm:max-w-md bg-stone-900 border-4 border-blue-500 text-white mx-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-blue-400 text-center text-lg sm:text-xl">
            {t.round} {roundNumber} - DAY {currentDay}/{maxDays}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center text-stone-300 text-xs mb-4">
          {t.chooseStrategy || "Choose your spin strategy"}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* Safe Option */}
          <div 
            className="flex flex-col gap-1 sm:gap-2 p-2 sm:p-4 border-2 border-green-500 bg-green-900/20 hover:bg-green-900/40 cursor-pointer transition-colors rounded"
            onClick={() => onSelect(false)}
          >
            <div className="text-center text-green-400 font-bold text-base sm:text-lg">
              {t.safe || "SAFE"}
            </div>
            <ul className="text-[10px] sm:text-xs text-stone-300 space-y-1">
              <li>🔄 <span className="text-white">{safe.spins} {t.spins || "SPINS"}</span></li>
              <li>💰 COST: <span className="text-yellow-400">{safe.cost}</span></li>
              <li>{t.easyGoal || "Easy to clear"}</li>
              <li>{t.reward || "Reward"}: <span className="text-yellow-400">{safe.rewardTickets} 🎟️</span></li>
            </ul>
            <Button className="w-full mt-1 sm:mt-2 bg-green-600 hover:bg-green-500 text-[10px] sm:text-xs py-1 sm:py-2">
              {t.select || "SELECT"}
            </Button>
          </div>

          {/* Risky Option */}
          <div 
            className="flex flex-col gap-1 sm:gap-2 p-2 sm:p-4 border-2 border-red-500 bg-red-900/20 hover:bg-red-900/40 cursor-pointer transition-colors rounded"
            onClick={() => onSelect(true)}
          >
            <div className="text-center text-red-500 font-bold text-base sm:text-lg">
              {t.risky || "RISKY"}
            </div>
            <ul className="text-[10px] sm:text-xs text-stone-300 space-y-1">
              <li>🔄 <span className="text-white">{risky.spins} {t.spins || "SPINS"}</span></li>
              <li>💰 COST: <span className="text-yellow-400">{risky.cost}</span></li>
              <li>{t.hardGoal || "Hard to clear"}</li>
              <li>{t.reward || "Reward"}: <span className="text-yellow-400">{risky.rewardTickets} 🎟️</span></li>
            </ul>
            <Button className="w-full mt-1 sm:mt-2 bg-red-600 hover:bg-red-500 text-[10px] sm:text-xs py-1 sm:py-2">
              {t.select || "SELECT"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
