export interface Translations {
  // Header & Titles
  title: string;
  subtitle: string;
  jackpot: string;

  // Controls
  shop: string;
  spin: string;
  spinning: string;
  maxBet: string;

  // Labels
  coins: string;
  bet: string;
  win: string;
  xp: string;
  level: string;

  // Shop
  itemShop: string;

  // Achievements
  trophies: string;
  achievementsTitle: string;

  // Messages
  pressSpin: string;
  ready: string;
  noCoins: string;
  spinningMsg: string;
  tryAgain: string;
  winMsg: string;
  jackpotMsg: string;
  scatterMsg: string;
  selectReel: string;
  reelLocked: string;
  unlocked: string;

  // Level Up Modal
  levelUp: string;
  levelLabel: string;
  reward: string;
  ok: string;

  // Daily Bonus Modal
  dailyBonus: string;
  streak: string;
  claimReward: string;

  // Ticket Shop
  shopTitle: string;
  tickets: string;
  passiveLabel: string;
  activeLabel: string;
  consumableLabel: string;

  // Round System
  round: string;
  goal: string;
  spinsLeft: string;
  roundCleared: string;
  nextRound: string;
  gameOver: string;
  outOfSpins: string;
  restart: string;

  // Phone Bonus
  incomingCall: string;
  pickBonus: string;

  // Items
  items: {
    luckyCharm: { name: string; desc: string };
    doubleStar: { name: string; desc: string };
    hotStreak: { name: string; desc: string };
    shield: { name: string; desc: string };
    wildCard: { name: string; desc: string };
  };

  // Achievements
  achievements: {
    firstWin: { name: string; desc: string };
    lucky7: { name: string; desc: string };
    jackpotHunter: { name: string; desc: string };
    spin100: { name: string; desc: string };
    spin500: { name: string; desc: string };
    rich: { name: string; desc: string };
    survivor: { name: string; desc: string };
    cursed: { name: string; desc: string };
  };

  // Language
  language: string;
  spinCostAlias: string;
}

export const en: Translations = {
  // Header & Titles
  title: 'LUCKY CLOVER',
  subtitle: '★ PIXEL SLOTS ★',
  jackpot: '◆ JACKPOT ◆',

  // Controls
  shop: 'SHOP',
  spin: 'SPIN!',
  spinning: '...',
  maxBet: 'MAX BET',

  // Labels
  coins: 'COINS',
  bet: 'BET',
  win: 'WIN',
  xp: 'XP',
  level: 'LV',

  // Shop
  itemShop: 'ITEM SHOP',

  // Ticket Shop
  shopTitle: 'TICKET SHOP',
  tickets: 'TICKETS',
  passiveLabel: 'PASSIVE (PERM)',
  activeLabel: 'ACTIVE',
  consumableLabel: 'CONSUMABLE',

  // Round System
  round: 'ROUND',
  goal: 'GOAL',
  spinsLeft: 'SPINS LEFT',
  roundCleared: 'ROUND CLEARED!',
  nextRound: 'NEXT ROUND ➡️',
  gameOver: 'GAME OVER',
  outOfSpins: 'OUT OF SPINS!',
  restart: 'RESTART GAME',

  // Phone Bonus
  incomingCall: 'INCOMING CALL...',
  pickBonus: 'Pick a bonus:',

  // Achievements
  trophies: 'TROPHIES',
  achievementsTitle: 'ACHIEVEMENTS',

  // Messages
  pressSpin: 'PRESS SPIN!',
  ready: 'READY',
  noCoins: '! NO COINS !',
  spinningMsg: '>>> SPINNING <<<',
  tryAgain: 'TRY AGAIN...',
  winMsg: 'WIN! +{amount}!',
  jackpotMsg: '☘ JACKPOT! +{amount}! ☘',
  scatterMsg: '⚡ SCATTER! +5 SPINS! ⚡',
  selectReel: 'SELECT REEL TO LOCK',
  reelLocked: 'REEL {num} LOCKED',
  unlocked: '{icon} {name} UNLOCKED!',

  // Level Up Modal
  levelUp: 'LEVEL UP!',
  levelLabel: 'LEVEL',
  reward: 'REWARD: +{amount} COINS',
  ok: 'OK',

  // Daily Bonus Modal
  dailyBonus: 'DAILY BONUS',
  streak: 'STREAK: {days} DAYS',
  claimReward: 'CLAIM REWARD',

  // Items
  items: {
    luckyCharm: { name: 'LUCKY CHARM', desc: '+CLOVER% x3' },
    doubleStar: { name: 'DOUBLE STAR', desc: '2X WIN' },
    hotStreak: { name: 'HOT STREAK', desc: '+5 SPINS' },
    shield: { name: 'HOLY SHIELD', desc: 'BLOCK 666' },
    wildCard: { name: 'WILD CARD', desc: 'ADD WILD' },
  },

  // Achievements
  achievements: {
    firstWin: { name: 'FIRST WIN', desc: 'WIN ONCE' },
    lucky7: { name: 'LUCKY SEVEN', desc: 'HIT 7x3' },
    jackpotHunter: { name: 'JACKPOT', desc: 'HIT 7x5' },
    spin100: { name: '100 SPINS', desc: 'SPIN 100X' },
    spin500: { name: '500 SPINS', desc: 'SPIN 500X' },
    rich: { name: 'HIGH ROLLER', desc: '10000 COINS' },
    survivor: { name: 'SURVIVOR', desc: 'SURVIVE 666' },
    cursed: { name: 'CURSED', desc: 'HIT 666' },
  },

  // Language
  language: 'EN',
  spinCostAlias: 'SPIN COST'
};
