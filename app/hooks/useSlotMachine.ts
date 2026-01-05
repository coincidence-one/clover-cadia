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
  SPIN_COST,
  ITEM_KEYS,
  TICKET_ITEM_KEYS,
  getRoundConfig,
  ROUNDS,
  MAX_ROUND,
  generatePhoneChoices,
  PHONE_BONUSES,
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
export { SYMBOLS, PAYLINES, ITEMS, TICKET_ITEMS, ACHIEVEMENTS, LEVELS, ITEM_KEYS, TICKET_ITEM_KEYS, SPIN_COST };

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
    // Mercy Rule Check: If credits < cost, allow 1 free spin
    const canAfford = state.credits >= SPIN_COST;
    const isFreeSpin = state.bonusSpins > 0;
    const isMercySpin = !canAfford && !state.mercyUsed && !isFreeSpin;

    if (isSpinning || (!canAfford && !isFreeSpin && !isMercySpin)) {
      if (!isSpinning && !canAfford) setToast('NO COINS! RESTART?');
      return;
    }

    setIsSpinning(true);
    setMessage('>>> SPINNING <<<');
    setWinningCells([]);
    setToast(null);

    // Apply Cost
    let newCredits = state.credits;
    let newBonusSpins = state.bonusSpins;
    let newMercyUsed = state.mercyUsed;

    if (isFreeSpin) {
      newBonusSpins--;
    } else if (isMercySpin) {
      // Free spin provided by mercy
      setToast('MERCY SPIN! (FREE)');
      newMercyUsed = true;
    } else {
      // Normal spin
      newCredits -= SPIN_COST;
      // Reset mercy if we can afford again (logic: if we win this spin, we are back in game)
      // Actually we set mercyUsed to false only when credits >= SPIN_COST?
      // Let's reset it if newCredits >= SPIN_COST to handle edge cases, but mainly it resets on successful win
    }

    // Decrease Spins Left (Deadline)
    const newSpinsLeft = Math.max(0, state.spinsLeft - 1);

    updateState({
      credits: newCredits,
      bonusSpins: newBonusSpins,
      spinsLeft: newSpinsLeft,
      mercyUsed: newMercyUsed
    });

    // Check Game Over (if 0 spins left and not enough credits)
    // We check this AFTER win calculation usually, but spinsLeft hits 0 now.
    // Real check happens at end of spin.

    // Generate new grid
    // Check for probability buffs from phone bonuses OR active ticket items

    // Lucky Charm (Active Ticket Item) boosts Clover/Rare
    const boostClover = (state.activeTicketEffects['luckyCharm'] || 0) > 0;

    // Custom weighted random wrapper for bonuses
    const getSymbolWithBonuses = () => {
      const symbol = getWeightedRandomSymbol(boostClover);
      // Apply permanent probability buffs (Phone Bonuses)
      // This is a simplified implementation - in reality we should adjust weights
      // Here we just re-roll if we hit a buffed symbol's target

      // Example: Buff Cherry -> If !Cherry, 2% chance to force Cherry
      if (state.activeBonuses.includes('buff_cherry_up') && symbol.id !== 'cherry' && Math.random() < 0.02) return SYMBOLS.find(s => s.id === 'cherry')!;
      if (state.activeBonuses.includes('buff_lemon_up') && symbol.id !== 'lemon' && Math.random() < 0.02) return SYMBOLS.find(s => s.id === 'lemon')!;
      if (state.activeBonuses.includes('buff_clover_up') && symbol.id !== 'clover' && Math.random() < 0.02) return SYMBOLS.find(s => s.id === 'clover')!;
      if (state.activeBonuses.includes('buff_bell_up') && symbol.id !== 'bell' && Math.random() < 0.02) return SYMBOLS.find(s => s.id === 'bell')!;
      if (state.activeBonuses.includes('buff_seven_up') && symbol.id !== 'seven' && Math.random() < 0.01) return SYMBOLS.find(s => s.id === 'seven')!;

      // Risk: Devil Deal (666 up, 777 up)
      if (state.activeBonuses.includes('risk_cursed_luck')) {
        if (symbol.id !== 'six' && Math.random() < 0.01) return SYMBOLS.find(s => s.id === 'six')!;
        if (symbol.id !== 'seven' && Math.random() < 0.02) return SYMBOLS.find(s => s.id === 'seven')!;
      }

      return symbol;
    };

    let newGrid = Array(15).fill('').map(() =>
      getSymbolWithBonuses().icon
    );

    // Apply wild card effect (Consumable trigger)
    // We check if wildCard active effect is > 0 (set by useTicketItem)
    if ((state.activeTicketEffects['wildCard'] || 0) > 0) {
      newGrid = addWildToGrid(newGrid);
      // Consume the effect
      const newActive = { ...state.activeTicketEffects };
      delete newActive['wildCard'];
      updateState({ activeEffects: { ...state.activeEffects, wildCard: false }, activeTicketEffects: newActive });
    }

    // Animate spinning
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 50));
      setGrid(Array(15).fill('').map(() => getWeightedRandomSymbol().icon));
    }

    setGrid(newGrid);

    // Check for 666 curse
    if (hasCurse(newGrid)) {
      // Check for Shield (in Ticket Items inventory)
      if ((state.ticketItems['shield'] || 0) > 0) {
        // Shield blocks curse (Consume 1 shield)
        playSound('win');
        setMessage('✝️ SHIELD BLOCKED 666!');
        updateState({ ticketItems: { ...state.ticketItems, shield: state.ticketItems['shield'] - 1 } });
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

    // Calculate wins - CloverPit style (no bet multiplier)
    let totalWin = 0;
    const allWinningCells: number[] = [];

    for (const payline of PAYLINES) {
      const win = checkPaylineWin(newGrid, payline);
      if (win) {
        const symbol = SYMBOLS.find(s => s.icon === win.symbol);
        if (symbol && symbol.value > 0) {
          // Win = symbol value × (matches - 2) multiplier
          // 3 matches = 1x, 4 matches = 2x, 5 matches = 3x
          const matchMultiplier = win.matches - 2;
          let lineWin = symbol.value * matchMultiplier * 10; // Base 10x for visibility

          // Apply Glass Cannon Risk (All wins x1.5)
          if (state.activeBonuses.includes('risk_glass_cannon')) {
            lineWin = Math.floor(lineWin * 1.5);
          }

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
    const currentState = stateRef.current; // Ref to get latest state during async
    newCredits = currentState.credits + totalWin; // Use updated newCredits
    const newTotalSpins = currentState.totalSpins + 1;
    const newTotalWins = totalWin > 0 ? currentState.totalWins + 1 : currentState.totalWins;

    // Check Game Over Condition
    if (newSpinsLeft <= 0 && newCredits < state.currentGoal) {
      updateState({
        credits: newCredits,
        lastWin: totalWin,
        totalSpins: newTotalSpins,
        totalWins: newTotalWins,
        gameOver: true
      });
      playSound('lose');
      setMessage('☠️ GAME OVER - OUT OF SPINS! ☠️');
      setIsSpinning(false);
      return;
    }

    updateState({
      credits: newCredits,
      lastWin: totalWin,
      totalSpins: newTotalSpins,
      totalWins: newTotalWins,
    });

    // Decrease active ticket item durations (counters)
    const nextActiveEffects = { ...state.activeTicketEffects };
    let effectsChanged = false;

    Object.keys(nextActiveEffects).forEach(key => {
      if (nextActiveEffects[key] > 0) {
        nextActiveEffects[key]--;
        effectsChanged = true;
        if (nextActiveEffects[key] <= 0) delete nextActiveEffects[key];
      }
    });

    if (effectsChanged) {
      // We need to merge this update with previous updateState or call it again.
      // Since stateRef is used constraints, we can chain or include in next render.
      // But `updateState` merges.
      updateState({ activeTicketEffects: nextActiveEffects });
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

    // Reset Mercy if we profited (simple check: if credits now >= cost)
    if (state.mercyUsed && newCredits >= SPIN_COST) {
      updateState({ mercyUsed: false });
    }

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
      case 'hotStreak':
        // Hot Streak adds to SPINS LEFT (Deadline extension)
        updateState({
          items: newItems,
          spinsLeft: state.spinsLeft + 5
        });
        playSound('buy');
        return; // Early return because updateState is called
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
        case 'wildCard':
          // Wild Card: Activates for Next Spin (Duration 1)
          updateState({
            ticketItems: newTicketItems,
            activeTicketEffects: { ...state.activeTicketEffects, wildCard: 1 }
          });
          setToast('🃏 NEXT SPIN WILD!');
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

  const nextRound = () => {
    if (state.credits < state.currentGoal) return;

    // Instead of advancing immediately, Trigger Phone Call
    // Check if curse triggered this round? (Simplification: just random/luck based for now in generation)
    const choices = generatePhoneChoices(state.round, false);

    updateState({
      showPhoneModal: true,
      currentPhoneChoices: choices
    });

    playSound('jackpot'); // Ring ring sound placeholder
  };

  const selectPhoneBonus = (bonusId: string) => {
    const bonus = PHONE_BONUSES.find(b => b.id === bonusId);
    if (!bonus) return;

    // Apply immediate credit bonuses if any (rare special)
    // Then queue next round selection

    updateState({
      activeBonuses: [...state.activeBonuses, bonus.id],
      showPhoneModal: false,
      showRoundSelector: true, // Trigger Round Difficulty Selection
    });

    setToast(`${bonus.icon} ${bonus.name} SELECTED!`);
  };

  const startRound = (isRisky: boolean) => {
    const nextRoundNum = state.round > 0 ? state.round + 1 : 1;
    const spins = isRisky ? 3 : 7;
    const tickets = isRisky ? 2 : 1;

    // Get Round Config but override spins
    const config = getRoundConfig(nextRoundNum);

    updateState({
      round: nextRoundNum,
      currentGoal: config.goal,
      spinsLeft: spins,
      maxSpins: spins,
      roundRewardTickets: tickets,
      gameOver: false,
      showRoundSelector: false,
      // If Round 1, reset credits to initial 100? No, carry over or standard init.
      // But if we are calling this from INITIAL_GAME_STATE, we are fine.
    });

    playSound('start');
    setMessage(`ROUND ${nextRoundNum} START!`);
  };

  const restartGame = () => {
    // Reset to initial state but maybe keep achievements?
    // For now, full reset
    // We need to reload initial state
    setState(INITIAL_GAME_STATE);
    // Clear local storage logic handled by updateState but careful with partials
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload(); // Simple reload to ensure clean state
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
      nextRound,
      selectPhoneBonus,
      startRound,
      restartGame,
    },
  };
}
