import type { Payline } from '@/app/types';

// 5x3 grid paylines (7 total)
// Grid layout: 
//  0  1  2  3  4   (top row)
//  5  6  7  8  9   (middle row)
// 10 11 12 13 14   (bottom row)

export const PAYLINES: Payline[] = [
  // Horizontal lines
  [0, 1, 2, 3, 4],      // Top row
  [5, 6, 7, 8, 9],      // Middle row
  [10, 11, 12, 13, 14], // Bottom row
  // Diagonal lines (Zig-Zag)
  [0, 6, 12, 8, 4],     // V shape
  [10, 6, 2, 8, 14],    // Inverted V
  // W patterns
  [0, 6, 2, 8, 4],      // W top
  [10, 6, 12, 8, 14],   // W bottom
];

export const GRID_SIZE = 15; // 5 columns × 3 rows
export const GRID_COLS = 5;
export const GRID_ROWS = 3;
