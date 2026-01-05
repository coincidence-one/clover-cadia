import type { RoundConfig } from '@/app/types';

// Round configurations
// Goal: Target credits to reach
// MaxSpins: Spin limit for the round
// Reward: Tickets given on clear

export const ROUNDS: RoundConfig[] = [
  { round: 1, goal: 300, maxSpins: 15, rewardTickets: 1 },
  { round: 2, goal: 800, maxSpins: 20, rewardTickets: 1 },
  { round: 3, goal: 2000, maxSpins: 25, rewardTickets: 2 },
  { round: 4, goal: 5000, maxSpins: 30, rewardTickets: 2 },
  { round: 5, goal: 10000, maxSpins: 35, rewardTickets: 3 },
  { round: 6, goal: 25000, maxSpins: 40, rewardTickets: 3 },
  { round: 7, goal: 50000, maxSpins: 50, rewardTickets: 5 }, // Boss round?
];

export const MAX_ROUND = ROUNDS[ROUNDS.length - 1].round;

export function getRoundConfig(round: number): RoundConfig {
  const config = ROUNDS.find(r => r.round === round);
  if (config) return config;

  // Infinite scaling for higher rounds
  const base = ROUNDS[ROUNDS.length - 1];
  const scale = round - base.round;
  return {
    round,
    goal: Math.floor(base.goal * Math.pow(1.5, scale)),
    maxSpins: Math.min(100, base.maxSpins + scale * 5),
    rewardTickets: 3,
  };
}
