import type { GameSymbol } from '@/app/types';
import { SYMBOLS, WILD_SYMBOL } from '@/app/constants';

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
  activeTicketEffects: Record<string, any> = {}
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
  activeTicketEffects: Record<string, any> = {}
): Record<string, { current: number, base: number, changed: 'up' | 'down' | 'same' }> {

  const currentSymbols = getActiveSymbols(activeBonuses, activeTicketEffects);
  const totalWeight = currentSymbols.reduce((sum, s) => sum + s.probability, 0);

  const result: Record<string, any> = {};

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
  activeTicketEffects: Record<string, any> = {}
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
  return [
    '🍒', '🍋', '☘️', '🔔', '💎',
    '🍋', '☘️', '🔔', '💎', '💰',
    '☘️', '🔔', '💎', '💰', '7️⃣',
  ];
}

export function generateRandomGrid(
  activeBonuses: string[] = [],
  activeTicketEffects: Record<string, any> = {}
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

export function checkPaylineWin(
  grid: string[],
  payline: number[]
): { matches: number; symbol: string; cells: number[] } | null {
  if (payline.length < 3) return null;

  const wildIcon = normalizeEmoji(WILD_SYMBOL.icon);
  const symbols = payline.map(idx => {
    if (idx < 0 || idx >= grid.length) return '';
    return normalizeEmoji(grid[idx]);
  });

  let targetSymbol = '';
  for (const sym of symbols) {
    if (sym !== wildIcon && sym !== '') {
      targetSymbol = sym;
      break;
    }
  }

  if (targetSymbol === '') {
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

  let matches = 0;
  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    if (sym === targetSymbol || sym === wildIcon) {
      matches++;
    } else {
      break;
    }
  }

  if (matches >= 3) {
    return {
      matches,
      symbol: targetSymbol,
      cells: payline.slice(0, matches),
    };
  }

  return null;
}
