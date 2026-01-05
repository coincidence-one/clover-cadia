'use client';

import { useState, useEffect, useCallback } from 'react';

// ===== CLOVERPIT STYLE SYMBOLS & PROBABILITIES =====
// Based on CloverPit: Cherry/Lemon(19.4%), Clover/Bell(14.9%), Diamond/Treasure(11.9%), Seven(7.5%), 6(1.5%)
export interface Symbol {
  id: string;
  icon: string;
  probability: number;
  value: number;
}

export const SYMBOLS: Symbol[] = [
  { id: 'cherry', icon: '🍒', probability: 0.194, value: 2 },
  { id: 'lemon', icon: '🍋', probability: 0.194, value: 2 },
  { id: 'clover', icon: '☘️', probability: 0.149, value: 5 },
  { id: 'bell', icon: '🔔', probability: 0.149, value: 5 },
  { id: 'diamond', icon: '💎', probability: 0.119, value: 10 },
  { id: 'treasure', icon: '💰', probability: 0.119, value: 10 },
  { id: 'seven', icon: '7️⃣', probability: 0.075, value: 25 },
  { id: 'six', icon: '6️⃣', probability: 0.015, value: -1 }, // Curse symbol
];

export type SymbolId = typeof SYMBOLS[number]['id'];

// 5x3 Grid Pattern Lines (CloverPit uses multiple paylines)
export const PAYLINES = [
  // Horizontal lines
  [0, 1, 2, 3, 4],       // Top row
  [5, 6, 7, 8, 9],       // Middle row
  [10, 11, 12, 13, 14],  // Bottom row
  // Diagonal lines (Zig-Zag)
  [0, 6, 12, 8, 4],      // V shape
  [10, 6, 2, 8, 14],     // Inverted V
  // W patterns
  [0, 6, 2, 8, 4],       // W top
  [10, 6, 12, 8, 14],    // W bottom
];

export const ITEMS: Record<string, { name: string; icon: string; price: number; desc: string }> = {
  luckyCharm: { name: 'LUCKY CHARM', icon: '🍀', price: 200, desc: '+CLOVER%' },
  doubleStar: { name: 'DOUBLE STAR', icon: '⭐', price: 150, desc: '2X WIN' },
  hotStreak: { name: 'HOT STREAK', icon: '🔥', price: 300, desc: '+5 SPINS' },
  shield: { name: 'HOLY SHIELD', icon: '✝️', price: 250, desc: 'BLOCK 666' },
  wildCard: { name: 'WILD CARD', icon: '🃏', price: 400, desc: 'ADD WILD' },
};

export const ITEM_KEYS = Object.keys(ITEMS) as Array<keyof typeof ITEMS>;

export const ACHIEVEMENTS = [
  { id: 'firstWin', name: 'FIRST WIN', desc: 'WIN ONCE', reward: 50, icon: '🏆' },
  { id: 'lucky7', name: 'LUCKY SEVEN', desc: 'HIT 7x3', reward: 200, icon: '7️⃣' },
  { id: 'jackpotHunter', name: 'JACKPOT', desc: 'HIT 7x5', reward: 1000, icon: '💎' },
  { id: 'spin100', name: '100 SPINS', desc: 'SPIN 100X', reward: 300, icon: '🎰' },
  { id: 'spin500', name: '500 SPINS', desc: 'SPIN 500X', reward: 1000, icon: '🎲' },
  { id: 'rich', name: 'HIGH ROLLER', desc: '10000 COINS', reward: 500, icon: '💰' },
  { id: 'survivor', name: 'SURVIVOR', desc: 'SURVIVE 666', reward: 300, icon: '✝️' },
  { id: 'cursed', name: 'CURSED', desc: 'HIT 666', reward: 100, icon: '😈' },
];

export const LEVELS = [
  { level: 1, xp: 0, rank: '🥉', name: 'BRONZE' },
  { level: 2, xp: 100, rank: '🥉', name: 'BRONZE' },
  { level: 3, xp: 250, rank: '🥉', name: 'BRONZE' },
  { level: 4, xp: 450, rank: '🥉', name: 'BRONZE' },
  { level: 5, xp: 700, rank: '🥈', name: 'SILVER' },
  { level: 6, xp: 1000, rank: '🥈', name: 'SILVER' },
  { level: 7, xp: 1400, rank: '🥈', name: 'SILVER' },
  { level: 8, xp: 1900, rank: '🥈', name: 'SILVER' },
  { level: 9, xp: 2500, rank: '🥇', name: 'GOLD' },
  { level: 10, xp: 3200, rank: '🥇', name: 'GOLD' },
  { level: 11, xp: 4000, rank: '🥇', name: 'GOLD' },
  { level: 12, xp: 5000, rank: '🥇', name: 'GOLD' },
  { level: 13, xp: 6200, rank: '💎', name: 'DIAMOND' },
  { level: 14, xp: 7600, rank: '💎', name: 'DIAMOND' },
  { level: 15, xp: 9200, rank: '💎', name: 'DIAMOND' },
];

const DAILY_REWARDS = [100, 150, 200, 250, 300, 400, 500];

// ===== AUDIO ENGINE =====
const NOTES: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
  D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

class AudioEngine {
  ctx: AudioContext | null = null;

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playNote(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.1, delay = 0) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const startTime = this.ctx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  play(type: string) {
    switch (type) {
      case 'spin':
        [NOTES.C4, NOTES.E4, NOTES.G4].forEach((n, i) => this.playNote(n, 0.08, 'square', 0.08, i * 0.05));
        break;
      case 'stop':
        this.playNote(NOTES.G4, 0.1, 'square', 0.12);
        this.playNote(NOTES.C4, 0.15, 'square', 0.08, 0.05);
        break;
      case 'win':
        [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C5, NOTES.E5].forEach((n, i) => this.playNote(n, 0.12, 'square', 0.1, i * 0.1));
        break;
      case 'jackpot':
        [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5].forEach((n, i) => {
          this.playNote(n, 0.15, 'square', 0.12, i * 0.12);
          if (i >= 4) this.playNote(n / 2, 0.15, 'triangle', 0.08, i * 0.12);
        });
        break;
      case 'curse':
        // Ominous sound for 666
        [NOTES.C4 * 0.5, NOTES.C4 * 0.4, NOTES.C4 * 0.3].forEach((n, i) =>
          this.playNote(n, 0.4, 'sawtooth', 0.15, i * 0.3)
        );
        break;
      case 'buy':
        this.playNote(NOTES.E5, 0.08, 'square', 0.1);
        this.playNote(NOTES.G5, 0.1, 'square', 0.1, 0.08);
        break;
      case 'levelup':
        [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5].forEach((n, i) => {
          this.playNote(n, 0.2, 'square', 0.1, i * 0.15);
          this.playNote(n / 2, 0.2, 'triangle', 0.06, i * 0.15);
        });
        break;
      case 'click':
        this.playNote(NOTES.C5, 0.05, 'square', 0.08);
        break;
      case 'error':
        this.playNote(NOTES.C4, 0.1, 'sawtooth', 0.08);
        this.playNote(NOTES.C4 * 0.9, 0.15, 'sawtooth', 0.06, 0.1);
        break;
      case 'reel':
        this.playNote(200 + Math.random() * 100, 0.03, 'square', 0.05);
        break;
    }
  }
}

const audio = new AudioEngine();

// ===== TYPES =====
export type ItemsState = { [key: string]: number };
export type ActiveEffects = { luckyCharm: number; doubleStar: boolean; wildCard: boolean; shield: boolean };
export type AchievementsState = { [key: string]: boolean };

export interface GameState {
  credits: number;
  bet: number;
  jackpot: number;
  lastWin: number;
  totalSpins: number;
  totalWins: number;
  xp: number;
  level: number;
  items: ItemsState;
  activeEffects: ActiveEffects;
  bonusSpins: number;
  achievements: AchievementsState;
  lastDailyBonus: string | null;
  dailyStreak: number;
  curseCount: number; // Track 6s for 666
}

const INITIAL_STATE: GameState = {
  credits: 1000,
  bet: 10,
  jackpot: 10000,
  lastWin: 0,
  totalSpins: 0,
  totalWins: 0,
  xp: 0,
  level: 1,
  items: { luckyCharm: 0, doubleStar: 0, hotStreak: 0, shield: 0, wildCard: 0 },
  activeEffects: { luckyCharm: 0, doubleStar: false, wildCard: false, shield: false },
  bonusSpins: 0,
  achievements: {},
  lastDailyBonus: null,
  dailyStreak: 0,
  curseCount: 0,
};

// Helper: Get random symbol based on probability
function getWeightedRandomSymbol(boostClover = false): Symbol {
  const symbols = [...SYMBOLS];

  // Boost clover probability if lucky charm active
  if (boostClover) {
    const cloverIdx = symbols.findIndex(s => s.id === 'clover');
    if (cloverIdx !== -1) {
      symbols[cloverIdx] = { ...symbols[cloverIdx], probability: 0.25 };
    }
  }

  const totalProb = symbols.reduce((sum, s) => sum + s.probability, 0);
  let random = Math.random() * totalProb;

  for (const symbol of symbols) {
    random -= symbol.probability;
    if (random <= 0) return symbol;
  }

  return symbols[0];
}

export function useSlotMachine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('PRESS SPIN!');
  // 5x3 grid (5 columns, 3 rows = 15 cells)
  const [grid, setGrid] = useState<string[]>(
    Array(15).fill('').map(() => getWeightedRandomSymbol().icon)
  );
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showCurse, setShowCurse] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load game
  useEffect(() => {
    const saved = localStorage.getItem('cloverCadiaState');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load save');
      }
    }
  }, []);

  // Save game
  useEffect(() => {
    localStorage.setItem('cloverCadiaState', JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const playSound = (type: string) => audio.play(type);

  // Check for wins on all paylines
  const checkWins = (gridSymbols: string[]): { totalWin: number; winningPositions: number[]; has666: boolean } => {
    let totalWin = 0;
    const winningPositions = new Set<number>();
    let has666 = false;

    // Check for 666 curse (3 or more 6️⃣ symbols)
    const sixCount = gridSymbols.filter(s => s === '6️⃣').length;
    if (sixCount >= 3) {
      has666 = true;
    }

    // Check each payline
    for (const line of PAYLINES) {
      const lineSymbols = line.map(idx => gridSymbols[idx]);

      // Count consecutive matching symbols from left
      let matchCount = 1;
      const firstSymbol = lineSymbols[0];

      // Skip if first symbol is curse
      if (firstSymbol === '6️⃣') continue;

      for (let i = 1; i < lineSymbols.length; i++) {
        if (lineSymbols[i] === firstSymbol || lineSymbols[i] === '🃏') {
          matchCount++;
        } else {
          break;
        }
      }

      // Need at least 3 matching symbols
      if (matchCount >= 3) {
        const symbol = SYMBOLS.find(s => s.icon === firstSymbol);
        if (symbol && symbol.value > 0) {
          const multiplier = matchCount === 3 ? 1 : matchCount === 4 ? 3 : 10;
          totalWin += symbol.value * multiplier;

          // Mark winning positions
          for (let i = 0; i < matchCount; i++) {
            winningPositions.add(line[i]);
          }
        }
      }
    }

    return { totalWin, winningPositions: Array.from(winningPositions), has666 };
  };

  const spin = async () => {
    if (isSpinning) return;
    if (state.bonusSpins === 0 && state.credits < state.bet) {
      setMessage('! NO COINS !');
      playSound('error');
      return;
    }

    setIsSpinning(true);
    setWinningCells([]);
    setShowCurse(false);

    let currentCredits = state.credits;
    let currentBonus = state.bonusSpins;

    if (currentBonus > 0) {
      currentBonus--;
    } else {
      currentCredits -= state.bet;
    }

    updateState({
      credits: currentCredits,
      bonusSpins: currentBonus,
      totalSpins: state.totalSpins + 1,
      lastWin: 0
    });

    setMessage('>>> SPINNING <<<');
    playSound('spin');

    // Animate grid
    const animationInterval = setInterval(() => {
      setGrid(prev => prev.map(() => getWeightedRandomSymbol().icon));
      playSound('reel');
    }, 80);

    // Generate final grid
    const finalGrid = Array(15).fill('').map(() =>
      getWeightedRandomSymbol(state.activeEffects.luckyCharm > 0).icon
    );

    // Add wild cards if effect active
    if (state.activeEffects.wildCard) {
      const randomIdx = Math.floor(Math.random() * 15);
      finalGrid[randomIdx] = '🃏';
    }

    await new Promise(r => setTimeout(r, 1500));
    clearInterval(animationInterval);

    setGrid(finalGrid);
    playSound('stop');

    // Calculate wins
    const { totalWin, winningPositions, has666 } = checkWins(finalGrid);

    // Handle 666 curse
    if (has666 && !state.activeEffects.shield) {
      setShowCurse(true);
      playSound('curse');
      setMessage('☠️ 666! ALL COINS LOST! ☠️');
      updateState({
        credits: 0,
        curseCount: state.curseCount + 1,
        activeEffects: { ...state.activeEffects, shield: false }
      });

      if (!state.achievements['cursed']) {
        unlockAchievement('cursed');
      }

      setIsSpinning(false);
      return;
    } else if (has666 && state.activeEffects.shield) {
      // Shield blocked the curse
      setMessage('✝️ CURSE BLOCKED! ✝️');
      playSound('win');
      updateState({
        activeEffects: { ...state.activeEffects, shield: false }
      });
      if (!state.achievements['survivor']) {
        unlockAchievement('survivor');
      }
    }

    // Add XP
    addXP(10);

    if (totalWin > 0) {
      let winAmount = state.bet * totalWin;
      let dStar = state.activeEffects.doubleStar;

      if (dStar) {
        winAmount *= 2;
        dStar = false;
      }

      const newCredits = currentCredits + winAmount;
      setWinningCells(winningPositions);

      updateState({
        credits: newCredits,
        lastWin: winAmount,
        totalWins: state.totalWins + winAmount,
        activeEffects: { ...state.activeEffects, doubleStar: dStar },
        jackpot: totalWin >= 100 ? state.jackpot + Math.floor(state.bet * 0.1) : state.jackpot
      });

      if (totalWin >= 100) {
        setMessage(`🎰 JACKPOT! +${winAmount}! 🎰`);
        playSound('jackpot');
        if (!state.achievements['jackpotHunter']) {
          unlockAchievement('jackpotHunter');
        }
      } else {
        setMessage(`WIN! +${winAmount}!`);
        playSound('win');
      }

      // Check achievements
      if (!state.achievements['firstWin']) {
        unlockAchievement('firstWin');
      }

      // Check for 7x3+ wins
      const sevenCount = finalGrid.filter(s => s === '7️⃣').length;
      if (sevenCount >= 3 && !state.achievements['lucky7']) {
        unlockAchievement('lucky7');
      }

      if (newCredits >= 10000 && !state.achievements['rich']) {
        unlockAchievement('rich');
      }
    } else {
      setMessage('TRY AGAIN...');
      updateState({ jackpot: state.jackpot + Math.floor(state.bet * 0.05) });
    }

    // Cleanup effects
    const newEffects = { ...state.activeEffects };
    if (newEffects.luckyCharm > 0) newEffects.luckyCharm--;
    newEffects.wildCard = false;
    updateState({ activeEffects: newEffects });

    // Check spin achievements
    const spins = state.totalSpins + 1;
    if (spins >= 100 && !state.achievements['spin100']) {
      unlockAchievement('spin100');
    }
    if (spins >= 500 && !state.achievements['spin500']) {
      unlockAchievement('spin500');
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

  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (state.lastDailyBonus !== today) {
      const newStreak = state.lastDailyBonus === yesterday ? state.dailyStreak : 0;
      updateState({ dailyStreak: newStreak });
      setShowDailyBonus(true);
    }
  }, []);

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
      claimDaily,
      playSound
    }
  };
}
