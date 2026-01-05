// ===== GAME TYPES =====
// All type definitions for CloverCadia slot machine game

// ===== SYMBOL TYPES =====
export interface GameSymbol {
  id: string;
  icon: string;
  probability: number;
  value: number;
}

// ===== ITEM TYPES =====
export interface CoinItem {
  name: string;
  icon: string;
  price: number;
  desc: string;
}

export type TicketItemType = 'consumable' | 'active' | 'passive';

export interface TicketItem {
  name: string;
  icon: string;
  price: number;
  desc: string;
  type: TicketItemType;
  duration?: number;
}

// ===== ACHIEVEMENT TYPES =====
export interface Achievement {
  id: string;
  name: string;
  desc: string;
  reward: number;
  icon: string;
}

// ===== LEVEL TYPES =====
export interface Level {
  level: number;
  xp: number;
  rank: string;
  name: string;
}

// ===== STATE TYPES =====
export type ItemsState = Record<string, number>;
export type AchievementsState = Record<string, boolean>;
export type PassiveEffects = Record<string, boolean>;
export type ActiveTicketEffects = Record<string, number>;

export interface ActiveEffects {
  luckyCharm: number;
  doubleStar: boolean;
  wildCard: boolean;
  shield: boolean;
}

export interface GameState {
  // Currency
  credits: number;
  bet: number;
  jackpot: number;
  lastWin: number;

  // Progress
  totalSpins: number;
  totalWins: number;
  xp: number;
  level: number;

  // Coin items
  items: ItemsState;
  activeEffects: ActiveEffects;
  bonusSpins: number;

  // Achievements & Daily
  achievements: AchievementsState;
  lastDailyBonus: string | null;
  dailyStreak: number;

  // Curse tracking
  curseCount: number;

  // Ticket system
  tickets: number;
  ticketItems: ItemsState;
  passiveEffects: PassiveEffects;
  activeTicketEffects: ActiveTicketEffects;

  // Deadline System (Round)
  round: number;
  currentGoal: number;
  spinsLeft: number;
  maxSpins: number;
  gameOver: boolean;

  // Phone Bonus System
  activeBonuses: string[];
  showPhoneModal: boolean;
  currentPhoneChoices: PhoneBonus[];
}

// ===== ROUND TYPES =====
export interface RoundConfig {
  round: number;
  goal: number;
  maxSpins: number;
  rewardTickets: number;
}

// ===== PHONE BONUS TYPES =====
export type PhoneBonusType = 'buff' | 'risk' | 'special';

export interface PhoneBonus {
  id: string;
  name: string;
  desc: string;
  type: PhoneBonusType;
  rarity: number; // 1 (Common) to 3 (Rare)
}

// ===== PAYLINE TYPE =====
export type Payline = number[];
