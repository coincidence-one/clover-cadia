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
  { id: 'cherry', icon: '🍒', probability: 0.194, value: 2 },
  { id: 'lemon', icon: '🍋', probability: 0.194, value: 2 },

  // Uncommon (14.9% each)
  { id: 'clover', icon: '☘️', probability: 0.149, value: 3 },
  { id: 'bell', icon: '🔔', probability: 0.149, value: 3 },

  // Rare (11.9% each)
  { id: 'diamond', icon: '💎', probability: 0.119, value: 5 },
  { id: 'treasure', icon: '💰', probability: 0.119, value: 5 },

  // Legendary (7.5%)
  { id: 'seven', icon: '7️⃣', probability: 0.075, value: 7 },

  // Cursed (1.5%) - 666 triggers curse (lose all coins this round)
  { id: 'six', icon: '6️⃣', probability: 0.015, value: 0 },
];

export const WILD_SYMBOL: GameSymbol = {
  id: 'wild',
  icon: '🃏',
  probability: 0,
  value: 0
};
