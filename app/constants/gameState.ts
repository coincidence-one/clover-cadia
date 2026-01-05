import type { GameState, ActiveEffects } from '@/app/types';

// Default active effects
export const DEFAULT_ACTIVE_EFFECTS: ActiveEffects = {
  luckyCharm: 0,
  doubleStar: false,
  wildCard: false,
  shield: false,
};

// Initial game state
export const INITIAL_GAME_STATE: GameState = {
  // Currency
  credits: 1000,
  bet: 10,
  jackpot: 10000,
  lastWin: 0,

  // Progress
  totalSpins: 0,
  totalWins: 0,
  xp: 0,
  level: 1,

  // Coin items
  items: { luckyCharm: 0, doubleStar: 0, hotStreak: 0, shield: 0, wildCard: 0 },
  activeEffects: { ...DEFAULT_ACTIVE_EFFECTS },
  bonusSpins: 0,

  // Achievements & Daily
  achievements: {},
  lastDailyBonus: null,
  dailyStreak: 0,

  // Curse tracking
  curseCount: 0,

  // Ticket system - start with 2 tickets
  tickets: 2,
  ticketItems: {},
  passiveEffects: {},
  activeTicketEffects: {},
};

// Storage key
export const STORAGE_KEY = 'cloverCadiaState';

// Fixed spin cost (CloverPit style - no betting)
export const SPIN_COST = 10;
