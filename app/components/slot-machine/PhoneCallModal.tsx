import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/8bit/dialog';
import type { GameState } from '@/app/types';

interface PhoneCallModalProps {
  state: GameState;
  onSelect: (id: string) => void;
}

export function PhoneCallModal({ state, onSelect }: PhoneCallModalProps) {
  return (
    <Dialog open={state.showPhoneModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl bg-stone-900 border-4 border-cyan-500 text-center pointer-events-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 text-3xl font-bold animate-pulse">📞 INCOMING CALL...</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-white">
             <div className="text-6xl mb-4 animate-bounce">☎️</div>
             <p className="mb-6 text-lg">Pick a bonus to continue:</p>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {state.currentPhoneChoices.map((bonus) => (
                    <div 
                        key={bonus.id} 
                        className={`
                            border-2 p-3 cursor-pointer transition-all transform hover:scale-105
                            ${bonus.type === 'buff' ? 'border-green-400 bg-green-950 hover:bg-green-900' : ''}
                            ${bonus.type === 'risk' ? 'border-red-400 bg-red-950 hover:bg-red-900' : ''}
                            ${bonus.type === 'special' ? 'border-yellow-400 bg-yellow-950 hover:bg-yellow-900' : ''}
                        `}
                        onClick={() => onSelect(bonus.id)}
                    >
                        <div className="text-2xl mb-2">
                            {bonus.type === 'buff' && '🎁'}
                            {bonus.type === 'risk' && '😈'}
                            {bonus.type === 'special' && '🌟'}
                        </div>
                        <div className="font-bold text-sm mb-1">{bonus.name}</div>
                        <div className="text-[10px] opacity-80">{bonus.desc}</div>
                    </div>
                ))}
             </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}
