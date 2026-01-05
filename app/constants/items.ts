import type { CoinItem } from '@/app/types';

// Coin-purchasable items
export const ITEMS: Record<string, CoinItem> = {
  luckyCharm: { name: 'LUCKY CHARM', icon: '🍀', price: 200, desc: '+CLOVER%' },
  doubleStar: { name: 'DOUBLE STAR', icon: '⭐', price: 150, desc: '2X WIN' },
  hotStreak: { name: 'HOT STREAK', icon: '🔥', price: 300, desc: '+5 SPINS' },
  shield: { name: 'HOLY SHIELD', icon: '✝️', price: 250, desc: 'BLOCK 666' },
  wildCard: { name: 'WILD CARD', icon: '🃏', price: 400, desc: 'ADD WILD' },
};

export const ITEM_KEYS = Object.keys(ITEMS);

export type ItemKey = keyof typeof ITEMS;
