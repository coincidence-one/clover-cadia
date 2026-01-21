import type { Payline } from '@/app/types';

/**
 * 5x3 Grid Layout (CloverPit Style):
 * 
 *    Col 0  Col 1  Col 2  Col 3  Col 4
 *   +------+------+------+------+------+
 *   |  0   |  1   |  2   |  3   |  4   |  Row 0 (Top)
 *   +------+------+------+------+------+
 *   |  5   |  6   |  7   |  8   |  9   |  Row 1 (Middle)
 *   +------+------+------+------+------+
 *   |  10  |  11  |  12  |  13  |  14  |  Row 2 (Bottom)
 *   +------+------+------+------+------+
 * 
 * Pattern Priority Rules (CloverPit):
 * - Patterns trigger in order (top to bottom in list)
 * - Higher tier patterns EXCLUDE lower tier patterns from counting
 * - Jackpot is special: all patterns trigger FIRST, then Jackpot adds on top
 */

export interface Pattern {
  id: string;           // Unique identifier
  name: string;
  nameKo: string;
  cells: number[];
  multiplier: number;
  excludes: string[];   // IDs of patterns this one suppresses
  isJackpot?: boolean;  // Special handling for jackpot
  allowPartial?: boolean; // Allow partial matches (3, 4 of 5)
}

export const PATTERNS: Pattern[] = [
  // === 기본 패턴 (Basic) - Index 0~3 ===
  {
    id: 'horizontal',
    name: 'Horizontal',
    nameKo: '가로',
    cells: [5, 6, 7, 8, 9], // Middle row
    multiplier: 1.0,
    excludes: [],
    allowPartial: true,
  },
  {
    id: 'vertical',
    name: 'Vertical',
    nameKo: '세로',
    cells: [2, 7, 12], // Center column
    multiplier: 1.0,
    excludes: [],
    allowPartial: true,
  },
  {
    id: 'diagonal_down',
    name: 'Diagonal',
    nameKo: '대각',
    cells: [0, 6, 12], // Diagonal ↘
    multiplier: 1.0,
    excludes: [],
    allowPartial: true,
  },
  {
    id: 'diagonal_up',
    name: 'Diagonal',
    nameKo: '대각',
    cells: [10, 6, 2], // Diagonal ↗
    multiplier: 1.0,
    excludes: [],
    allowPartial: true,
  },

  // === 확장 패턴 (Extended) - Index 4~5 ===
  {
    id: 'horizontal_l',
    name: 'Horizontal-L',
    nameKo: '가로-L',
    cells: [6, 7, 8, 9, 12, 13, 14], // L-shape
    multiplier: 2.0,
    excludes: ['horizontal'], // 가로 미발동
  },
  {
    id: 'horizontal_xl',
    name: 'Horizontal-XL',
    nameKo: '가로-XL',
    cells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // Top + Middle rows
    multiplier: 3.0,
    excludes: ['horizontal', 'horizontal_l'], // 가로, 가로-L 미발동
  },

  // === 지그재그 패턴 (Zig-Zag) - Index 6~7 ===
  {
    id: 'zig',
    name: 'Zig',
    nameKo: '지그',
    cells: [0, 6, 2, 8, 4], // Zig-zag pattern
    multiplier: 4.0,
    excludes: ['diagonal_down', 'diagonal_up'], // 대각 미발동
  },
  {
    id: 'zag',
    name: 'Zag',
    nameKo: '재그',
    cells: [10, 6, 12, 8, 14], // Reverse zig-zag
    multiplier: 4.0,
    excludes: ['diagonal_down', 'diagonal_up'], // 대각 미발동
  },

  // === 특수 패턴 (Special) - Index 8~10 ===
  {
    id: 'ground',
    name: 'Ground',
    nameKo: '지상',
    cells: [5, 6, 7, 10, 11, 12, 13, 14], // Middle + Bottom rows partial
    multiplier: 7.0,
    excludes: ['zig', 'horizontal_xl'], // 지그, 가로-XL 미발동
  },
  {
    id: 'sky',
    name: 'Sky',
    nameKo: '천상',
    cells: [0, 1, 2, 3, 4, 5, 6, 8, 9], // Top row + Middle partial
    multiplier: 7.0,
    excludes: ['zag', 'horizontal_xl'], // 재그, 가로-XL 미발동
  },
  {
    id: 'eyes',
    name: 'Eyes',
    nameKo: '눈',
    cells: [1, 3, 5, 6, 7, 8, 9, 11, 13], // Eye pattern
    multiplier: 8.0,
    excludes: ['vertical'], // 세로 패턴 미발동 (columns 2, 4)
  },

  // === 잭팟 (Jackpot) - Index 11 ===
  {
    id: 'jackpot',
    name: 'Jackpot',
    nameKo: '잭팟',
    cells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // All 15 cells
    multiplier: 10.0,
    excludes: [], // Jackpot doesn't suppress - it ADDS to all others
    isJackpot: true,
  },
];

// Legacy PAYLINES for backward compatibility
export const PAYLINES: Payline[] = PATTERNS.map(p => p.cells as Payline);

// Pattern names for display
export const PAYLINE_NAMES = PATTERNS.map(p => p.nameKo);

// Pattern multipliers
export const PATTERN_MULTIPLIERS = PATTERNS.map(p => p.multiplier);

export const GRID_SIZE = 15;
export const GRID_COLS = 5;
export const GRID_ROWS = 3;

/**
 * Get pattern by ID
 */
export function getPatternById(id: string): Pattern | undefined {
  return PATTERNS.find(p => p.id === id);
}

/**
 * Get pattern by index
 */
export function getPattern(index: number): Pattern | undefined {
  return PATTERNS[index];
}

/**
 * Helper to get row and column from cell index
 */
export function getCellPosition(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / GRID_COLS),
    col: index % GRID_COLS,
  };
}

/**
 * Helper to get cell index from row and column
 */
export function getCellIndex(row: number, col: number): number {
  return row * GRID_COLS + col;
}
