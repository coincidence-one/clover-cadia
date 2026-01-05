import React from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/8bit/dialog';
import { useLocale } from '@/app/contexts/LocaleContext';

interface RoundDifficultySelectorProps {
  open: boolean;
  onSelect: (isRisky: boolean) => void;
  roundNumber: number;
}

export function RoundDifficultySelector({ open, onSelect, roundNumber }: RoundDifficultySelectorProps) {
  const { t } = useLocale();

  return (
    <Dialog open={open}>
      <DialogContent 
        className="max-w-md bg-stone-900 border-4 border-blue-500 text-white"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-blue-400 text-center text-xl animate-pulse">
            {t.round} {roundNumber} {t.setup || "SETUP"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center text-stone-300 text-xs mb-4">
          Choose your spin capacity strategy
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Safe Option */}
          <div 
            className="flex flex-col gap-2 p-4 border-2 border-green-500 bg-green-900/20 hover:bg-green-900/40 cursor-pointer transition-colors"
            onClick={() => onSelect(false)}
          >
            <div className="text-center text-green-400 font-bold text-lg">SAFE</div>
            <ul className="text-xs text-stone-300 space-y-1">
              <li>🔄 <span className="text-white">7 SPINS</span></li>
              <li>Easy to clear goal</li>
              <li>Reward: <span className="text-yellow-400">1 🎟️</span></li>
            </ul>
             <Button className="w-full mt-2 bg-green-600 hover:bg-green-500 text-xs">SELECT</Button>
          </div>

          {/* Risky Option */}
          <div 
            className="flex flex-col gap-2 p-4 border-2 border-red-500 bg-red-900/20 hover:bg-red-900/40 cursor-pointer transition-colors"
            onClick={() => onSelect(true)}
          >
            <div className="text-center text-red-500 font-bold text-lg">RISKY</div>
            <ul className="text-xs text-stone-300 space-y-1">
              <li>🔄 <span className="text-white">3 SPINS</span></li>
              <li>Hard to clear goal</li>
              <li>Reward: <span className="text-yellow-400">2 🎟️</span></li>
            </ul>
            <Button className="w-full mt-2 bg-red-600 hover:bg-red-500 text-xs">SELECT</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
