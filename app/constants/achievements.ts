import type { Achievement } from '@/app/types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstWin', name: 'FIRST WIN', desc: 'WIN ONCE', reward: 50, icon: '🏆' },
  { id: 'lucky7', name: 'LUCKY SEVEN', desc: 'HIT 7x3', reward: 200, icon: '7️⃣' },
  { id: 'jackpotHunter', name: 'JACKPOT', desc: 'HIT 7x5', reward: 1000, icon: '💎' },
  { id: 'spin100', name: '100 SPINS', desc: 'SPIN 100X', reward: 300, icon: '🎰' },
  { id: 'spin500', name: '500 SPINS', desc: 'SPIN 500X', reward: 1000, icon: '🎲' },
  { id: 'rich', name: 'HIGH ROLLER', desc: '10000 COINS', reward: 500, icon: '💰' },
  { id: 'survivor', name: 'SURVIVOR', desc: 'SURVIVE 666', reward: 300, icon: '✝️' },
  { id: 'cursed', name: 'CURSED', desc: 'HIT 666', reward: 100, icon: '😈' },
];

export type AchievementId = typeof ACHIEVEMENTS[number]['id'];
