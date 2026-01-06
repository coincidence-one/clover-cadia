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

  // v2.1 New Rules
  showRoundSelector: boolean; // For choosing 3 vs 7 spins
  mercyUsed: boolean; // Tracking 1 free spin if balance low
  roundRewardTickets: number; // 2 for Risky, 1 for Safe

  // Deadline System (New)
  currentDay: number; // 1, 2, 3
  maxDays: number; // 3

  // Talisman System (부적)
  ownedTalismans: string[]; // IDs of owned talismans
  talismanEffects: {
    symbolValueBoosts: Record<string, number>; // Symbol ID -> value boost
    curseProtectionPermanent: boolean; // 묵주 (permanent 666 protection)
    curseProtectionOnce: boolean; // 성경 (one-time 666 protection)
    spinCoinBonus: number; // Coins per spin (행운의 고양이 etc)
    cloverProbBoost: number; // Clover probability boost
    roundStartBonus: number; // Coins at round start (가짜 동전)
    deadlineClearBonus: number; // Coins on deadline clear (할머니의 지갑)
    ticketPerRound: number; // Extra tickets per round (행운의 과자)
    curseBonus: number; // Coins on 666 (악마의 뿔)
    dynamoChance: number; // Respin chance on win (다이나모)
  };
}

// ===== ROUND TYPES =====
export interface RoundModeConfig {
  spins: number;
  cost: number;
  rewardTickets: number;
}

export interface RoundConfig {
  round: number;
  goal: number;
  safe: RoundModeConfig;
  risky: RoundModeConfig;
}

// ===== PHONE BONUS TYPES =====
export type PhoneBonusType = 'buff' | 'risk' | 'special';

export interface PhoneBonus {
  id: string;
  name: string;
  icon: string;
  desc: string;
  type: 'buff' | 'risk' | 'special';
  rarity: 'common' | 'rare' | 'legendary';
}

// ===== PAYLINE TYPE =====
export type Payline = number[];
