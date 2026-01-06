import type { RoundConfig } from '@/app/types';

// Round configurations
// Goal: Target credits to reach
// Safe: High Cost, High Spins, Low Ticket Reward
// Risky: Low Cost, Low Spins, High Ticket Reward

export const ROUNDS: RoundConfig[] = [
  // Intro / Tutorial phase
  {
    round: 1,
    goal: 150,
    safe: { spins: 10, cost: 40, rewardTickets: 1 },
    risky: { spins: 4, cost: 15, rewardTickets: 2 }
  },
  {
    round: 2,
    goal: 300,
    safe: { spins: 12, cost: 50, rewardTickets: 1 },
    risky: { spins: 5, cost: 20, rewardTickets: 2 }
  },
  {
    round: 3,
    goal: 500,
    safe: { spins: 15, cost: 70, rewardTickets: 2 },
    risky: { spins: 6, cost: 30, rewardTickets: 2 } // Bonus ticket for R3 risky? Or same?
  },

  // Mid-game
  {
    round: 4,
    goal: 800,
    safe: { spins: 20, cost: 100, rewardTickets: 2 },
    risky: { spins: 8, cost: 40, rewardTickets: 3 }
  },
  {
    round: 5,
    goal: 1200,
    safe: { spins: 25, cost: 120, rewardTickets: 2 },
    risky: { spins: 10, cost: 50, rewardTickets: 3 }
  },
  {
    round: 6,
    goal: 1800,
    safe: { spins: 30, cost: 150, rewardTickets: 3 },
    risky: { spins: 12, cost: 60, rewardTickets: 4 }
  },

  // Late-game (Challenging)
  {
    round: 7,
    goal: 2600,
    safe: { spins: 35, cost: 180, rewardTickets: 3 },
    risky: { spins: 14, cost: 70, rewardTickets: 4 }
  },
  {
    round: 8,
    goal: 4000,
    safe: { spins: 40, cost: 220, rewardTickets: 4 },
    risky: { spins: 16, cost: 90, rewardTickets: 5 }
  },
  {
    round: 9,
    goal: 6000,
    safe: { spins: 45, cost: 260, rewardTickets: 4 },
    risky: { spins: 18, cost: 110, rewardTickets: 5 }
  },

  // Boss
  {
    round: 10,
    goal: 10000,
    safe: { spins: 50, cost: 300, rewardTickets: 5 },
    risky: { spins: 20, cost: 150, rewardTickets: 6 }
  },
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
    goal: Math.floor(base.goal * Math.pow(1.3, scale)),
    safe: {
      spins: Math.min(100, base.safe.spins + scale * 5),
      cost: Math.floor(base.safe.cost * 1.2),
      rewardTickets: 3
    },
    risky: {
      spins: Math.min(40, base.risky.spins + scale * 2),
      cost: Math.floor(base.risky.cost * 1.2),
      rewardTickets: 4
    }
  };
}
