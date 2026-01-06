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
 * Each payline is an array of 5 cell indices, read LEFT to RIGHT.
 * Wins are counted as consecutive matches from the LEFT side.
 */

export const PAYLINES: Payline[] = [
  // === HORIZONTAL LINES (3 lines) ===
  [5, 6, 7, 8, 9],         // 1. 가로 중앙 (Center Horizontal)
  [0, 1, 2, 3, 4],         // 2. 가로 상단 (Top Horizontal)
  [10, 11, 12, 13, 14],    // 3. 가로 하단 (Bottom Horizontal)

  // === V-SHAPE / Λ-SHAPE (2 lines) ===
  [0, 6, 12, 8, 4],        // 4. V자 (V-shape down then up)
  [10, 6, 2, 8, 14],       // 5. 역V자 (Inverted V, up then down)

  // === ZIG-ZAG PATTERNS (4 lines) ===
  [5, 1, 2, 3, 9],         // 6. 지그 상단 (Zig top)
  [5, 11, 12, 13, 9],      // 7. 재그 하단 (Zag bottom)
  [0, 1, 7, 3, 4],         // 8. M자 (M-shape, top corners with center dip)
  [10, 11, 7, 13, 14],     // 9. W자 (W-shape, bottom corners with center rise)

  // === SHALLOW V PATTERNS (2 lines) ===
  [0, 6, 7, 8, 4],         // 10. 얕은 V (Shallow V)
  [10, 6, 7, 8, 14],       // 11. 얕은 역V (Shallow Inverted V)

  // === DIAGONAL PATTERNS (2 lines) ===
  [0, 1, 7, 13, 14],       // 12. 대각선 하강 (Diagonal Descending)
  [10, 11, 7, 3, 4],       // 13. 대각선 상승 (Diagonal Ascending)
];

// Named patterns for display (Korean + English)
export const PAYLINE_NAMES = [
  '가로 중앙',      // 1
  '가로 상단',      // 2
  '가로 하단',      // 3
  'V자',            // 4
  '역V자',          // 5
  '지그 상단',      // 6
  '재그 하단',      // 7
  'M자',            // 8
  'W자',            // 9
  '얕은 V',         // 10
  '얕은 역V',       // 11
  '대각선 하강',    // 12
  '대각선 상승',    // 13
];

export const GRID_SIZE = 15; // 5 columns × 3 rows
export const GRID_COLS = 5;
export const GRID_ROWS = 3;

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
