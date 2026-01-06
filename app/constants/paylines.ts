import type { Payline } from '@/app/types';

/**
 * 5x3 Grid Layout:
 * 
 *    Col 0  Col 1  Col 2  Col 3  Col 4
 *   +------+------+------+------+------+
 *   |  0   |  1   |  2   |  3   |  4   |  Row 0
 *   +------+------+------+------+------+
 *   |  5   |  6   |  7   |  8   |  9   |  Row 1
 *   +------+------+------+------+------+
 *   |  10  |  11  |  12  |  13  |  14  |  Row 2
 *   +------+------+------+------+------+
 * 
 * Each payline is an array of 5 cell indices, read LEFT to RIGHT.
 * Wins are counted as consecutive matches from the LEFT side.
 */

export const PAYLINES: Payline[] = [
  // === HORIZONTAL LINES (3 lines) ===
  [0, 1, 2, 3, 4],       // Row 0: Top horizontal
  [5, 6, 7, 8, 9],       // Row 1: Middle horizontal
  [10, 11, 12, 13, 14],  // Row 2: Bottom horizontal

  // === DIAGONAL LINES (2 lines) ===
  [0, 6, 12, 8, 4],      // V-shape: top-left -> center -> top-right (Invalid - going back up after going down)
  [10, 6, 2, 8, 14],     // Λ-shape: bottom-left -> center -> bottom-right (Invalid - same issue)

  // Actually, let me reconsider. Standard slot diagonals are:
  // Diagonal down: 0 -> 6 -> 12 (but we need 5 symbols)
  // The issue is a 5x3 grid only has 3 rows, so true 5-cell diagonals don't exist.
  // Instead, we use ZIG-ZAG patterns.

  // Let me fix these to be proper zig-zag patterns that make visual sense:
];

// CORRECTED PAYLINES - Using only visually sensible patterns
export const PAYLINES_V2: Payline[] = [
  // === HORIZONTAL LINES (3 lines) ===
  [0, 1, 2, 3, 4],       // Top row
  [5, 6, 7, 8, 9],       // Middle row  
  [10, 11, 12, 13, 14],  // Bottom row

  // === V-SHAPE / ZIG-ZAG PATTERNS ===
  // V-shape (down then up): Row 0 -> Row 1 -> Row 2 -> Row 1 -> Row 0
  [0, 6, 12, 8, 4],      // Starts top-left, dips to center-bottom, rises to top-right

  // Inverted V (up then down): Row 2 -> Row 1 -> Row 0 -> Row 1 -> Row 2
  [10, 6, 2, 8, 14],     // Starts bottom-left, rises to center-top, dips to bottom-right

  // === W-SHAPE PATTERNS ===
  // W (up-down-up-down): Row 0 -> Row 1 -> Row 0 -> Row 1 -> Row 0
  [0, 6, 2, 8, 4],       // Top corners with middle dips

  // M (down-up-down-up): Row 2 -> Row 1 -> Row 2 -> Row 1 -> Row 2  
  [10, 6, 12, 8, 14],    // Bottom corners with middle rises
];

// Export the corrected version
export { PAYLINES_V2 as PAYLINES_CORRECTED };

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

/**
 * Validate that a payline has valid indices and makes visual sense
 */
export function validatePayline(payline: Payline): boolean {
  // Check all indices are valid
  for (const idx of payline) {
    if (idx < 0 || idx >= GRID_SIZE) return false;
  }

  // Check that columns are in order (left to right)
  for (let i = 0; i < payline.length; i++) {
    const col = getCellPosition(payline[i]).col;
    if (col !== i) {
      console.warn(`Payline column mismatch at position ${i}: expected col ${i}, got col ${col}`);
      return false;
    }
  }

  return true;
}

// Validate all paylines on module load (debug)
if (typeof window !== 'undefined') {
  PAYLINES.forEach((pl, idx) => {
    if (!validatePayline(pl)) {
      console.error(`Invalid payline at index ${idx}:`, pl);
    }
  });
}
