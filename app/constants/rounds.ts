import type { RoundConfig } from '@/app/types';

// Round configurations
// Goal: Target credits to reach
// MaxSpins: Spin limit for the round
// Reward: Tickets given on clear

export const ROUNDS: RoundConfig[] = [
  // Intro / Tutorial phase
  { round: 1, goal: 50, maxSpins: 10, rewardTickets: 1 },  // Very easy
  { round: 2, goal: 150, maxSpins: 12, rewardTickets: 1 }, // Easy
  { round: 3, goal: 350, maxSpins: 15, rewardTickets: 2 }, // Moderate start

  // Mid-game
  { round: 4, goal: 600, maxSpins: 20, rewardTickets: 2 },
  { round: 5, goal: 1000, maxSpins: 25, rewardTickets: 2 },
  { round: 6, goal: 1600, maxSpins: 30, rewardTickets: 3 },

  // Late-game (Challenging)
  { round: 7, goal: 2500, maxSpins: 35, rewardTickets: 3 },
  { round: 8, goal: 4000, maxSpins: 40, rewardTickets: 4 },
  { round: 9, goal: 6500, maxSpins: 45, rewardTickets: 4 },

  // Boss
  { round: 10, goal: 10000, maxSpins: 50, rewardTickets: 5 },
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
    goal: Math.floor(base.goal * Math.pow(1.3, scale)), // Reduced scaling from 1.5 to 1.3
    maxSpins: Math.min(100, base.maxSpins + scale * 5),
    rewardTickets: 3,
  };
}
