import type { GameSymbol } from '@/app/types';
import { SYMBOLS, WILD_SYMBOL } from '@/app/constants';

/**
 * Normalize emoji string for consistent comparison
 * Some emojis like 7️⃣ have variation selectors that can cause comparison issues
 */
export function normalizeEmoji(emoji: string): string {
  return emoji.normalize('NFC');
}

/**
 * Check if two symbols match (handles WILD card)
 */
export function symbolsMatch(a: string, b: string, wildIcon: string): boolean {
  const normA = normalizeEmoji(a);
  const normB = normalizeEmoji(b);
  const normWild = normalizeEmoji(wildIcon);

  // WILD matches anything
  if (normA === normWild || normB === normWild) return true;

  return normA === normB;
}

/**
 * Get a random symbol based on weighted probabilities
 * @param boostClover - If true, increases clover probability
 */
export function getWeightedRandomSymbol(boostClover = false): GameSymbol {
  const symbols = SYMBOLS.map(s => ({ ...s })); // Clone to avoid mutation

  // Boost clover probability if lucky charm active
  if (boostClover) {
    const cloverIdx = symbols.findIndex(s => s.id === 'clover');
    if (cloverIdx !== -1) {
      symbols[cloverIdx].probability = 0.25;
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
 * Count occurrences of a symbol in grid (normalized comparison)
 */
export function countSymbol(grid: string[], symbolIcon: string): number {
  const normalizedTarget = normalizeEmoji(symbolIcon);
  return grid.filter(cell => normalizeEmoji(cell) === normalizedTarget).length;
}

/**
 * Check if grid has 666 curse (3 or more 6s)
 * Uses normalized comparison for reliable emoji matching
 */
export function hasCurse(grid: string[]): boolean {
  const sixSymbol = SYMBOLS.find(s => s.id === 'six');
  if (!sixSymbol) return false;

  const sixCount = countSymbol(grid, sixSymbol.icon);
  return sixCount >= 3;
}

/**
 * Check payline for wins - FIXED VERSION
 * 
 * Rules:
 * 1. Matches must be CONSECUTIVE from the LEFT
 * 2. WILD can substitute for any symbol
 * 3. If first symbol is WILD, use the next non-WILD symbol as target
 * 4. Need at least 3 consecutive matches for a win
 */
export function checkPaylineWin(
  grid: string[],
  payline: number[]
): { matches: number; symbol: string; cells: number[] } | null {
  if (payline.length < 3) return null;

  const wildIcon = normalizeEmoji(WILD_SYMBOL.icon);
  const symbols = payline.map(idx => {
    if (idx < 0 || idx >= grid.length) {
      console.error(`Invalid payline index: ${idx}`);
      return '';
    }
    return normalizeEmoji(grid[idx]);
  });

  // Find the target symbol (first non-WILD symbol)
  let targetSymbol = '';
  for (const sym of symbols) {
    if (sym !== wildIcon && sym !== '') {
      targetSymbol = sym;
      break;
    }
  }

  // If all symbols are WILD (or empty), that's a win with WILDs
  if (targetSymbol === '') {
    // All WILDs - count them as match
    const wildCount = symbols.filter(s => s === wildIcon).length;
    if (wildCount >= 3) {
      return {
        matches: wildCount,
        symbol: WILD_SYMBOL.icon,
        cells: payline.slice(0, wildCount),
      };
    }
    return null;
  }

  // Count consecutive matches from the LEFT
  let matches = 0;
  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];

    // Symbol matches if it equals target OR is WILD
    if (sym === targetSymbol || sym === wildIcon) {
      matches++;
    } else {
      // Chain broken - stop counting
      break;
    }
  }

  // Need at least 3 matches for a win
  if (matches >= 3) {
    return {
      matches,
      symbol: targetSymbol,
      cells: payline.slice(0, matches),
    };
  }

  return null;
}

/**
 * Debug helper: Log grid state
 */
export function debugGrid(grid: string[]): void {
  console.log('Grid State:');
  console.log(`  ${grid.slice(0, 5).join(' ')}`);
  console.log(`  ${grid.slice(5, 10).join(' ')}`);
  console.log(`  ${grid.slice(10, 15).join(' ')}`);
}

/**
 * Debug helper: Log payline check result
 */
export function debugPayline(grid: string[], payline: number[], result: ReturnType<typeof checkPaylineWin>): void {
  const symbols = payline.map(idx => grid[idx]);
  console.log(`Payline [${payline.join(',')}]: ${symbols.join(' ')} => ${result ? `WIN! ${result.matches}x ${result.symbol}` : 'No win'}`);
}
