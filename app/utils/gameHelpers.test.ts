/**
 * Core Game Logic Test Suite
 * Run with: npx tsx app/utils/gameHelpers.test.ts
 */

import {
  checkPaylineWin,
  hasCurse,
  normalizeEmoji,
  symbolsMatch
} from './gameHelpers';
import { SYMBOLS } from '../constants';
import { PAYLINES } from '../constants/paylines';

// Test helper
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${e}`);
  }
}

function assertEqual(actual: unknown, expected: unknown, msg?: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${msg || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ========== TESTS ==========

console.log('\n=== Symbol Matching Tests ===\n');

test('normalizeEmoji should handle multi-codepoint emojis', () => {
  const seven = '7️⃣';
  const normalized = normalizeEmoji(seven);
  assertEqual(normalized, seven);
});

test('symbolsMatch should match identical symbols', () => {
  assertEqual(symbolsMatch('🍒', '🍒', '🃏'), true);
  assertEqual(symbolsMatch('7️⃣', '7️⃣', '🃏'), true);
});

test('symbolsMatch should NOT match different symbols', () => {
  assertEqual(symbolsMatch('🍒', '🍋', '🃏'), false);
  assertEqual(symbolsMatch('7️⃣', '6️⃣', '🃏'), false);
});

test('symbolsMatch should match WILD with any symbol', () => {
  assertEqual(symbolsMatch('🃏', '🍒', '🃏'), true);
  assertEqual(symbolsMatch('🍋', '🃏', '🃏'), true);
  assertEqual(symbolsMatch('🃏', '🃏', '🃏'), true);
});

console.log('\n=== Payline Win Tests ===\n');

test('checkPaylineWin should detect 3 matching symbols', () => {
  const grid = ['🍒', '🍒', '🍒', '🍋', '🔔', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 3);
  assertEqual(result?.symbol, '🍒');
});

test('checkPaylineWin should detect 5 matching symbols', () => {
  const grid = ['🍒', '🍒', '🍒', '🍒', '🍒', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 5);
  assertEqual(result?.symbol, '🍒');
});

test('checkPaylineWin should NOT detect 2 matching symbols', () => {
  const grid = ['🍒', '🍒', '🍋', '🔔', '💎', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result, null);
});

test('checkPaylineWin should handle WILD at start', () => {
  // WILD followed by 4 cherries should count as 5 cherries
  const grid = ['🃏', '🍒', '🍒', '🍒', '🍒', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 5);
  assertEqual(result?.symbol, '🍒'); // Target should be cherry, not wild
});

test('checkPaylineWin should handle WILD in middle', () => {
  const grid = ['🍒', '🍒', '🃏', '🍒', '🍒', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 5);
  assertEqual(result?.symbol, '🍒');
});

test('checkPaylineWin should stop at non-matching symbol', () => {
  const grid = ['🍒', '🍒', '🍒', '🍋', '🍒', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 3); // Only first 3 count
  assertEqual(result?.cells, [0, 1, 2]);
});

test('checkPaylineWin should handle all WILDs', () => {
  const grid = ['🃏', '🃏', '🃏', '🃏', '🃏', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 5);
  assertEqual(result?.symbol, '🃏');
});

console.log('\n=== Curse Detection Tests ===\n');

test('hasCurse should detect 3 sixes', () => {
  const sixIcon = SYMBOLS.find(s => s.id === 'six')?.icon || '6️⃣';
  const grid = [sixIcon, sixIcon, sixIcon, '🍋', '🔔', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  assertEqual(hasCurse(grid), true);
});

test('hasCurse should NOT trigger with 2 sixes', () => {
  const sixIcon = SYMBOLS.find(s => s.id === 'six')?.icon || '6️⃣';
  const grid = [sixIcon, sixIcon, '🍒', '🍋', '🔔', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  assertEqual(hasCurse(grid), false);
});

test('hasCurse should detect sixes anywhere in grid', () => {
  const sixIcon = SYMBOLS.find(s => s.id === 'six')?.icon || '6️⃣';
  const grid = ['🍒', '🍋', sixIcon, '🔔', '💎', '☘️', sixIcon, '☘️', '☘️', '☘️', '💎', '💎', sixIcon, '💎', '💎'];
  assertEqual(hasCurse(grid), true);
});

console.log('\n=== Payline Validation ===\n');

test('All paylines should have 5 cells', () => {
  for (const pl of PAYLINES) {
    assertEqual(pl.length, 5, `Payline ${pl} should have 5 cells`);
  }
});

test('All payline indices should be valid (0-14)', () => {
  for (const pl of PAYLINES) {
    for (const idx of pl) {
      if (idx < 0 || idx > 14) {
        throw new Error(`Invalid index ${idx} in payline ${pl}`);
      }
    }
  }
});

test('Payline cells should be in column order (left to right)', () => {
  for (const pl of PAYLINES) {
    for (let i = 0; i < pl.length; i++) {
      const col = pl[i] % 5;
      if (col !== i) {
        throw new Error(`Payline ${pl} has column mismatch at position ${i}: expected col ${i}, got col ${col}`);
      }
    }
  }
});

console.log('\n=== All Tests Complete ===\n');
