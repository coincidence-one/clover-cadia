'use client';

import React from 'react';
import { useSlotMachine, ITEMS, ACHIEVEMENTS, LEVELS, ITEM_KEYS, PAYLINES, SPIN_COST } from '@/app/hooks/useSlotMachine';
import { useLocale } from '@/app/contexts/LocaleContext';
import { Button } from '@/components/ui/8bit/button';
import { Card } from '@/components/ui/8bit/card';
import { Badge } from '@/components/ui/8bit/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/8bit/dialog';

// Sub-components
import { RoundInfoBar } from '@/app/components/slot-machine/RoundInfoBar';
import { TicketShop } from '@/app/components/slot-machine/TicketShop';
import { PhoneCallModal } from '@/app/components/slot-machine/PhoneCallModal';
import { GameModals } from '@/app/components/slot-machine/GameModals';
import { SymbolsPanel, PatternsPanel, PaytableModal } from '@/app/components/slot-machine/Paytable';
import { RoundDifficultySelector } from '@/app/components/slot-machine/RoundDifficultySelector';
import { GameGuideModal } from '@/app/components/slot-machine/GameGuideModal';

export default function SlotMachine() {
  const { state, isSpinning, message, grid, winningCells, showLevelUp, setShowLevelUp, showDailyBonus, setShowDailyBonus, showCurse, toast, actions } = useSlotMachine();
  const { t, locale, toggleLocale } = useLocale();

  const [showPaytable, setShowPaytable] = React.useState(false);
  const [showTicketShop, setShowTicketShop] = React.useState(false);
  const [showAchievements, setShowAchievements] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // basic audio init handled in hook
    
    // Auto-show guide on first load
    const guideViewed = localStorage.getItem('pixelBet_guideViewed');
    if (!guideViewed) {
      setShowGuide(true);
      localStorage.setItem('pixelBet_guideViewed', 'true');
    }
  }, []);
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
    <div className={`relative min-h-screen bg-stone-900 text-green-400 font-pixel p-4 flex flex-col items-center justify-center ${showCurse ? 'animate-pulse bg-red-900' : ''}`}>
      {/* Scanlines Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Desktop Paytable Layout (Left & Right) */}
      <div className="hidden xl:block absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-500 will-change-transform">
        <SymbolsPanel />
      </div>
      <div className="hidden xl:block absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-500 will-change-transform">
        <PatternsPanel />
      </div>

      {/* Top Bar - Row 1: Level & Buttons */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-2 gap-1 md:gap-2">
        {/* Level Badge - Compact on Mobile */}
        <Badge variant="default" className="bg-purple-600 text-yellow-400 text-[10px] md:text-xs px-2 md:px-4 py-1 md:py-2 shrink-0 truncate max-w-[100px] md:max-w-none">
          <span className="md:hidden">LV.{state.level}</span>
          <span className="hidden md:inline">{currentLevel.rank} {t.level}{state.level}</span>
        </Badge>
        
        {/* Buttons Group */}
        <div className="flex gap-1 md:gap-2 shrink-0">
           <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(true)}
            className="h-8 w-8 p-0 border-yellow-500/50 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40"
            title="Guide"
          >
            ?
          </Button>

          {/* Paytable Modal (Mobile/Tablet) */}
          <div className="xl:hidden">
            <PaytableModal />
          </div>

          {/* Language Toggle */}
          <Button variant="outline" className="h-8 md:h-10 w-8 md:w-14 text-xs p-0 md:px-2" onClick={toggleLocale}>
            <span className="md:hidden">{t.language === '한' ? '한' : 'EN'}</span>
            <span className="hidden md:inline">{t.language}</span>
          </Button>

          {/* TicketShop ... */}
          <TicketShop 
            state={state} 
            onBuy={actions.buyTicketItem}
            shopTitle={t.shopTitle} 
          />

          {/* Achievements Dialog */}
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
                  const unlocked = state.achievements[ach.id];
                  const achText = getAchievementTranslation(ach.id);
                  return (
                    <div key={ach.id} className={`flex items-center p-2 border-2 ${unlocked ? 'border-yellow-400 bg-yellow-900/20' : 'border-stone-600 opacity-50'}`}>
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
        </div>
      </div>

      {/* Top Bar - Row 2: XP Bar */}
      <div className="w-full max-w-2xl bg-stone-800 border-2 border-stone-600 h-3 mb-4 rounded-full overflow-hidden flex flex-row items-center relative">
        <div 
          className="bg-purple-600 h-full transition-all duration-500"
          style={{ width: `${xpProgress}%` }} 
        />
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-mono z-10 w-full text-center">
             XP {Math.floor(state.xp)} / {nextLevel ? nextLevel.xp : 'MAX'}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6 animate-pulse">
        <h1 className="text-3xl text-green-400 drop-shadow-[2px_2px_0_#000]">LUCKY CLOVER</h1>
        <p className="text-xs text-yellow-400 tracking-widest">★ PIXEL SLOTS ★</p>
      </div>

      {/* Round Info Bar */}
      <RoundInfoBar state={state} />

      {/* Jackpot */}
      <div className="w-full max-w-lg bg-black border-4 border-double border-yellow-500 p-2 mb-4 text-center">
        <div className="text-[10px] text-yellow-500">◆ JACKPOT ◆</div>
        <div className="text-2xl text-yellow-400 drop-shadow-md">{state.jackpot}</div>
      </div>

      {/* 5x3 Slot Grid (CloverPit Style) */}
      <div className={`relative bg-stone-800 p-3 border-4 border-white mb-4 ${showCurse ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]' : winningCells.length > 0 ? 'animate-pulse border-yellow-400' : ''}`}>
        {/* Payline indicator */}
        <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-[8px] text-stone-500">
             {PAYLINES.map((_, i) => <div key={i}>►</div>)}
        </div>

        <div className="grid grid-cols-5 gap-1 bg-black p-1">
          {grid.map((cell, i) => {
            const isWinning = winningCells.includes(i);
            return (
              <div 
                key={i} 
                className={`
                  w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl bg-stone-900 border 
                  ${isWinning ? 'border-yellow-400 bg-yellow-900/50 animate-bounce' : 'border-stone-700'}
                  transition-all duration-100
                `}
              >
                {cell}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Display */}
      <div className="h-8 mb-4 text-center">
        <p className={`text-sm ${message.includes('WIN') ? 'text-yellow-400 animate-bounce' : 'text-green-400'}`}>
          {message || (isSpinning ? '...' : t.ready)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
         <div className="flex gap-4 w-full">
            <div className="flex-1 bg-black border-2 border-stone-600 p-2 text-center">
                <div className="text-[10px] text-stone-400">{t.coins}</div>
                <div className="text-xl text-yellow-400">{state.credits}</div>
            </div>
            {/* Spin Cost Display */}
             <div className="flex-1 bg-black border-2 border-stone-600 p-2 text-center">
                <div className="text-[10px] text-stone-400">{t.spinCostAlias || "SPIN COST"}</div>
                <div className="text-xl text-red-400">{SPIN_COST}</div>
            </div>
         </div>

         <Button 
            className={`w-full h-16 text-2xl tracking-widest ${isSpinning ? 'bg-stone-700' : 'bg-red-600 hover:bg-red-500'} border-b-4 border-red-800 active:border-b-0 active:mt-1`}
            onClick={actions.spin}
            disabled={isSpinning || state.credits < 10 && state.bonusSpins <= 0}
         >
            {isSpinning ? '...' : state.bonusSpins > 0 ? `FREE SPIN (${state.bonusSpins})` : `SPIN (-${SPIN_COST})`}
         </Button>
      </div>

      {/* Toast Notification */}
      {toast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold animate-bounce shadow-lg z-50 whitespace-nowrap">
              {toast}
          </div>
      )}

      {/* Separated Modals */}
      <PhoneCallModal state={state} onSelect={actions.selectPhoneBonus} />
      
      <RoundDifficultySelector 
        open={state.showRoundSelector} 
        onSelect={actions.startRound} 
        roundNumber={state.round === 0 ? 1 : (state.showRoundSelector && state.round > 0 ? state.round + 1 : state.round)} 
      />

      <GameGuideModal open={showGuide} onClose={() => setShowGuide(false)} />

      <GameModals 
         state={state} 
         showLevelUp={showLevelUp} 
         setShowLevelUp={setShowLevelUp} 
         onNextRound={actions.nextRound} 
         onRestart={actions.restartGame}
      />

    </div>
  );
}
