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

  // Items
  luckyBell: string;
  ticketDoubler: string;
  coinMagnet: string;
  shield: string;
  luckyCharm: string;
  wildCard: string;
  scatterBoost: string;
  sevenHunter: string;
  crystalBall: string;
  instantJackpot: string;
  rerollSpin: string;
  curseAbsorb: string;

  // Paytable
  paytableTitle: string;
  symbols: string;
  patterns: string;
  multiplier: string;
  baseValue: string;
  rarity: string;
  common: string;
  uncommon: string;
  rare: string;
  legendary: string;
  cursed: string;
  match3: string;
  match4: string;
  match5: string;
  paytableNote: string;

  // Round System
  round: string;
  setup: string;
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

  // Guide
  guideTitle: string;
  guidePage1Title: string;
  guidePage1Desc: string;
  guidePage2Title: string;
  guidePage2Desc: string;
  guidePage3Title: string;
  guidePage3Desc: string;
  guidePage4Title: string;
  guidePage4Desc: string;
  next: string;
  prev: string;
  close: string;

  // Items
  items: {
    luckyCharm: { name: string; desc: string };
    doubleStar: { name: string; desc: string };
    hotStreak: { name: string; desc: string };
    shield: { name: string; desc: string };
    wildCard: { name: string; desc: string };

    // Ticket Items
    luckyBell: { name: string; desc: string };
    ticketDoubler: { name: string; desc: string };
    coinMagnet: { name: string; desc: string };
    scatterBoost: { name: string; desc: string };
    sevenHunter: { name: string; desc: string };
    crystalBall: { name: string; desc: string };
    curseAbsorb: { name: string; desc: string };
    instantJackpot: { name: string; desc: string };
    rerollSpin: { name: string; desc: string };
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
  title: 'PIXEL BET',
  subtitle: '★ ROGUELITE SLOTS ★',
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
  luckyBell: 'LUCKY BELL',
  ticketDoubler: 'TICKET DOUBLER',
  coinMagnet: 'COIN MAGNET',
  shield: 'HOLY SHIELD',
  luckyCharm: 'LUCKY CHARM',
  wildCard: 'WILD CARD',
  scatterBoost: 'SCATTER BOOST',
  sevenHunter: 'SEVEN HUNTER',
  crystalBall: 'CRYSTAL BALL',
  instantJackpot: 'MINI JACKPOT',
  rerollSpin: 'REROLL',
  curseAbsorb: 'CURSE ABSORB',

  // Paytable
  paytableTitle: 'PAYTABLE',
  symbols: 'SYMBOLS',
  patterns: 'PATTERNS',
  multiplier: 'MULTIPLIER',
  baseValue: 'BASE VALUE',
  rarity: 'RARITY',
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  legendary: 'LEGENDARY',
  cursed: 'CURSED',
  match3: '3 MATCH',
  match4: '4 MATCH',
  match5: '5 MATCH',
  paytableNote: '* Probabilities vary with items & phone bonuses',

  // Guide
  guideTitle: 'GAME GUIDE',
  guidePage1Title: 'SURVIVAL RULE',
  guidePage1Desc: 'Reach the GOAL before Spins run out.\nIf Spins=0 and Coins < Goal, GAME OVER!',
  guidePage2Title: 'STRATEGY SETUP',
  guidePage2Desc: 'Choose 3 SPINS (Risky, +2 Tickets) or 7 SPINS (Safe, +1 Ticket).',
  guidePage3Title: 'BEWARE 666',
  guidePage3Desc: 'The 666 Pattern wipes ALL coins.\nBuy a SHIELD to protect yourself.',
  guidePage4Title: 'ITEM SHOP',
  guidePage4Desc: 'Use Tickets to buy upgrades.\nItems are essential for survival.',
  next: 'NEXT',
  prev: 'PREV',
  close: 'CLOSE',

  // Round System
  round: 'ROUND',
  setup: 'SETUP',
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

    // Ticket Items
    luckyBell: { name: 'LUCKY BELL', desc: '+2% BELL CHANCE' },
    ticketDoubler: { name: 'TICKET DOUBLER', desc: '2X TICKET REWARD' },
    coinMagnet: { name: 'COIN MAGNET', desc: '+10% ROUND WINS' },
    scatterBoost: { name: 'SCATTER BOOST', desc: 'Active: 2X SCATTER (5 SPINS)' },
    sevenHunter: { name: 'SEVEN HUNTER', desc: 'Active: +5% SEVEN (3 SPINS)' },
    crystalBall: { name: 'CRYSTAL BALL', desc: 'Active: PREVIEW NEXT SPIN' },
    curseAbsorb: { name: 'CURSE ABSORB', desc: 'Consumable: 666 -> +3 TICKETS' },
    instantJackpot: { name: 'MINI JACKPOT', desc: 'Consumable: +500 COINS' },
    rerollSpin: { name: 'REROLL', desc: 'Consumable: REROLL LAST SPIN' },
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
