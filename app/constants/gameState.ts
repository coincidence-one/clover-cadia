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
  credits: 100, // Reduced for Round 1 challenge (Goal: 300)
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

  // Deadline System
  round: 0,
  currentGoal: 0,
  spinsLeft: 0,
  maxSpins: 0,
  gameOver: false,

  // Phone Bonus System
  activeBonuses: [],
  showPhoneModal: false,
  currentPhoneChoices: [],

  // v2.1
  showRoundSelector: true, // Start game with selection
  mercyUsed: false,
  roundRewardTickets: 1,

  // Deadline System
  currentDay: 1,
  maxDays: 3,

  // Talisman System
  ownedTalismans: [],
  shopTalismans: [], // Empty initially, populated on mount/start
  talismanSlots: 7,
  shopRerollCost: 10,
  talismanEffects: {
    symbolValueBoosts: {},
    curseProtectionPermanent: false,
    curseProtectionOnce: false,
    spinCoinBonus: 0,
    cloverProbBoost: 0,
    roundStartBonus: 0,
    deadlineClearBonus: 0,
    ticketPerRound: 0,
    curseBonus: 0,
    dynamoChance: 0,
  },

  // ATM System
  bankDeposit: 0,
  interestRate: 0.1, // 10% interest
  totalInterestEarned: 0,
};

// Storage key
export const STORAGE_KEY = 'pixelBetState';

// Spin Cost (Fixed)
export const SPIN_COST = 8;
