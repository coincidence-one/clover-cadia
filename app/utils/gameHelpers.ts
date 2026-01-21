import type { GameSymbol } from '@/app/types';
import { SYMBOLS, WILD_SYMBOL, TALISMANS } from '@/app/constants';
import type { TalismanRarity } from '@/app/constants/talismans';

/**
 * Normalize emoji string for consistent comparison
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

  if (normA === normWild || normB === normWild) return true;
  return normA === normB;
}

/**
 * Calculate active symbol weights based on game state
 * Centralizes logic for both spinning and UI display
 */
export function getActiveSymbols(
  activeBonuses: string[] = [],
  activeTicketEffects: Record<string, number> = {}
): GameSymbol[] {
  // Clone symbols to avoid mutation
  const symbols = SYMBOLS.map(s => ({ ...s }));

  // 1. Apply Lucky Charm (Ticket Item)
  // luckyCharm boosts Clover probability significantly (0.149 -> 0.25)
  if ((activeTicketEffects['luckyCharm'] || 0) > 0) {
    const clover = symbols.find(s => s.id === 'clover');
    if (clover) clover.probability = 0.25;
  }

  // 2. Apply Phone Bonuses (Permanent Buffs)
  // buff_X_up increases probability by flat amount (e.g. +0.05) or percentage?
  // Let's assume +5% probability weight
  const BUFF_AMOUNT = 0.05;

  if (activeBonuses.includes('buff_cherry_up')) {
    const s = symbols.find(x => x.id === 'cherry');
    if (s) s.probability += BUFF_AMOUNT;
  }
  if (activeBonuses.includes('buff_lemon_up')) {
    const s = symbols.find(x => x.id === 'lemon');
    if (s) s.probability += BUFF_AMOUNT;
  }
  if (activeBonuses.includes('buff_clover_up')) {
    const s = symbols.find(x => x.id === 'clover');
    if (s) s.probability += BUFF_AMOUNT;
  }
  if (activeBonuses.includes('buff_bell_up')) {
    const s = symbols.find(x => x.id === 'bell');
    if (s) s.probability += BUFF_AMOUNT;
  }
  if (activeBonuses.includes('buff_seven_up')) {
    const s = symbols.find(x => x.id === 'seven');
    if (s) s.probability += 0.02; // +2% for legendary
  }

  // 3. Risk Bonuses
  if (activeBonuses.includes('risk_cursed_luck')) {
    // Increase 666 (curse) and 777 (jackpot)
    const six = symbols.find(x => x.id === 'six');
    if (six) six.probability += 0.02;
    const seven = symbols.find(x => x.id === 'seven');
    if (seven) seven.probability += 0.02;
  }

  return symbols;
}

/**
 * Get display probabilities (normalized percentages)
 */
export function getDisplayProbabilities(
  activeBonuses: string[] = [],
  activeTicketEffects: Record<string, number> = {}
): Record<string, { current: number, base: number, changed: 'up' | 'down' | 'same' }> {

  const currentSymbols = getActiveSymbols(activeBonuses, activeTicketEffects);
  const totalWeight = currentSymbols.reduce((sum, s) => sum + s.probability, 0);

  const result: Record<string, { current: number, base: number, changed: 'up' | 'down' | 'same' }> = {};

  SYMBOLS.forEach(baseSym => {
    const currentSym = currentSymbols.find(s => s.id === baseSym.id)!;

    // Normalize to 100%
    // Base total weight is ~1.015, we should normalize that too for fair comparison
    const baseTotal = SYMBOLS.reduce((sum, s) => sum + s.probability, 0);

    const basePct = (baseSym.probability / baseTotal) * 100;
    const currentPct = (currentSym.probability / totalWeight) * 100;

    let changed: 'up' | 'down' | 'same' = 'same';
    if (Math.abs(currentPct - basePct) > 0.1) {
      changed = currentPct > basePct ? 'up' : 'down';
    }

    result[baseSym.id] = {
      current: Number(currentPct.toFixed(1)),
      base: Number(basePct.toFixed(1)),
      changed
    };
  });

  return result;
}

/**
 * Get a random symbol based on weighted probabilities
 */
export function getWeightedRandomSymbol(
  activeBonuses: string[] = [],
  activeTicketEffects: Record<string, number> = {}
): GameSymbol {
  const symbols = getActiveSymbols(activeBonuses, activeTicketEffects);
  const totalProb = symbols.reduce((sum, s) => sum + s.probability, 0);
  let random = Math.random() * totalProb;

  for (const symbol of symbols) {
    random -= symbol.probability;
    if (random <= 0) return symbol;
  }

  return symbols[0];
}

/**
 * Generate boolean checks helpers
 */
export function getInitialGrid(): string[] {
  // Map simple IDs to actual icons
  const initialLayout = [
    'cherry', 'lemon', 'clover', 'bell', 'diamond',
    'lemon', 'clover', 'bell', 'diamond', 'treasure',
    'clover', 'bell', 'diamond', 'treasure', 'seven',
  ];

  return initialLayout.map(id => {
    const sym = SYMBOLS.find(s => s.id === id);
    return sym ? sym.icon : '';
  });
}

export function generateRandomGrid(
  activeBonuses: string[] = [],
  activeTicketEffects: Record<string, number> = {}
): string[] {
  return Array(15).fill('').map(() =>
    getWeightedRandomSymbol(activeBonuses, activeTicketEffects).icon
  );
}

export function addWildToGrid(grid: string[]): string[] {
  const newGrid = [...grid];
  const randomIndex = Math.floor(Math.random() * newGrid.length);
  newGrid[randomIndex] = WILD_SYMBOL.icon;
  return newGrid;
}

export function countSymbol(grid: string[], symbolIcon: string): number {
  const normalizedTarget = normalizeEmoji(symbolIcon);
  return grid.filter(cell => normalizeEmoji(cell) === normalizedTarget).length;
}

export function hasCurse(grid: string[]): boolean {
  const sixSymbol = SYMBOLS.find(s => s.id === 'six');
  if (!sixSymbol) return false;
  const sixCount = countSymbol(grid, sixSymbol.icon);
  return sixCount >= 3;
}

/**
 * Check if a pattern is fully matched (CloverPit Style)
 * ALL cells in the pattern must contain the SAME symbol (or WILD substitutes)
 * Returns the matched symbol and all pattern cells if successful
 */
export function checkPatternWin(
  grid: string[],
  patternCells: number[],
  patternIndex: number,
  allowPartial: boolean = false
): { symbol: string; cells: number[]; patternIndex: number; matchCount: number } | null {
  if (patternCells.length < 3) return null;

  const wildIcon = normalizeEmoji(WILD_SYMBOL.icon);

  // Get symbols in pattern order
  const symbols = patternCells.map(idx => {
    if (idx < 0 || idx >= grid.length) return '';
    return normalizeEmoji(grid[idx]);
  });

  // 1. Determine Target Symbol
  // Use the first non-wild symbol as our target
  let targetSymbol = '';
  for (const sym of symbols) {
    if (sym !== wildIcon && sym !== '') {
      targetSymbol = sym;
      break;
    }
  }

  // If completely empty or all wilds (rare/impossible usually)
  // If all wilds, we treat WILD as the target
  if (targetSymbol === '') {
    // If we have at least 3 valid symbols (wilds)
    if (symbols.slice(0, 3).every(s => s === wildIcon)) {
      targetSymbol = WILD_SYMBOL.icon;
    } else {
      return null;
    }
  }

  // 2. Check Matches
  if (allowPartial) {
    // Left-to-Right consecutive matching
    let matchCount = 0;
    for (const sym of symbols) {
      if (sym === targetSymbol || sym === wildIcon) {
        matchCount++;
      } else {
        break; // Stop at first mismatch
      }
    }

    if (matchCount >= 3) {
      return {
        symbol: targetSymbol,
        cells: patternCells.slice(0, matchCount),
        patternIndex,
        matchCount,
      };
    }

  } else {
    // Strict Full Match (All cells must match)
    const allMatch = symbols.every(sym => sym === targetSymbol || sym === wildIcon);
    if (allMatch) {
      return {
        symbol: targetSymbol,
        cells: [...patternCells],
        patternIndex,
        matchCount: patternCells.length,
      };
    }
  }

  return null;
}

/**
 * Legacy function for backward compatibility
 * Now wraps checkPatternWin behavior
 */
export function checkPaylineWin(
  grid: string[],
  payline: number[]
): { matches: number; symbol: string; cells: number[] } | null {
  // Legacy support implies linear check, so we allow partials
  const result = checkPatternWin(grid, payline, 0, true);
  if (result) {
    return {
      matches: result.matchCount,
      symbol: result.symbol,
      cells: result.cells,
    };
  }
  return null;
}
/**
 * Generate a randomized list of talismans for the shop
 * Rarity Weights: Common (50%), Uncommon (30%), Rare (15%), Legendary (5%)
 * @param count - Number of talismans to show
 * @param ownedIds - Already owned talisman IDs (excluded from shop)
 * @param unlockedIds - Talismans unlocked in Soul Shop (if empty, show all)
 */
export function refreshTalismanShop(
  count: number = 3,
  ownedIds: string[] = [],
  unlockedIds: string[] = []
): string[] {
  let allTalismans = Object.values(TALISMANS);

  // If unlockedIds is provided and not empty, filter to only show unlocked talismans
  if (unlockedIds.length > 0) {
    allTalismans = allTalismans.filter(t => unlockedIds.includes(t.id));
  }

  const selected: string[] = [];

  // Filter out already owned
  const available = allTalismans.filter(t => !ownedIds.includes(t.id));

  for (let i = 0; i < count; i++) {
    const rand = Math.random() * 100;
    let targetRarity: TalismanRarity = 'common';

    if (rand > 95) targetRarity = 'legendary';
    else if (rand > 80) targetRarity = 'rare';
    else if (rand > 50) targetRarity = 'uncommon';

    // Find candidates of this rarity
    let candidates = available.filter(t => t.rarity === targetRarity && !selected.includes(t.id));

    // Fallback if no candidates of rarity
    if (candidates.length === 0) {
      candidates = available.filter(t => !selected.includes(t.id));
    }

    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      selected.push(pick.id);
    }
  }

  return selected;
}

