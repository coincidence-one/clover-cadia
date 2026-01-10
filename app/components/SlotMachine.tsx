'use client';

import React from 'react';
import { useSlotMachine, LEVELS, PAYLINES } from '@/app/hooks/useSlotMachine';
import { getRoundConfig } from '@/app/constants/rounds';
import { useLocale } from '@/app/contexts/LocaleContext';

// Sub-components
import { RoundInfoBar } from '@/app/components/slot-machine/RoundInfoBar';
import { PhoneCallModal } from '@/app/components/slot-machine/PhoneCallModal';
import { GameModals } from '@/app/components/slot-machine/GameModals';
import { SymbolsPanel, PatternsPanel } from '@/app/components/slot-machine/Paytable';
import { RoundDifficultySelector } from '@/app/components/slot-machine/RoundDifficultySelector';
import { GameGuideModal } from '@/app/components/slot-machine/GameGuideModal';
import { CrystalBall } from './slot-machine/CrystalBall';
import { Confetti } from './slot-machine/Confetti';
import { useUnlockedItems } from '@/app/hooks/useUnlockedItems';

// Refactored components
import { TopActionBar } from './slot-machine/TopActionBar';
import { XPProgressBar } from './slot-machine/XPProgressBar';
import { SlotGrid } from './slot-machine/SlotGrid';
import { GameControls } from './slot-machine/GameControls';

export default function SlotMachine() {
  const { unlockedItems } = useUnlockedItems();
  const { state, isSpinning, reelSpinning, message, grid, winningCells, showLevelUp, setShowLevelUp, showCurse, toast, actions } = useSlotMachine({ unlockedIds: unlockedItems });
  const { t, toggleLocale } = useLocale();
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
    const guideViewed = localStorage.getItem('pixelBet_guideViewed');
    if (!guideViewed) {
      setShowGuide(true);
      localStorage.setItem('pixelBet_guideViewed', 'true');
    }
  }, []);

  // Level Progress
  const currentLevel = LEVELS.find(l => l.level === state.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === state.level + 1);

  const handleStartRound = (isRisky: boolean) => {
    const config = getRoundConfig(state.round === 0 ? 1 : state.round);
    actions.startRound(isRisky ? config.risky : config.safe);
  };

  return (
    <div className={`relative min-h-screen bg-stone-900 text-green-400 font-pixel p-4 pb-safe flex flex-col items-center justify-center overflow-x-hidden w-full ${showCurse ? 'animate-pulse bg-red-900' : ''}`}>
      {/* Scanlines Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] crt-flicker" />
      
      {/* Vignette Overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 vignette" />

      {/* VFX: Confetti */}
      {winningCells.length > 0 && (
        <Confetti count={state.lastWin >= state.bet * 10 ? 150 : 50} />
      )}

      {/* Top Bar - Row 1: Level & Buttons */}
      <TopActionBar
        level={state.level}
        levelRank={currentLevel.rank}
        onShowGuide={() => setShowGuide(true)}
        state={state}
        actions={{
          buyTicketItem: actions.buyTicketItem,
          purchaseTalisman: actions.purchaseTalisman,
          rerollTalismanShop: actions.rerollTalismanShop,
          makePayment: actions.makePayment,
        }}
        t={t}
        toggleLocale={toggleLocale}
      />

      {/* Top Bar - Row 2: XP Bar */}
      <XPProgressBar
        currentXP={state.xp}
        currentLevelXP={currentLevel.xp}
        nextLevelXP={nextLevel?.xp ?? null}
      />

      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl text-green-400 drop-shadow-[2px_2px_0_#000] truncate">{t.title}</h1>
        <p className="text-[10px] md:text-xs text-yellow-400 tracking-widest truncate">{t.subtitle}</p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row items-start justify-center gap-4 w-full max-w-7xl relative z-10">
        
        {/* Left Panel (Tablet+) */}
        <div className="hidden md:block shrink-0 mt-20">
          <SymbolsPanel state={state} />
        </div>

        {/* Game Center */}
        <div className="flex flex-col items-center shrink-0">
          {/* Round Info Bar */}
          <RoundInfoBar state={state} />

          {/* Jackpot */}
          <div className="w-full max-w-lg bg-black border-4 border-double border-yellow-500 p-2 mb-4 text-center">
            <div className="text-[10px] text-yellow-500">◆ JACKPOT ◆</div>
            <div className="text-2xl text-yellow-400 drop-shadow-md">{state.jackpot}</div>
          </div>

          {/* 5x3 Slot Grid */}
          <div className="relative">
            {/* Payline indicator */}
            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-[8px] text-stone-500">
              {PAYLINES.map((_, i) => <div key={i}>►</div>)}
            </div>

            {/* Crystal Ball */}
            {state.ownedTalismans.includes('crystal_ball') && (
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-top-20 md:-right-4 z-20 scale-75 md:scale-100 origin-bottom md:origin-bottom-right">
                <CrystalBall grid={state.nextGrid} />
              </div>
            )}

            <SlotGrid
              grid={grid}
              winningCells={winningCells}
              reelSpinning={reelSpinning}
              showCurse={showCurse}
              lastWin={state.lastWin}
              bet={state.bet}
            />
          </div>

          {/* Message Display */}
          <div className="h-8 mb-4 text-center">
            <p className={`text-sm ${message.includes('WIN') ? 'text-yellow-400 animate-bounce' : 'text-green-400'}`}>
              {message || (isSpinning ? '...' : t.ready)}
            </p>
          </div>

          {/* Controls */}
          <GameControls
            credits={state.credits}
            spinsLeft={state.spinsLeft}
            bonusSpins={state.bonusSpins}
            currentDay={state.currentDay}
            maxDays={state.maxDays}
            isSpinning={isSpinning}
            onSpin={() => actions.spin()}
            onEndDay={actions.endDay}
            t={t}
          />

          {/* Spacer for mobile bottom safe area */}
          <div className="h-4 md:h-0" />
        </div>

        {/* Right Panel (Tablet+) */}
        <div className="hidden md:block shrink-0 mt-20">
          <PatternsPanel />
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold animate-bounce shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* BIG WIN OVERLAY */}
      {state.lastWin >= state.bet * 10 && !isSpinning && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="text-center animate-big-win">
            <h2 className="text-6xl md:text-8xl font-pixel mb-4 drop-shadow-[4px_4px_0_#000]">BIG WIN!</h2>
            <div className="text-4xl md:text-6xl text-yellow-400">+{state.lastWin}</div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PhoneCallModal state={state} onSelect={actions.selectPhoneBonus} />
      
      <RoundDifficultySelector 
        open={state.showRoundSelector} 
        onSelect={handleStartRound} 
        roundNumber={state.round === 0 ? 1 : (state.showRoundSelector && state.round > 0 ? (state.credits >= state.currentGoal ? state.round + 1 : state.round) : state.round)} 
        currentDay={state.currentDay}
        maxDays={state.maxDays}
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
