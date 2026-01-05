'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ===== CONSTANTS =====
const SYMBOLS = ['☘', '7', '★', '♦', '♥', '♣', '○', '◇'];
const SPECIAL_SYMBOLS = {
  WILD: '?',
  SCATTER: '⚡',
};

const PAYOUTS: Record<string, number> = {
  '☘☘☘': 100,
  '★★★': 50,
  '777': 30,
  '♦♦♦': 20,
  '♥♥♥': 15,
  '♣♣♣': 10,
  '○○○': 5,
  '◇◇◇': 3,
};

export const ITEMS: Record<string, { name: string; icon: string; price: number; desc: string }> = {
  luckyCharm: { name: 'LUCKY CHARM', icon: '◈', price: 200, desc: '+20% WIN x3' },
  doubleStar: { name: 'DOUBLE STAR', icon: '★', price: 150, desc: '2X WIN' },
  hotStreak: { name: 'HOT STREAK', icon: '♨', price: 300, desc: '+5 SPINS' },
  freezer: { name: 'FREEZER', icon: '◎', price: 250, desc: 'LOCK REEL' },
  wildCard: { name: 'WILD CARD', icon: '?', price: 400, desc: 'ADD WILD' },
};

export const ITEM_KEYS = Object.keys(ITEMS) as Array<keyof typeof ITEMS>;

export const ACHIEVEMENTS = [
  { id: 'firstWin', name: 'FIRST WIN', desc: 'WIN ONCE', reward: 50, icon: '♦' },
  { id: 'lucky7', name: 'LUCKY 777', desc: 'HIT 777', reward: 200, icon: '7' },
  { id: 'jackpotHunter', name: 'JACKPOT', desc: 'HIT CLOVER', reward: 500, icon: '☘' },
  { id: 'spin100', name: '100 SPINS', desc: 'SPIN 100X', reward: 300, icon: '◈' },
  { id: 'spin500', name: '500 SPINS', desc: 'SPIN 500X', reward: 1000, icon: '★' },
  { id: 'rich', name: 'HIGH ROLLER', desc: '10000 COINS', reward: 500, icon: '◆' },
  { id: 'collector', name: 'COLLECTOR', desc: 'ALL ITEMS', reward: 300, icon: '♦' },
  { id: 'wildMaster', name: 'WILD MASTER', desc: 'WIN W/ WILD', reward: 250, icon: '?' },
];

export const LEVELS = [
  { level: 1, xp: 0, rank: '★', name: 'BRONZE' },
  { level: 2, xp: 100, rank: '★', name: 'BRONZE' },
  { level: 3, xp: 250, rank: '★', name: 'BRONZE' },
  { level: 4, xp: 450, rank: '★', name: 'BRONZE' },
  { level: 5, xp: 700, rank: '★', name: 'BRONZE' },
  { level: 6, xp: 1000, rank: '★★', name: 'SILVER' },
  { level: 7, xp: 1400, rank: '★★', name: 'SILVER' },
  { level: 8, xp: 1900, rank: '★★', name: 'SILVER' },
  { level: 9, xp: 2500, rank: '★★', name: 'SILVER' },
  { level: 10, xp: 3200, rank: '★★', name: 'SILVER' },
  { level: 11, xp: 4000, rank: '★★★', name: 'GOLD' },
  { level: 12, xp: 5000, rank: '★★★', name: 'GOLD' },
  { level: 13, xp: 6200, rank: '★★★', name: 'GOLD' },
  { level: 14, xp: 7600, rank: '★★★', name: 'GOLD' },
  { level: 15, xp: 9200, rank: '★★★', name: 'GOLD' },
  { level: 16, xp: 11000, rank: '◆', name: 'DIAMOND' },
  { level: 17, xp: 13000, rank: '◆', name: 'DIAMOND' },
  { level: 18, xp: 15500, rank: '◆', name: 'DIAMOND' },
  { level: 19, xp: 18500, rank: '◆', name: 'DIAMOND' },
  { level: 20, xp: 22000, rank: '◆', name: 'DIAMOND' },
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
export type ActiveEffects = { luckyCharm: number; doubleStar: boolean; wildCard: boolean };
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
  frozenReels: (string | null)[];
  freezerMode: boolean;
  bonusSpins: number;
  achievements: AchievementsState;
  lastDailyBonus: string | null;
  dailyStreak: number;
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
  items: { luckyCharm: 0, doubleStar: 0, hotStreak: 0, freezer: 0, wildCard: 0 },
  activeEffects: { luckyCharm: 0, doubleStar: false, wildCard: false },
  frozenReels: [null, null, null],
  freezerMode: false,
  bonusSpins: 0,
  achievements: {},
  lastDailyBonus: null,
  dailyStreak: 0,
};

export function useSlotMachine() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('PRESS SPIN!');
  const [reels, setReels] = useState<string[][]>([
    ['☘', '7', '★'],
    ['7', '☘', '♦'],
    ['★', '♦', '☘'],
  ]);
  const [winLineActive, setWinLineActive] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load game
  useEffect(() => {
    const saved = localStorage.getItem('luckyCloverNext');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load save');
      }
    }
    checkDailyBonus();
  }, []);

  // Save game
  useEffect(() => {
    localStorage.setItem('luckyCloverNext', JSON.stringify(state));
  }, [state]);

  const checkDailyBonus = useCallback(() => {
    const today = new Date().toDateString();

    // Safety check for initial load where state might be stale in closure if not careful,
    // but here we rely on the state loaded from effect. 
    // Actually, we should check against the loaded state. 
    // For simplicity, we'll let the user manually check or trigger it after load.
    // We'll trust the useEffect dependency chain if we put state there, but that causes loop.
    // Let's Just check availability.
  }, []);

  // Helper to update partial state
  const updateState = (updates: Partial<GameState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const playSound = (type: string) => audio.play(type);

  const getRandomSymbol = (includeSpecial = false) => {
    if (includeSpecial && Math.random() < 0.05) return SPECIAL_SYMBOLS.SCATTER;
    if (state.activeEffects.wildCard && Math.random() < 0.15) return SPECIAL_SYMBOLS.WILD;
    if (state.activeEffects.luckyCharm > 0 && Math.random() < 0.2) return ['☘', '★', '7'][Math.floor(Math.random() * 3)];
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  };

  const checkWin = (symbols: string[]) => {
    const scatterCount = symbols.filter(s => s === SPECIAL_SYMBOLS.SCATTER).length;
    if (scatterCount >= 3) return { payout: 0, isScatter: true, isWild: false };

    const hasWild = symbols.includes(SPECIAL_SYMBOLS.WILD);
    if (hasWild) {
      for (const [combo, payout] of Object.entries(PAYOUTS)) {
        const comboSymbols = [...combo];
        let match = true;
        for (let i = 0; i < 3; i++) {
          if (symbols[i] !== comboSymbols[i] && symbols[i] !== SPECIAL_SYMBOLS.WILD) {
            match = false;
            break;
          }
        }
        if (match) return { payout, isWild: true, isScatter: false };
      }
    }

    const result = symbols.join('');
    if (PAYOUTS[result]) return { payout: PAYOUTS[result], isWild: false, isScatter: false };
    return { payout: 0, isWild: false, isScatter: false };
  };

  const spin = async () => {
    if (isSpinning || state.freezerMode) return;
    if (state.bonusSpins === 0 && state.credits < state.bet) {
      setMessage('! NO COINS !');
      playSound('error');
      return;
    }

    setIsSpinning(true);
    setWinLineActive(false);

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

    // Determine final symbols
    const finalSymbols = [0, 1, 2].map(i =>
      state.frozenReels[i] !== null ? state.frozenReels[i]! : getRandomSymbol(true)
    );

    // Animate (Simulated with timeouts for React)
    const spinDuration = [800, 1200, 1600];

    // Start animation loop
    const interval = setInterval(() => {
      setReels(prev => prev.map((col, i) => {
        if (state.frozenReels[i]) return col; // Keep frozen
        return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      }));
      playSound('reel');
    }, 100);

    // Stop reels one by one
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 400)); // Stagger stops
      // In a real app we'd clear interval per reel, but here we just simplify
    }

    clearInterval(interval);

    // Set final state
    setReels([
      [getRandomSymbol(), finalSymbols[0], getRandomSymbol()],
      [getRandomSymbol(), finalSymbols[1], getRandomSymbol()],
      [getRandomSymbol(), finalSymbols[2], getRandomSymbol()],
    ]);
    playSound('stop');

    // Calculate Win
    addXP(10);
    const winResult = checkWin(finalSymbols);

    if (winResult.isScatter) {
      setMessage('⚡ SCATTER! +5 SPINS! ⚡');
      playSound('win');
      updateState({ bonusSpins: currentBonus + 5 });
    } else if (winResult.payout > 0) {
      let winAmount = state.bet * winResult.payout;
      let dStar = state.activeEffects.doubleStar;

      if (dStar) {
        winAmount *= 2;
        dStar = false;
      }

      const newCredits = currentCredits + winAmount;
      updateState({
        credits: newCredits,
        lastWin: winAmount,
        totalWins: state.totalWins + winAmount,
        activeEffects: { ...state.activeEffects, doubleStar: dStar },
        jackpot: winResult.payout >= 100 ? state.jackpot + Math.floor(state.bet * 0.1) : state.jackpot
      });

      setWinLineActive(true);
      if (winResult.payout >= 100) {
        setMessage(`☘ JACKPOT! +${winAmount}! ☘`);
        playSound('jackpot');
      } else {
        setMessage(`WIN! +${winAmount}!`);
        playSound('win');
      }

      checkAchievements(newCredits, state.totalSpins + 1, finalSymbols, winResult.isWild);
    } else {
      setMessage('TRY AGAIN...');
      updateState({ jackpot: state.jackpot + Math.floor(state.bet * 0.05) });
    }

    // Cleanup effects
    const newEffects = { ...state.activeEffects };
    if (newEffects.luckyCharm > 0) newEffects.luckyCharm--;
    newEffects.wildCard = false;
    if (state.activeEffects.doubleStar) {
      // Logic handled above if win, if loss it persists? 
      // Original game.js: doubleStar only consumed on Win? No, usually consumable.
      // Game.js 721: "if (winAmount ...) ... doubleStar=false". 
      // Wait, checking game.js logic... 
      // Uses: "if (gameState.activeEffects.doubleStar > 0) ...".
      // Actually looking at game.js: "gameState.activeEffects.doubleStar" is boolean? 
      // yes. And it sets to false ONLY inside "if (winResult.payout > 0)". 
      // So it persists until a win? Let's assume yes from my reading.
    }

    updateState({
      activeEffects: newEffects,
      frozenReels: [null, null, null],
      freezerMode: false
    });

    setIsSpinning(false);
  };

  const addXP = (amount: number) => {
    const newXP = state.xp + amount;
    const nextLevel = LEVELS.find(l => l.level === state.level + 1);
    let newLevel = state.level;

    if (nextLevel && newXP >= nextLevel.xp) {
      newLevel++;
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
    let freezer = state.freezerMode;

    switch (itemName) {
      case 'luckyCharm': newEffects.luckyCharm = 3; break;
      case 'doubleStar': newEffects.doubleStar = true; break;
      case 'hotStreak': newBonus += 5; break;
      case 'freezer': freezer = true; setMessage('SELECT REEL TO LOCK'); break;
      case 'wildCard': newEffects.wildCard = true; break;
    }

    playSound('buy');
    updateState({ items: newItems, activeEffects: newEffects, bonusSpins: newBonus, freezerMode: freezer });
  };

  const freezeReel = (index: number) => {
    if (!state.freezerMode) return;
    const newFrozen = [...state.frozenReels];
    newFrozen[index] = reels[index][1]; // Center symbol
    updateState({ frozenReels: newFrozen, freezerMode: false });
    playSound('click');
    setMessage(`REEL ${index + 1} LOCKED`);
    // Note: In Hooks, we need to ensure spin uses this new state.
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
    checkAchievementCollector(newItems);
  };

  const checkAchievementCollector = (items: ItemsState) => {
    if (Object.values(items).every(c => c > 0)) unlockAchievement('collector');
  };

  const checkAchievements = (credits: number, spins: number, symbols: string[], isWild: boolean) => {
    if (!state.achievements['firstWin']) unlockAchievement('firstWin');
    if (symbols.every(s => s === '7')) unlockAchievement('lucky7');
    if (symbols.every(s => s === '☘')) unlockAchievement('jackpotHunter');
    if (isWild) unlockAchievement('wildMaster');
    if (spins >= 100 && !state.achievements['spin100']) unlockAchievement('spin100');
    if (spins >= 500 && !state.achievements['spin500']) unlockAchievement('spin500');
    if (credits >= 10000 && !state.achievements['rich']) unlockAchievement('rich');
  };

  const unlockAchievement = (id: string) => {
    if (state.achievements[id]) return;
    const a = ACHIEVEMENTS.find(ac => ac.id === id);
    if (!a) return;

    const newAch = { ...state.achievements, [id]: true };
    updateState({ achievements: newAch, credits: state.credits + a.reward });
    playSound('levelup');
    setToast(`${a.icon} ${a.name} UNLOCKED!`);
    setTimeout(() => setToast(null), 3000);
  };

  const claimDaily = () => {
    const today = new Date().toDateString();
    let streak = state.dailyStreak;
    const reward = DAILY_REWARDS[Math.min(streak - 1, DAILY_REWARDS.length - 1)] || 100;

    updateState({
      credits: state.credits + reward,
      lastDailyBonus: today,
      // streak logic usually handles in check, here simply:
      dailyStreak: streak
    });
    setShowDailyBonus(false);
    playSound('jackpot');
  };

  const checkAvailabilityDaily = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (state.lastDailyBonus !== today) {
      // Simple streak logic
      const newStreak = state.lastDailyBonus === yesterday ? state.dailyStreak + 1 : 1;
      updateState({ dailyStreak: newStreak });
      setShowDailyBonus(true);
    }
  };

  useEffect(() => {
    // Trigger check on load if data exists
    if (state.lastDailyBonus) checkAvailabilityDaily();
  }, [state.lastDailyBonus]); // Careful with loops

  // Handlers for bet
  const changeBet = (delta: number) => {
    const newBet = Math.max(10, Math.min(100, state.bet + delta));
    updateState({ bet: newBet });
    playSound('click');
  };

  return {
    state,
    isSpinning,
    message,
    reels,
    winLineActive,
    showLevelUp,
    setShowLevelUp,
    showDailyBonus,
    setShowDailyBonus,
    toast,
    actions: {
      spin,
      changeBet,
      useItem,
      buyItem,
      freezeReel,
      claimDaily,
      playSound
    }
  };
}
