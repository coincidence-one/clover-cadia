import type { Level } from '@/app/types';

export const LEVELS: Level[] = [
  { level: 1, xp: 0, rank: '🥉', name: 'BRONZE' },
  { level: 2, xp: 100, rank: '🥉', name: 'BRONZE' },
  { level: 3, xp: 250, rank: '🥉', name: 'BRONZE' },
  { level: 4, xp: 500, rank: '🥈', name: 'SILVER' },
  { level: 5, xp: 1000, rank: '🥈', name: 'SILVER' },
  { level: 6, xp: 2000, rank: '🥈', name: 'SILVER' },
  { level: 7, xp: 4000, rank: '🥇', name: 'GOLD' },
  { level: 8, xp: 7000, rank: '🥇', name: 'GOLD' },
  { level: 9, xp: 10000, rank: '💎', name: 'DIAMOND' },
  { level: 10, xp: 15000, rank: '👑', name: 'MASTER' },
];

export const DAILY_REWARDS = [50, 75, 100, 150, 200, 300, 500];

export const MAX_LEVEL = LEVELS[LEVELS.length - 1].level;
