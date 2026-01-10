import type { GameSymbol } from '@/app/types';

/**
 * CloverPit Symbol System
 * 
 * | Symbol      | Value | Probability | Rarity    |
 * |-------------|-------|-------------|-----------|
 * | 체리/레몬   | ×2    | 19.4%       | Common    |
 * | 클로버/종   | ×3    | 14.9%       | Uncommon  |
 * | 다이아/보물 | ×5    | 11.9%       | Rare      |
 * | 세븐        | ×7    | 7.5%        | Legendary |
 * | 6           | -     | 1.5%        | Cursed    |
 * 
 * Win Calculation: symbol.value × pattern.multiplier × 10 (base)
 */
export const SYMBOLS: GameSymbol[] = [
  // Common (19.4% each)
  { id: 'cherry', icon: '/assets/images/symbols/cherry.png', probability: 0.194, value: 2 },
  { id: 'lemon', icon: '/assets/images/symbols/lemon.png', probability: 0.194, value: 2 },

  // Uncommon (14.9% each)
  { id: 'clover', icon: '/assets/images/symbols/clover.png', probability: 0.149, value: 3 },
  { id: 'bell', icon: '/assets/images/symbols/bell.png', probability: 0.149, value: 3 },

  // Rare (11.9% each)
  { id: 'diamond', icon: '/assets/images/symbols/diamond.png', probability: 0.119, value: 5 },
  { id: 'treasure', icon: '/assets/images/symbols/treasure.png', probability: 0.119, value: 5 },

  // Legendary (7.5%)
  { id: 'seven', icon: '/assets/images/symbols/seven.png', probability: 0.075, value: 7 },

  // Cursed (1.5%) - 666 triggers curse (lose all coins this round)
  { id: 'six', icon: '/assets/images/symbols/six.png', probability: 0.015, value: 0 },
];

export const WILD_SYMBOL: GameSymbol = {
  id: 'wild',
  icon: '/assets/images/symbols/wild.png',
  probability: 0,
  value: 0
};
