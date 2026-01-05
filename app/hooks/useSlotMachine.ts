'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
import type { GameState } from '@/app/types';

// Constants
import {
  SYMBOLS,
  PAYLINES,
  ITEMS,
  TICKET_ITEMS,
  ACHIEVEMENTS,
  LEVELS,
  DAILY_REWARDS,
  INITIAL_GAME_STATE,
  STORAGE_KEY,
  ITEM_KEYS,
  TICKET_ITEM_KEYS,
} from '@/app/constants';

// Utils
import { audioEngine } from '@/app/utils/audio';
import {
  getWeightedRandomSymbol,
  getInitialGrid,
  addWildToGrid,
  hasCurse,
  checkPaylineWin,
} from '@/app/utils/gameHelpers';

// Re-export constants for component usage
export { SYMBOLS, PAYLINES, ITEMS, TICKET_ITEMS, ACHIEVEMENTS, LEVELS, ITEM_KEYS, TICKET_ITEM_KEYS };

// ===== HOOK =====
export function useSlotMachine() {
  // State
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('PRESS SPIN!');
  const [grid, setGrid] = useState<string[]>(getInitialGrid());
  const [isHydrated, setIsHydrated] = useState(false);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showCurse, setShowCurse] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Helper: Update state
  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Helper: Play sound
  const playSound = useCallback((type: Parameters<typeof audioEngine.play>[0]) => {
    audioEngine.play(type);
  }, []);

  // Load saved game
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {
        console.error('Failed to load saved game');
      }
    }
  }, []);

  // Daily bonus check
  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (state.lastDailyBonus !== today) {
      const newStreak = state.lastDailyBonus === yesterday ? state.dailyStreak : 0;
      updateState({ dailyStreak: newStreak });
      setShowDailyBonus(true);
    }
  }, []);

  // ===== ACTIONS =====

  const spin = async () => {
    if (isSpinning || state.credits < state.bet) {
      playSound('error');
      return;
    }

    setIsSpinning(true);
    setWinningCells([]);
    setMessage('>>> SPINNING <<<');
    playSound('spin');

    // Deduct bet (or use bonus spin)
    const useBonus = state.bonusSpins > 0;
    if (!useBonus) {
      updateState({ credits: state.credits - state.bet });
    } else {
      updateState({ bonusSpins: state.bonusSpins - 1 });
    }

    // Generate new grid
    let newGrid = Array(15).fill('').map(() =>
      getWeightedRandomSymbol(state.activeEffects.luckyCharm > 0).icon
    );

    // Apply wild card effect
    if (state.activeEffects.wildCard) {
      newGrid = addWildToGrid(newGrid);
      updateState({ activeEffects: { ...state.activeEffects, wildCard: false } });
    }

    // Animate spinning
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 50));
      setGrid(Array(15).fill('').map(() => getWeightedRandomSymbol().icon));
    }

    setGrid(newGrid);

    // Check for 666 curse
    if (hasCurse(newGrid)) {
      if (state.activeEffects.shield) {
        // Shield blocks curse
        playSound('win');
        setMessage('✝️ SHIELD BLOCKED 666!');
        updateState({ activeEffects: { ...state.activeEffects, shield: false } });
        unlockAchievement('survivor');
      } else {
        // Curse triggers
        playSound('curse');
        setShowCurse(true);
        setMessage('☠️ 666 CURSE! ALL COINS LOST!');
        setTimeout(() => setShowCurse(false), 2000);
        updateState({ credits: 0 });
        unlockAchievement('cursed');
        setIsSpinning(false);
        return;
      }
    }

    // Calculate wins
    let totalWin = 0;
    const allWinningCells: number[] = [];

    for (const payline of PAYLINES) {
      const win = checkPaylineWin(newGrid, payline);
      if (win) {
        const symbol = SYMBOLS.find(s => s.icon === win.symbol);
        if (symbol && symbol.value > 0) {
          const lineWin = symbol.value * state.bet * (win.matches - 2);
          totalWin += lineWin;
          allWinningCells.push(...win.cells);
        }
      }
    }

    // Apply double star effect
    if (totalWin > 0 && state.activeEffects.doubleStar) {
      totalWin *= 2;
      updateState({ activeEffects: { ...state.activeEffects, doubleStar: false } });
    }

    // Apply coin magnet passive
    if (totalWin > 0 && state.passiveEffects.coinMagnet) {
      totalWin = Math.floor(totalWin * 1.1);
    }

    setWinningCells([...new Set(allWinningCells)]);

    // Update state with results
    const currentState = stateRef.current;
    const newCredits = currentState.credits + totalWin;
    const newTotalSpins = currentState.totalSpins + 1;
    const newTotalWins = totalWin > 0 ? currentState.totalWins + 1 : currentState.totalWins;

    updateState({
      credits: newCredits,
      lastWin: totalWin,
      totalSpins: newTotalSpins,
      totalWins: newTotalWins,
    });

    // Decrease lucky charm counter
    if (state.activeEffects.luckyCharm > 0) {
      updateState({ activeEffects: { ...state.activeEffects, luckyCharm: state.activeEffects.luckyCharm - 1 } });
    }

    // Set message and play sound
    if (totalWin > 0) {
      playSound(totalWin >= state.bet * 10 ? 'jackpot' : 'win');
      setMessage(`🎉 YOU WON ${totalWin} COINS!`);
      addXP(Math.floor(totalWin / 10));
      if (newTotalWins === 1) unlockAchievement('firstWin');
    } else {
      playSound('lose');
      setMessage('TRY AGAIN...');
      addXP(5);
    }

    // Check achievements
    if (newTotalSpins >= 100) unlockAchievement('spin100');
    if (newTotalSpins >= 500) unlockAchievement('spin500');
    if (newCredits >= 10000) unlockAchievement('rich');

    setIsSpinning(false);
  };

  const addXP = (amount: number) => {
    const newXP = state.xp + amount;
    const nextLevel = LEVELS.find(l => l.level === state.level + 1);

    if (nextLevel && newXP >= nextLevel.xp) {
      const newLevel = state.level + 1;
      const reward = newLevel * 100;
      updateState({ credits: state.credits + reward, level: newLevel, xp: newXP });
      playSound('levelup');
      setShowLevelUp(true);
    } else {
      updateState({ xp: newXP });
    }
  };

  const useItem = (itemName: string) => {
    if (isSpinning || state.items[itemName] <= 0) return;

    const newItems = { ...state.items, [itemName]: state.items[itemName] - 1 };
    const newEffects = { ...state.activeEffects };
    let newBonus = state.bonusSpins;

    switch (itemName) {
      case 'luckyCharm': newEffects.luckyCharm = 3; break;
      case 'doubleStar': newEffects.doubleStar = true; break;
      case 'hotStreak': newBonus += 5; break;
      case 'shield': newEffects.shield = true; break;
      case 'wildCard': newEffects.wildCard = true; break;
    }

    playSound('buy');
    updateState({ items: newItems, activeEffects: newEffects, bonusSpins: newBonus });
  };

  const buyItem = (itemName: string) => {
    const item = ITEMS[itemName];
    if (!item || state.credits < item.price) {
      playSound('error');
      return;
    }
    const newItems = { ...state.items, [itemName]: state.items[itemName] + 1 };
    updateState({ credits: state.credits - item.price, items: newItems });
    playSound('buy');
  };

  const buyTicketItem = (itemName: string) => {
    const item = TICKET_ITEMS[itemName];
    if (!item || state.tickets < item.price) {
      playSound('error');
      return;
    }

    const newTickets = state.tickets - item.price;

    if (item.type === 'passive') {
      const newPassive = { ...state.passiveEffects, [itemName]: true };
      updateState({ tickets: newTickets, passiveEffects: newPassive });
      setToast(`${item.icon} ${item.name} ACQUIRED!`);
    } else {
      const newTicketItems = { ...state.ticketItems, [itemName]: (state.ticketItems[itemName] || 0) + 1 };
      updateState({ tickets: newTickets, ticketItems: newTicketItems });
    }

    playSound('buy');
    setTimeout(() => setToast(null), 2000);
  };

  const useTicketItem = (itemName: string) => {
    if (isSpinning) return;
    const item = TICKET_ITEMS[itemName];
    if (!item || item.type === 'passive') return;
    if ((state.ticketItems[itemName] || 0) <= 0) return;

    const newTicketItems = { ...state.ticketItems, [itemName]: state.ticketItems[itemName] - 1 };

    if (item.type === 'active' && item.duration) {
      const newActive = { ...state.activeTicketEffects, [itemName]: item.duration };
      updateState({ ticketItems: newTicketItems, activeTicketEffects: newActive });
      setToast(`${item.icon} ACTIVE FOR ${item.duration} SPINS!`);
    } else if (item.type === 'consumable') {
      switch (itemName) {
        case 'instantJackpot':
          updateState({ ticketItems: newTicketItems, credits: state.credits + 500 });
          setToast('💎 +500 COINS!');
          break;
        case 'curseAbsorb':
          updateState({ ticketItems: newTicketItems });
          setToast('💀 CURSE ABSORB READY!');
          break;
        case 'rerollSpin':
          updateState({ ticketItems: newTicketItems });
          setToast('🔄 REROLL READY!');
          break;
        default:
          updateState({ ticketItems: newTicketItems });
      }
    }

    playSound('buy');
    setTimeout(() => setToast(null), 2000);
  };

  const unlockAchievement = (id: string) => {
    if (state.achievements[id]) return;
    const a = ACHIEVEMENTS.find(ac => ac.id === id);
    if (!a) return;

    const newAch = { ...state.achievements, [id]: true };
    updateState({ achievements: newAch, credits: state.credits + a.reward });
    playSound('levelup');
    setToast(`${a.icon} ${a.name}!`);
    setTimeout(() => setToast(null), 3000);
  };

  const claimDaily = () => {
    const today = new Date().toDateString();
    const reward = DAILY_REWARDS[Math.min(state.dailyStreak, DAILY_REWARDS.length - 1)] || 100;

    updateState({
      credits: state.credits + reward,
      lastDailyBonus: today,
      dailyStreak: state.dailyStreak + 1
    });
    setShowDailyBonus(false);
    playSound('jackpot');
  };

  const changeBet = (delta: number) => {
    const newBet = Math.max(10, Math.min(100, state.bet + delta));
    updateState({ bet: newBet });
    playSound('click');
  };

  return {
    state,
    isSpinning,
    message,
    grid,
    winningCells,
    showLevelUp,
    setShowLevelUp,
    showDailyBonus,
    setShowDailyBonus,
    showCurse,
    toast,
    actions: {
      spin,
      changeBet,
      useItem,
      buyItem,
      buyTicketItem,
      useTicketItem,
      claimDaily,
      playSound,
    },
  };
}
