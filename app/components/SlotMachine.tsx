'use client';

import React from 'react';
import { useSlotMachine, ACHIEVEMENTS, LEVELS, PAYLINES, SYMBOLS } from '@/app/hooks/useSlotMachine';
import { getRoundConfig } from '@/app/constants/rounds';
import { useLocale } from '@/app/contexts/LocaleContext';
import { Button } from '@/components/ui/8bit/button';
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
import { TalismanShop } from '@/app/components/slot-machine/TalismanShop';
import { PaymentCenter } from './slot-machine/PaymentCenter';
import { CrystalBall } from './slot-machine/CrystalBall';
import { Confetti } from './slot-machine/Confetti';
import { UserMenu } from './auth/UserMenu';
import { useUnlockedItems } from '@/app/hooks/useUnlockedItems';

export default function SlotMachine() {
  const { unlockedItems } = useUnlockedItems();
  const { state, isSpinning, reelSpinning, message, grid, winningCells, showLevelUp, setShowLevelUp, showCurse, toast, actions } = useSlotMachine({ unlockedIds: unlockedItems });
  const { t, toggleLocale } = useLocale();
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
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



  // Get translated achievement
  const getAchievementTranslation = (id: string) => {
    const achKey = id as keyof typeof t.achievements;
    return t.achievements[achKey] || { name: id, desc: '' };
  };

  const handleStartRound = (isRisky: boolean) => {
    const config = getRoundConfig(state.round === 0 ? 1 : state.round);
    actions.startRound(isRisky ? config.risky : config.safe);
  };


  return (
    <div className={`relative min-h-screen bg-stone-900 text-green-400 font-pixel p-4 pb-safe flex flex-col items-center justify-center overflow-x-hidden w-full ${showCurse ? 'animate-pulse bg-red-900' : ''}`}>
      {/* Scanlines Overlay - z-0 to be background level but above bg color */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] crt-flicker" />
      
      {/* Vignette Overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 vignette" />

      {/* VFX: Confetti */}

      {/* VFX: Confetti */}
      {winningCells.length > 0 && (
         <Confetti count={state.lastWin >= state.bet * 10 ? 150 : 50} />
      )}

      {/* Panels moved to Flex Layout below */}

      {/* Top Bar - Row 1: Level & Buttons */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-2 gap-1 md:gap-2">
        {/* Level Badge - Compact on Mobile */}
        <Badge variant="default" className="bg-purple-600 text-yellow-400 text-[10px] md:text-xs px-2 md:px-4 py-1 md:py-2 shrink-0 truncate max-w-[100px] md:max-w-none">
          <span className="md:hidden">LV.{state.level}</span>
          <span className="hidden md:inline">{currentLevel.rank} {t.level}{state.level}</span>
        </Badge>
        
        {/* Buttons Group - Scrollable on mobile */}
        <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar pb-1 max-w-[200px] md:max-w-none items-center">
           {/* User Menu (Login/Profile) */}
           <UserMenu />

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
            <PaytableModal state={state} />
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

          {/* TalismanShop */}
          {/* TalismanShop */}
          <TalismanShop
            tickets={state.tickets}
            credits={state.credits}
            ownedTalismans={state.ownedTalismans}
            shopTalismans={state.shopTalismans || []} // Fallback for old state
            rerollCost={state.shopRerollCost}
            maxSlots={state.talismanSlots}
            onPurchase={actions.purchaseTalisman}
            onReroll={actions.rerollTalismanShop}
          />

          {/* Payment Center */}
          <PaymentCenter
            credits={state.credits}
            currentDebt={state.currentDebt}
            paidAmount={state.paidAmount}
            deadlineTurn={state.deadlineTurn}
            currentTurn={state.currentTurn}
            earlyPaymentBonus={state.earlyPaymentBonus}
            onPayment={actions.makePayment}
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
      <div className="text-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl text-green-400 drop-shadow-[2px_2px_0_#000] truncate">{t.title}</h1>
        <p className="text-[10px] md:text-xs text-yellow-400 tracking-widest truncate">{t.subtitle}</p>
      </div>

      {/* Main Content Area: Flex Row on Tablet+ */}
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

      {/* 5x3 Slot Grid (CloverPit Style) */}
      <div className={`relative bg-stone-800 p-3 border-4 border-white mb-4 ${showCurse ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]' : winningCells.length > 0 ? (
        state.lastWin >= state.bet * 10 ? 'win-tier-jackpot' : 
        state.lastWin >= state.bet * 5 ? 'win-tier-3' : 
        state.lastWin >= state.bet * 2 ? 'win-tier-2' : 
        'win-tier-1'
      ) : ''}`}>
        {/* Payline indicator */}
        <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-[8px] text-stone-500">
             {PAYLINES.map((_, i) => <div key={i}>►</div>)}
        </div>

        {/* Crystal Ball (Absolute Positioned - Centered on Mobile to prevent overflow, Right on Desktop) */}
        {state.ownedTalismans.includes('crystal_ball') && (
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-top-20 md:-right-4 z-20 scale-75 md:scale-100 origin-bottom md:origin-bottom-right">
              <CrystalBall grid={state.nextGrid} />
            </div>
        )}

        <div className="grid grid-cols-5 gap-1 bg-black p-1">
          {grid.map((cell, i) => {
            const col = i % 5;
            const isColSpinning = reelSpinning[col];
            const isWinning = winningCells.includes(i);
            
            return (
              <div 
                key={i} 
                className={`
                  w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl bg-stone-900 border 
                  ${isColSpinning 
                    ? 'border-stone-800 text-stone-600 blur-[2px] scale-90 translate-y-1' 
                    : isWinning 
                      ? 'border-yellow-400 bg-yellow-900/50 animate-bounce z-10' 
                      : 'border-stone-700'
                  }
                  transition-all duration-100 overflow-hidden relative
                `}
              >
                {/* Spin Reel Effect Layer (Fake Scrolling Strip) */}
                {isColSpinning && (
                   <div className="absolute inset-0 overflow-hidden bg-stone-900 z-20 rounded-md">
                      <div className="flex flex-col items-center animate-scroll">
                         {/* Strip A */}
                         {SYMBOLS.map((s, idx) => (
                           <div key={`a-${idx}`} className="h-12 md:h-16 w-full flex items-center justify-center p-2">
                             <img src={s.icon} alt={s.id} className="w-full h-full object-contain" />
                           </div>
                         ))}
                         {/* Strip B (Loop) */}
                         {SYMBOLS.map((s, idx) => (
                           <div key={`b-${idx}`} className="h-12 md:h-16 w-full flex items-center justify-center p-2">
                             <img src={s.icon} alt={s.id} className="w-full h-full object-contain" />
                           </div>
                         ))}
                      </div>
                   </div>
                )}
                
                {/* Actual Symbol (Hidden or Blurred when spinning) */}
                <div className={isColSpinning ? 'opacity-0' : 'opacity-100 scale-100 transition-transform duration-200 w-full h-full p-2 flex items-center justify-center'}>
                   <img src={cell} alt="symbol" className="w-full h-full object-contain" />
                </div>
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
            {/* Spin Cost Display -> Spins Left */}
             <div className="flex-1 bg-black border-2 border-stone-600 p-2 text-center">
                <div className="text-[10px] text-stone-400">{t.spins || "SPINS LEFT"}</div>
                <div className={`text-xl ${state.spinsLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                  {(typeof state.spinsLeft !== 'number' || isNaN(state.spinsLeft)) ? 0 : state.spinsLeft}
                </div>
            </div>
         </div>

          {state.spinsLeft <= 0 ? (
             <Button 
               className="w-full h-16 text-xl md:text-2xl tracking-widest bg-blue-700 hover:bg-blue-600 border-b-4 border-blue-900 active:border-b-0 active:mt-1 animate-pulse"
               onClick={actions.endDay}
             >
               {state.currentDay >= state.maxDays ? '💀 CHECK DEADLINE 💀' : `🌙 FINISH DAY ${state.currentDay}`}
             </Button>
          ) : (
             <Button 
               className={`w-full h-16 text-2xl tracking-widest ${isSpinning ? 'bg-stone-700' : 'bg-red-600 hover:bg-red-500'} border-b-4 border-red-800 active:border-b-0 active:mt-1`}
               onClick={() => actions.spin()}
               disabled={isSpinning}
             >
               {isSpinning ? '...' : state.bonusSpins > 0 ? `FREE SPIN (${state.bonusSpins})` : `SPIN`}
             </Button>
          )}
      </div>

       {/* Spacer for mobile bottom safe area */}
       <div className="h-4 md:h-0" />
     </div> {/* End Game Center */}

       {/* Right Panel (Tablet+) */}
       <div className="hidden md:block shrink-0 mt-20">
          <PatternsPanel />
       </div>

      </div> {/* End Main Content Flex */}

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

      {/* Separated Modals */}
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
