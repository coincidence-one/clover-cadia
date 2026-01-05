'use client';

import React from 'react';
import { useSlotMachine, ITEMS, ACHIEVEMENTS, LEVELS, ITEM_KEYS, PAYLINES, TICKET_ITEMS, TICKET_ITEM_KEYS, SPIN_COST } from '@/app/hooks/useSlotMachine';
import { useLocale } from '@/app/contexts/LocaleContext';
import { Button } from '@/components/ui/8bit/button';
import { Card } from '@/components/ui/8bit/card';
import { Badge } from '@/components/ui/8bit/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/8bit/dialog';

export default function SlotMachine() {
  const { state, isSpinning, message, grid, winningCells, showLevelUp, setShowLevelUp, showDailyBonus, setShowDailyBonus, showCurse, toast, actions } = useSlotMachine();
  const { t, toggleLocale } = useLocale();

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

      {/* Top Bar - Row 1: Level & Buttons */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-2 gap-2">
        {/* Level Badge */}
        <Badge variant="default" className="bg-purple-600 text-yellow-400 text-xs px-4 py-2 shrink-0">
          {currentLevel.rank} {t.level}{state.level}
        </Badge>
        
        {/* Buttons */}
        <div className="flex gap-2">
          {/* Language Toggle */}
          <Button variant="outline" className="h-10 w-14 text-xs px-2" onClick={toggleLocale}>
            {t.language}
          </Button>

          {/* Shop Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 w-16 text-xs px-2">{t.shop}</Button>
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
              <Button variant="outline" className="h-10 w-12 text-xs">🏆</Button>
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

          {/* Ticket Shop Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 px-3 text-xs bg-yellow-900 border-yellow-500 text-yellow-400">
                🎟️ {state.tickets}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-stone-800 border-4 border-yellow-500 text-white h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-yellow-400 text-center text-xl">🎟️ TICKET SHOP</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="text-center border-2 border-yellow-500 p-2 text-yellow-400 text-lg">
                  🎟️ TICKETS: {state.tickets}
                </div>
                
                {/* Passive Items */}
                <div className="text-center text-purple-400 text-xs border-b border-purple-400 pb-1">🟣 PASSIVE (PERMANENT)</div>
                {TICKET_ITEM_KEYS.filter(k => TICKET_ITEMS[k].type === 'passive').map((key) => {
                  const item = TICKET_ITEMS[key];
                  const owned = state.passiveEffects[key];
                  return (
                    <div key={key} className={`flex items-center justify-between bg-black p-2 border ${owned ? 'border-purple-400' : 'border-white'}`}>
                      <div className="text-2xl mr-3">{item.icon}</div>
                      <div className="flex-1">
                        <div className="text-xs text-white">{item.name}</div>
                        <div className="text-[10px] text-purple-400">{item.desc}</div>
                      </div>
                      {owned ? (
                        <span className="text-green-400 text-xs">✓ OWNED</span>
                      ) : (
                        <Button size="sm" onClick={() => actions.buyTicketItem(key)} disabled={state.tickets < item.price}>
                          🎟️{item.price}
                        </Button>
                      )}
                    </div>
                  );
                })}

                {/* Active Items */}
                <div className="text-center text-green-400 text-xs border-b border-green-400 pb-1 mt-2">🟢 ACTIVE ({TICKET_ITEMS.scatterBoost.duration} SPINS)</div>
                {TICKET_ITEM_KEYS.filter(k => TICKET_ITEMS[k].type === 'active').map((key) => {
                  const item = TICKET_ITEMS[key];
                  const count = state.ticketItems[key] || 0;
                  return (
                    <div key={key} className="flex items-center justify-between bg-black p-2 border border-white">
                      <div className="text-2xl mr-3">{item.icon}</div>
                      <div className="flex-1">
                        <div className="text-xs text-white">{item.name} <span className="text-green-400">x{count}</span></div>
                        <div className="text-[10px] text-green-400">{item.desc}</div>
                      </div>
                      <Button size="sm" onClick={() => actions.buyTicketItem(key)} disabled={state.tickets < item.price}>
                        🎟️{item.price}
                      </Button>
                    </div>
                  );
                })}

                {/* Consumable Items */}
                <div className="text-center text-cyan-400 text-xs border-b border-cyan-400 pb-1 mt-2">🔵 CONSUMABLE (ONE-TIME)</div>
                {TICKET_ITEM_KEYS.filter(k => TICKET_ITEMS[k].type === 'consumable').map((key) => {
                  const item = TICKET_ITEMS[key];
                  const count = state.ticketItems[key] || 0;
                  return (
                    <div key={key} className="flex items-center justify-between bg-black p-2 border border-white">
                      <div className="text-2xl mr-3">{item.icon}</div>
                      <div className="flex-1">
                        <div className="text-xs text-white">{item.name} <span className="text-cyan-400">x{count}</span></div>
                        <div className="text-[10px] text-cyan-400">{item.desc}</div>
                      </div>
                      <Button size="sm" onClick={() => actions.buyTicketItem(key)} disabled={state.tickets < item.price}>
                        🎟️{item.price}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top Bar - Row 2: XP Progress Bar */}
      <div className="w-full max-w-2xl mb-4">
        <div className="w-full h-7 bg-black border-2 border-white flex items-center justify-center">
          <span className="text-xs text-white whitespace-nowrap">
            {state.xp} / {nextLevel?.xp || 'MAX'} {t.xp}
          </span>
        </div>
        <div className="w-full h-2 bg-black border-x-2 border-b-2 border-white">
          <div className="h-full bg-purple-600 transition-all" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-6 animate-pulse">
        <h1 className="text-3xl text-green-400 drop-shadow-[2px_2px_0_#000]">LUCKY CLOVER</h1>
        <p className="text-xs text-yellow-400 tracking-widest">★ PIXEL SLOTS ★</p>
      </div>

      {/* Round Info Bar */}
      <div className="w-full max-w-lg flex gap-2 mb-4">
        <div className="flex-1 bg-purple-900 border-2 border-purple-400 p-2 text-center">
            <div className="text-[10px] text-purple-200">ROUND</div>
            <div className="text-xl text-white">{state.round}</div>
        </div>
        <div className={`flex-1 border-2 p-2 text-center ${state.credits >= state.currentGoal ? 'bg-green-900 border-green-400 animate-pulse' : 'bg-black border-white'}`}>
            <div className="text-[10px] text-gray-400">GOAL</div>
            <div className={`text-xl ${state.credits >= state.currentGoal ? 'text-green-400' : 'text-white'}`}>
                {state.currentGoal}
            </div>
        </div>
        <div className={`flex-1 border-2 p-2 text-center ${state.spinsLeft <= 3 ? 'bg-red-900 border-red-500 animate-pulse' : 'bg-black border-white'}`}>
            <div className="text-[10px] text-gray-400">SPINS LEFT</div>
            <div className={`text-xl ${state.spinsLeft <= 3 ? 'text-red-500' : 'text-white'}`}>
                {state.spinsLeft}/{state.maxSpins}
            </div>
        </div>
      </div>

      {/* Jackpot */}
      <div className="w-full max-w-lg bg-black border-4 border-double border-yellow-500 p-2 mb-4 text-center">
        <div className="text-[10px] text-yellow-500">◆ JACKPOT ◆</div>
        <div className="text-2xl text-yellow-400 drop-shadow-md">{state.jackpot}</div>
      </div>

      {/* Round Clear Modal */}
      <Dialog open={state.credits >= state.currentGoal && !state.gameOver} onOpenChange={() => {}}>
        <DialogContent className="bg-green-900 border-4 border-green-400 text-center pointer-events-auto">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl animate-bounce">🎉 ROUND CLEARED! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-white">
             <p className="mb-4">GOAL REACHED!</p>
             <div className="text-3xl mb-2">🎟️ REWARD READY</div>
             <p className="text-xs text-green-200">Advance to next round for harder challenge & more tickets!</p>
          </div>
          <Button className="w-full bg-yellow-500 text-black text-xl h-12 hover:bg-yellow-400" onClick={actions.nextRound}>
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
          <Button className="w-full bg-white text-black text-xl h-12 hover:bg-gray-200" onClick={actions.restartGame}>
            🔄 RESTART GAME
          </Button>
        </DialogContent>
      </Dialog>

      {/* 5x3 Slot Grid (CloverPit Style) */}
      <div className={`relative bg-stone-800 p-3 border-4 border-white mb-4 ${showCurse ? 'border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.5)]' : winningCells.length > 0 ? 'animate-pulse border-yellow-400' : ''}`}>
        {/* Payline indicator */}
        {winningCells.length > 0 && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 text-xs animate-bounce">
            ★ WIN! ★
          </div>
        )}
        
        <div className="grid grid-cols-5 gap-1">
          {grid.map((symbol, idx) => {
            const isWinning = winningCells.includes(idx);
            const isCurse = symbol === '6️⃣';
            
            return (
              <div 
                key={idx}
                className={`
                  w-12 h-12 md:w-14 md:h-14 
                  bg-black border-2 
                  flex items-center justify-center 
                  text-2xl md:text-3xl
                  transition-all duration-200
                  ${isWinning ? 'border-yellow-400 bg-yellow-900/30 scale-110 z-10' : 'border-cyan-800'}
                  ${isCurse ? 'border-red-500 bg-red-900/30' : ''}
                  ${isSpinning ? 'animate-pulse' : ''}
                `}
              >
                {symbol}
              </div>
            );
          })}
        </div>
        
        {/* 666 Curse Overlay */}
        {showCurse && (
          <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
            <div className="text-4xl text-red-500 animate-pulse">☠️ 666 ☠️</div>
          </div>
        )}
      </div>

      {/* Message */}
      <Card className="w-full max-w-2xl mb-4 bg-black border-white min-h-[50px] flex items-center justify-center">
         <span className={`text-sm text-center px-2 ${showCurse ? 'text-red-400' : winningCells.length > 0 ? 'text-yellow-400 animate-bounce' : 'text-green-400'}`}>
            {message}
         </span>
      </Card>

      {/* Item Bar */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {ITEM_KEYS.map((key) => {
            const item = ITEMS[key];
            const isActive = 
              (key === 'luckyCharm' && state.activeEffects.luckyCharm > 0) ||
              (key === 'doubleStar' && state.activeEffects.doubleStar) ||
              (key === 'shield' && state.activeEffects.shield) ||
              (key === 'wildCard' && state.activeEffects.wildCard);
            
            return (
                <div 
                    key={key} 
                    className={`
                      relative w-12 h-12 bg-stone-700 border-2 border-white 
                      flex items-center justify-center cursor-pointer 
                      hover:bg-green-700 transition-colors
                      ${state.items[key] > 0 ? '' : 'opacity-40 grayscale'}
                      ${isActive ? 'border-green-400 bg-green-800 animate-pulse' : ''}
                    `}
                    onClick={() => actions.useItem(key)}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span className="absolute bottom-0 right-0 bg-red-500 text-white text-[8px] px-1">{state.items[key]}</span>
                    {isActive && key === 'luckyCharm' && (
                      <span className="absolute top-0 left-0 bg-green-500 text-white text-[8px] px-1">{state.activeEffects.luckyCharm}</span>
                    )}
                </div>
            );
        })}
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl">
         <div className="flex gap-2 mb-2">
            <div className="flex-1 bg-black border-2 border-white p-2 text-center">
                <div className="text-[10px] text-cyan-400">{t.coins}</div>
                <div className={`text-sm ${state.credits === 0 ? 'text-red-400' : 'text-green-400'}`}>{state.credits}</div>
            </div>
            <div className="flex-1 bg-black border-2 border-white p-2 text-center">
                <div className="text-[10px] text-cyan-400">SPIN COST</div>
                <div className="text-sm text-green-400">{SPIN_COST}</div>
            </div>
            <div className="flex-1 bg-black border-2 border-white p-2 text-center">
                <div className="text-[10px] text-cyan-400">{t.win}</div>
                <div className="text-sm text-yellow-400">{state.lastWin}</div>
            </div>
            {state.bonusSpins > 0 && (
              <div className="flex-1 bg-yellow-900 border-2 border-yellow-400 p-2 text-center animate-pulse">
                <div className="text-[10px] text-yellow-400">BONUS</div>
                <div className="text-sm text-yellow-400">{state.bonusSpins}</div>
              </div>
            )}
         </div>

         <div className="flex gap-4 items-center justify-center">
             <Button 
                className={`w-40 h-14 text-xl border-4 border-white ${showCurse ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'} text-black`}
                onClick={actions.spin}
                disabled={isSpinning}
             >
                {isSpinning ? t.spinning : `${t.spin} (-${SPIN_COST})`}
             </Button>
         </div>
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
