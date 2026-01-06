'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
import type { GameState } from '@/app/types';

// Constants
import {
  INITIAL_GAME_STATE,
  STORAGE_KEY,
  SPIN_COST,
  SYMBOLS,
  PAYLINES,
  ITEMS,
  TICKET_ITEMS,
  ACHIEVEMENTS,
  LEVELS,
  ITEM_KEYS,
  TICKET_ITEM_KEYS,
} from '@/app/constants';
import { refreshTalismanShop } from '@/app/utils/gameHelpers';
import { audioEngine } from '@/app/utils/audio';

// Sub-Hooks
import { useRoundSystem } from './game/useRoundSystem';
import { useSpinLogic } from './game/useSpinLogic';
import { useGameEconomy } from './game/useEconomy';
import { useTalismanSystem } from './game/useTalismanSystem';

// Re-export constants for component usage
export { SYMBOLS, PAYLINES, ITEMS, TICKET_ITEMS, ACHIEVEMENTS, LEVELS, ITEM_KEYS, TICKET_ITEM_KEYS, SPIN_COST };

export function useSlotMachine() {
  // ===== CORE STATE =====
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [toast, setToast] = useState<string | null>(null);
  const [message, setMessage] = useState('PRESS SPIN!');

  // Modal Triggers (UI State)
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Helper: Update State & Persist
  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Helper: Audio
  const playSound = useCallback((type: Parameters<typeof audioEngine.play>[0]) => {
    audioEngine.play(type);
  }, []);

  // ===== LOAD GAME =====
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration Logic
        if (!parsed.shopTalismans || parsed.shopTalismans.length === 0) {
          parsed.shopTalismans = refreshTalismanShop(3, parsed.ownedTalismans || []);
          parsed.talismanSlots = parsed.talismanSlots || 7;
          parsed.shopRerollCost = parsed.shopRerollCost || 10;
        }
        if (!parsed.bankDeposit) parsed.bankDeposit = 0;
        if (!parsed.currentGoal) {
          const roundCfg = { spins: 25, cost: 0, rewardTickets: 1, multiplier: 1.5 }; // Default fallback
          parsed.currentGoal = 1000;
        }

        setState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Save load failed', e);
      }
    }
  }, []);


  // ===== SUB-SYSTEMS =====

  // 1. Round System (Progression, End Day)
  const roundSystem = useRoundSystem({
    state,
    updateState,
    playSound,
    setToast,
    setMessage,
    setIsSpinning: () => { }, // Not used in current impl
    setShowLevelUp,
    setShowDailyBonus
  });

  // 2. Spin Logic (Animation, Win Calc)
  const spinLogic = useSpinLogic({
    state,
    updateState,
    playSound,
    setToast,
    addXP: roundSystem.addXP,
    unlockAchievement: roundSystem.unlockAchievement,
    setMessage
  });

  // 3. Economy (Shop, Bank)
  const economy = useGameEconomy({
    state,
    isSpinning: spinLogic.isSpinning,
    updateState,
    playSound,
    setToast
  });

  // 4. Talisman System (Purchase, Reroll)
  const talismanSystem = useTalismanSystem({
    state,
    updateState,
    playSound,
    setToast
  });

  // ===== API EXPOSURE =====
  const actions = {
    ...economy,
    ...talismanSystem,
    ...roundSystem,
    spin: spinLogic.spin,
    restartGame: () => {
      // Reset Logic
      if (confirm('RESTART GAME?')) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    },
    selectPhoneBonus: (id: string) => {
      const choice = state.currentPhoneChoices.find(c => c.id === id);
      if (!choice) return;

      let newOwned = [...state.ownedTalismans];
      let newSlots = state.talismanSlots;

      if (choice.type === 'talisman') {
        newOwned.push(choice.value as string);
        setToast('새로운 부적 획득!');
      } else if (choice.type === 'talisman_slot') {
        newSlots += 1;
        setToast('부적 슬롯 +1 확장!');
      }

      updateState({
        round: state.round + 1,
        currentDay: 1,
        ownedTalismans: newOwned,
        talismanSlots: newSlots,
        showPhoneModal: false,
        showRoundSelector: true,
        spinsLeft: 0,
      });
      playSound('genie');
    },
    startRound: (config: any) => { // config: { spins, cost, rewardTickets }
      updateState({
        maxSpins: config.spins,
        spinsLeft: config.spins, // Refill
        currentGoal: Math.floor(state.currentGoal * 1.5), // Increase Goal!
        // Wait, RoundSelector passes specific Goal?
        // Currently generic logic:
        showRoundSelector: false
        // Use config...
      });
      // Actually RoundDifficultySelector calls onSelect(config).
      // I need to implement startRound properly.
      // Ideally move to useRoundSystem.

      // Simple impl:
      updateState({
        spinsLeft: config.spins,
        maxSpins: config.spins,
        roundRewardTickets: config.rewardTickets,
        showRoundSelector: false,
        // Goal increase is handled where? 
        // Logic says: "Goal increases...".
        // Let's assume Goal was calculated before or Config has it?
        // Config has Cost/Spins. Not Goal.
        // We increase Goal here.
        currentGoal: Math.floor(state.currentGoal > 0 ? state.currentGoal * 1.3 : 1000)
      });

      playSound('start');
    }
  };

  return {
    state,

    // UI State
    toast,
    message,
    showLevelUp, setShowLevelUp,
    showDailyBonus, setShowDailyBonus,
    showCurse: spinLogic.showCurse,

    // Spin Logic State
    grid: spinLogic.grid,
    winningCells: spinLogic.winningCells,
    isSpinning: spinLogic.isSpinning,
    reelSpinning: spinLogic.reelSpinning,

    // Actions
    actions
  };
}
