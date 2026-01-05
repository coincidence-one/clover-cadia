'use client';

import React from 'react';
import { useSlotMachine, ITEMS, ACHIEVEMENTS, LEVELS, ITEM_KEYS } from '@/app/hooks/useSlotMachine';
import { useLocale } from '@/app/contexts/LocaleContext';
import { Button } from '@/components/ui/8bit/button';
import { Card } from '@/components/ui/8bit/card';
import { Badge } from '@/components/ui/8bit/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/8bit/dialog';

export default function SlotMachine() {
  const { state, isSpinning, message, reels, winLineActive, showLevelUp, setShowLevelUp, showDailyBonus, setShowDailyBonus, toast, actions } = useSlotMachine();
  const { t, toggleLocale, locale } = useLocale();

  // Helper for Level Progress
  const currentLevel = LEVELS.find(l => l.level === state.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === state.level + 1);
  const xpProgress = nextLevel 
    ? ((state.xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100 
    : 100;

  // Get translated item
  const getItemTranslation = (key: string) => {
    const itemKey = key as keyof typeof t.items;
    return t.items[itemKey] || { name: key, desc: '' };
  };

  // Get translated achievement
  const getAchievementTranslation = (id: string) => {
    const achKey = id as keyof typeof t.achievements;
    return t.achievements[achKey] || { name: id, desc: '' };
  };

  return (
    <div className="relative min-h-screen bg-stone-900 text-green-400 font-pixel p-4 flex flex-col items-center justify-center">
      {/* Scanlines Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4 gap-2">
        <Card className="flex-1 flex items-center p-2 h-12 bg-stone-800 border-2 border-white">
          <Badge variant="default" className="mr-2 bg-purple-600 text-yellow-400">{currentLevel.rank} {t.level}{state.level}</Badge>
          <div className="flex-1 h-4 bg-black border border-white relative">
            <div className="h-full bg-purple-600 transition-all" style={{ width: `${xpProgress}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white dropshadow-sm">
                {state.xp} / {nextLevel?.xp || 'MAX'} {t.xp}
            </span>
          </div>
        </Card>
        
        {/* Language Toggle */}
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 text-xs"
          onClick={toggleLocale}
        >
          {t.language}
        </Button>

        {/* Shop Trigger */}
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 text-xs">{t.shop}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-stone-800 border-4 border-white text-white">
                <DialogHeader>
                    <DialogTitle className="text-yellow-400 text-center text-xl">{t.itemShop}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="text-center border-2 border-green-500 p-2 text-green-400">
                        {t.coins}: {state.credits}
                    </div>
                    {ITEM_KEYS.map((key) => {
                        const item = ITEMS[key];
                        const translation = getItemTranslation(key);
                        return (
                            <div key={key} className="flex items-center justify-between bg-black p-2 border border-white">
                                <div className="text-2xl mr-4">{item.icon}</div>
                                <div className="flex-1">
                                    <div className="text-xs text-white">{translation.name}</div>
                                    <div className="text-[10px] text-cyan-400">{translation.desc}</div>
                                </div>
                                <Button size="sm" onClick={() => actions.buyItem(key)} disabled={state.credits < item.price}>
                                    {item.price}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>

         {/* Achievements Trigger */}
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 text-xs">🏆</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-stone-800 border-4 border-white text-white h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-yellow-400 text-center text-xl">{t.trophies}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2">
                     {ACHIEVEMENTS.map(ach => {
                        const translation = getAchievementTranslation(ach.id);
                        return (
                            <div key={ach.id} className={`flex items-center p-2 border-2 ${state.achievements[ach.id] ? 'border-yellow-400 bg-stone-900' : 'border-gray-600 bg-stone-950 opacity-50'}`}>
                                <div className="text-2xl mr-4">{ach.icon}</div>
                                <div className="flex-1">
                                    <div className="text-xs text-white">{translation.name}</div>
                                    <div className="text-[10px] text-gray-400">{translation.desc}</div>
                                </div>
                                <div>{state.achievements[ach.id] ? '✅' : '🔒'}</div>
                            </div>
                        );
                     })}
                </div>
            </DialogContent>
        </Dialog>
      </div>

      {/* Header */}
      <div className="text-center mb-6 animate-pulse">
        <h1 className="text-3xl text-green-400 drop-shadow-[2px_2px_0_#000]">{t.title}</h1>
        <p className="text-xs text-yellow-400 tracking-widest">{t.subtitle}</p>
      </div>

      {/* Jackpot */}
      <div className="w-full max-w-lg bg-black border-4 border-double border-yellow-500 p-2 mb-4 text-center">
        <div className="text-[10px] text-yellow-500">{t.jackpot}</div>
        <div className="text-2xl text-yellow-400 drop-shadow-md">{state.jackpot}</div>
      </div>

      {/* Slots Area */}
      <div className={`relative bg-stone-800 p-4 border-4 border-white mb-4 ${winLineActive ? 'animate-shake' : ''}`}>
         {/* Win Line */}
         {winLineActive && <div className="absolute top-1/2 left-2 right-2 h-1 bg-yellow-400 z-10 animate-blink" />}
         
         <div className="flex gap-2 justify-center">
            {[0, 1, 2].map(i => (
                <div 
                    key={i} 
                    className={`relative w-20 h-24 bg-black border-4 ${state.frozenReels[i] ? 'border-blue-500' : 'border-cyan-500'} overflow-hidden cursor-pointer`}
                    onClick={() => actions.freezeReel(i)}
                >
                    {state.frozenReels[i] && <div className="absolute top-0 right-0 text-[10px] bg-blue-500 text-white px-1">🔒</div>}
                    <div className="flex flex-col items-center justify-center h-full">
                        {reels[i].map((sym, idx) => (
                           <div key={idx} className={`text-4xl h-full flex items-center justify-center transition-transform ${isSpinning && !state.frozenReels[i] ? 'animate-spin-fast blur-[1px]' : ''} ${idx===1 ? 'scale-110' : 'opacity-50 scale-75'}`}>
                             {sym}
                           </div>
                        ))}
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* Message */}
      <Card className="w-full max-w-lg mb-4 bg-black border-white min-h-[50px] flex items-center justify-center">
         <span className={`text-sm ${winLineActive ? 'text-yellow-400 animate-bounce' : 'text-green-400'}`}>
            {message}
         </span>
      </Card>

      {/* Item Bar */}
      <div className="flex gap-2 mb-4">
        {ITEM_KEYS.map((key) => {
            const item = ITEMS[key];
            return (
                <div 
                    key={key} 
                    className={`relative w-12 h-12 bg-stone-700 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-green-700 ${state.items[key] > 0 ? '' : 'opacity-40 grayscale'}`}
                    onClick={() => actions.useItem(key)}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span className="absolute bottom-0 right-0 bg-red-500 text-white text-[8px] px-1">{state.items[key]}</span>
                </div>
            );
        })}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg">
         <div className="flex gap-2 mb-2">
            <div className="flex-1 bg-black border-2 border-white p-1 text-center">
                <div className="text-[8px] text-cyan-400">{t.coins}</div>
                <div className="text-green-400">{state.credits}</div>
            </div>
            <div className="flex-1 bg-black border-2 border-white p-1 text-center">
                <div className="text-[8px] text-cyan-400">{t.bet}</div>
                <div className="text-green-400">{state.bet}</div>
            </div>
            <div className="flex-1 bg-black border-2 border-white p-1 text-center">
                <div className="text-[8px] text-cyan-400">{t.win}</div>
                <div className="text-yellow-400">{state.lastWin}</div>
            </div>
         </div>

         <div className="flex gap-4 items-center justify-center">
             <Button variant="outline" size="icon" onClick={() => actions.changeBet(-10)}>◀</Button>
             <Button 
                className="w-32 h-12 text-xl bg-green-600 hover:bg-green-500 text-black border-4 border-white"
                onClick={actions.spin}
                disabled={isSpinning}
             >
                {isSpinning ? t.spinning : t.spin}
             </Button>
             <Button variant="outline" size="icon" onClick={() => actions.changeBet(10)}>▶</Button>
         </div>
         
         <Button variant="secondary" className="w-full mt-2 bg-yellow-600 text-black h-8 text-xs" onClick={() => actions.changeBet(1000)}>{t.maxBet}</Button>
      </div>

      {/* Modals: Level Up & Daily */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
         <DialogContent className="bg-stone-800 border-4 border-green-400 text-center">
            <DialogHeader>
                <DialogTitle className="text-green-400 text-2xl">{t.levelUp}</DialogTitle>
            </DialogHeader>
            <div className="text-6xl my-4">⬆️</div>
            <div className="text-white">{t.levelLabel} {state.level}</div>
            <div className="text-yellow-400 text-sm mt-2">{t.reward.replace('{amount}', String(state.level * 100))}</div>
            <Button onClick={() => setShowLevelUp(false)} className="mt-4">{t.ok}</Button>
         </DialogContent>
      </Dialog>
      
      <Dialog open={showDailyBonus} onOpenChange={setShowDailyBonus}>
         <DialogContent className="bg-stone-800 border-4 border-red-500 text-center">
            <DialogHeader>
                <DialogTitle className="text-red-400 text-2xl">{t.dailyBonus}</DialogTitle>
            </DialogHeader>
            <div className="text-6xl my-4 animate-bounce">🎁</div>
            <div className="text-white">{t.streak.replace('{days}', String(state.dailyStreak))}</div>
            <Button onClick={actions.claimDaily} className="mt-4 bg-red-500 hover:bg-red-400 text-white">{t.claimReward}</Button>
         </DialogContent>
      </Dialog>
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 border-4 border-white z-50 animate-in slide-in-from-top fade-in duration-300">
           {toast}
        </div>
      )}
    </div>
  );
}
