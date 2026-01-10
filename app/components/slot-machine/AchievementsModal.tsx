'use client';

import React from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/8bit/dialog';
import { ACHIEVEMENTS } from '@/app/hooks/useSlotMachine';
import type { Translations } from '@/app/locales/en';

interface AchievementsModalProps {
  achievements: Record<string, boolean>;
  t: Translations;
}

export function AchievementsModal({ achievements, t }: AchievementsModalProps) {
  const getAchievementTranslation = (id: string) => {
    const achKey = id as keyof typeof t.achievements;
    return t.achievements[achKey] || { name: id, desc: '' };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 md:h-10 w-8 md:w-10 text-lg md:text-xl px-0">🏆</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-stone-800 border-4 border-yellow-500 text-white h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-center text-xl">{t.achievementsTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = achievements[ach.id];
            const achText = getAchievementTranslation(ach.id);
            return (
              <div 
                key={ach.id} 
                className={`flex items-center p-2 border-2 ${unlocked ? 'border-yellow-400 bg-yellow-900/20' : 'border-stone-600 opacity-50'}`}
              >
                <div className="text-2xl mr-3">{ach.icon}</div>
                <div>
                  <div className="text-xs font-bold text-yellow-400">{achText.name}</div>
                  <div className="text-[10px] text-stone-400">{achText.desc}</div>
                </div>
                {unlocked && <div className="ml-auto text-green-400 text-xs">✓</div>}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
