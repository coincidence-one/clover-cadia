import type { GameSymbol } from '@/app/types';
import { SYMBOLS, WILD_SYMBOL } from '@/app/constants';

/**
 * Get a random symbol based on weighted probabilities
 * @param boostClover - If true, increases clover probability
 */
export function getWeightedRandomSymbol(boostClover = false): GameSymbol {
  const symbols = [...SYMBOLS];

  // Boost clover probability if lucky charm active
  if (boostClover) {
    const cloverIdx = symbols.findIndex(s => s.id === 'clover');
    if (cloverIdx !== -1) {
      symbols[cloverIdx] = { ...symbols[cloverIdx], probability: 0.25 };
    }
  }

  const totalProb = symbols.reduce((sum, s) => sum + s.probability, 0);
  let random = Math.random() * totalProb;

  for (const symbol of symbols) {
    random -= symbol.probability;
    if (random <= 0) return symbol;
  }

  return symbols[0];
}

/**
 * Generate initial grid with static values (for SSR hydration)
 */
export function getInitialGrid(): string[] {
  return [
    '🍒', '🍋', '☘️', '🔔', '💎',
    '🍋', '☘️', '🔔', '💎', '💰',
    '☘️', '🔔', '💎', '💰', '7️⃣',
  ];
}

/**
 * Generate random grid for spinning
 */
export function generateRandomGrid(boostClover = false): string[] {
  return Array(15).fill('').map(() => getWeightedRandomSymbol(boostClover).icon);
}

/**
 * Add wild card to grid
 */
export function addWildToGrid(grid: string[]): string[] {
  const newGrid = [...grid];
  const randomIndex = Math.floor(Math.random() * newGrid.length);
  newGrid[randomIndex] = WILD_SYMBOL.icon;
  return newGrid;
}

/**
 * Count occurrences of a symbol in grid
 */
export function countSymbol(grid: string[], symbolIcon: string): number {
  return grid.filter(cell => cell === symbolIcon).length;
}

/**
 * Check if grid has 666 curse (3 or more 6s)
 */
export function hasCurse(grid: string[]): boolean {
  const sixCount = countSymbol(grid, '6️⃣');
  return sixCount >= 3;
}

/**
 * Check payline for wins
 */
export function checkPaylineWin(
  grid: string[],
  payline: number[]
): { matches: number; symbol: string; cells: number[] } | null {
  const symbols = payline.map(idx => grid[idx]);
  const firstSymbol = symbols[0];

  // Count consecutive matches from start
  let matches = 1;
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === firstSymbol || symbols[i] === WILD_SYMBOL.icon) {
      matches++;
    } else {
      break;
    }
  }

  // Need at least 3 matches for a win
  if (matches >= 3) {
    return {
      matches,
      symbol: firstSymbol,
      cells: payline.slice(0, matches),
    };
  }

  return null;
}
