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
import { SYMBOLS, WILD_SYMBOL } from '../constants';
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
  assertEqual(symbolsMatch('🍒', '🍒', WILD_SYMBOL.icon), true);
  assertEqual(symbolsMatch('7️⃣', '7️⃣', WILD_SYMBOL.icon), true);
});

test('symbolsMatch should NOT match different symbols', () => {
  assertEqual(symbolsMatch('🍒', '🍋', WILD_SYMBOL.icon), false);
  assertEqual(symbolsMatch('7️⃣', '6️⃣', WILD_SYMBOL.icon), false);
});

test('symbolsMatch should match WILD with any symbol', () => {
  assertEqual(symbolsMatch(WILD_SYMBOL.icon, '🍒', WILD_SYMBOL.icon), true);
  assertEqual(symbolsMatch('🍋', WILD_SYMBOL.icon, WILD_SYMBOL.icon), true);
  assertEqual(symbolsMatch(WILD_SYMBOL.icon, WILD_SYMBOL.icon, WILD_SYMBOL.icon), true);
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
  const grid = [WILD_SYMBOL.icon, '🍒', '🍒', '🍒', '🍒', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 5);
  assertEqual(result?.symbol, '🍒'); // Target should be cherry, not wild
});

test('checkPaylineWin should handle WILD in middle', () => {
  const grid = ['🍒', '🍒', WILD_SYMBOL.icon, '🍒', '🍒', '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
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
  const grid = [WILD_SYMBOL.icon, WILD_SYMBOL.icon, WILD_SYMBOL.icon, WILD_SYMBOL.icon, WILD_SYMBOL.icon, '☘️', '☘️', '☘️', '☘️', '☘️', '💎', '💎', '💎', '💎', '💎'];
  const result = checkPaylineWin(grid, [0, 1, 2, 3, 4]);
  assertEqual(result?.matches, 5);
  assertEqual(result?.symbol, WILD_SYMBOL.icon);
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

console.log('\n=== Payline Validation (Skipped due to Pattern variety) ===\n');

console.log('\n=== All Tests Complete ===\n');
