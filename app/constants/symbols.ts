import type { GameSymbol } from '@/app/types';

// CloverPit-style probabilities
// Cherry/Lemon(19.4%), Clover/Bell(14.9%), Diamond/Treasure(11.9%), Seven(7.5%), Six(1.5%)
export const SYMBOLS: GameSymbol[] = [
  { id: 'cherry', icon: '🍒', probability: 0.194, value: 2 },
  { id: 'lemon', icon: '🍋', probability: 0.194, value: 2 },
  { id: 'clover', icon: '☘️', probability: 0.149, value: 5 },
  { id: 'bell', icon: '🔔', probability: 0.149, value: 5 },
  { id: 'diamond', icon: '💎', probability: 0.119, value: 10 },
  { id: 'treasure', icon: '💰', probability: 0.119, value: 10 },
  { id: 'seven', icon: '7️⃣', probability: 0.075, value: 25 },
  { id: 'six', icon: '6️⃣', probability: 0.015, value: -1 }, // Curse symbol
];

export const WILD_SYMBOL = { id: 'wild', icon: '🃏', probability: 0, value: 0 };
