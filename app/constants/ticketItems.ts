import type { TicketItem } from '@/app/types';

// Ticket-purchasable items (consumable / active / passive)
export const TICKET_ITEMS: Record<string, TicketItem> = {
  // Passive items (permanent effects)
  luckyBell: { name: 'LUCKY BELL', icon: '🔔', price: 5, desc: '+2% BELL', type: 'passive' },
  ticketDoubler: { name: 'TICKET DOUBLER', icon: '🎫', price: 10, desc: '2X TICKETS', type: 'passive' },
  coinMagnet: { name: 'COIN MAGNET', icon: '🧲', price: 8, desc: '+10% WINS', type: 'passive' },

  // Active items (limited use)
  scatterBoost: { name: 'SCATTER BOOST', icon: '⚡', price: 3, desc: '2X SCATTER 5 SPINS', type: 'active', duration: 5 },
  sevenHunter: { name: 'SEVEN HUNTER', icon: '🎯', price: 4, desc: '+5% SEVEN 3 SPINS', type: 'active', duration: 3 },
  crystalBall: { name: 'CRYSTAL BALL', icon: '🔮', price: 4, desc: 'PREVIEW NEXT', type: 'active', duration: 1 },

  // Consumable items (one-time use)
  curseAbsorb: { name: 'CURSE ABSORB', icon: '💀', price: 2, desc: '666→+3 TICKETS', type: 'consumable' },
  instantJackpot: { name: 'MINI JACKPOT', icon: '💎', price: 6, desc: '+500 COINS NOW', type: 'consumable' },
  rerollSpin: { name: 'REROLL', icon: '🔄', price: 2, desc: 'REROLL LAST', type: 'consumable' },
};

export const TICKET_ITEM_KEYS = Object.keys(TICKET_ITEMS);

export type TicketItemKey = keyof typeof TICKET_ITEMS;
