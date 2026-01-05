import type { PhoneBonus } from '@/app/types';

// Phone Bonus Definitions
// ID Convention: buff_*, risk_*, special_*

export const PHONE_BONUSES: PhoneBonus[] = [
  // --- BUFFS (Common to Rare) ---
  { id: 'buff_small_coin', name: 'POCKET CHANGE', icon: '🪙', desc: '+200 STARTING COINS', type: 'buff', rarity: 'common' },
  { id: 'buff_med_coin', name: 'SALARY', icon: '💰', desc: '+500 STARTING COINS', type: 'buff', rarity: 'rare' },
  { id: 'buff_ticket', name: 'FREE TICKET', icon: '🎟️', desc: '+1 TICKET', type: 'buff', rarity: 'common' },
  { id: 'buff_spin_5', name: 'EXTRA TIME', icon: '⏰', desc: '+5 MAX SPINS', type: 'buff', rarity: 'rare' },

  // -- PERMANENT STAT BUFFS ---
  { id: 'buff_cherry_up', name: 'SWEET CHERRY', icon: '🍒', desc: 'CHERRY PROB +2%', type: 'buff', rarity: 'common' },
  { id: 'buff_lemon_up', name: 'SOUR LEMON', icon: '🍋', desc: 'LEMON PROB +2%', type: 'buff', rarity: 'common' },
  { id: 'buff_clover_up', name: 'LUCKY FIELD', icon: '☘️', desc: 'CLOVER PROB +2%', type: 'buff', rarity: 'rare' },
  { id: 'buff_bell_up', name: 'RING RING', icon: '🔔', desc: 'BELL PROB +2%', type: 'buff', rarity: 'rare' },
  { id: 'buff_seven_up', name: 'SEVEN HEAVEN', icon: '7️⃣', desc: 'SEVEN PROB +1%', type: 'buff', rarity: 'legendary' },

  // --- SPECIAL ---
  { id: 'special_discount', name: 'V.I.P CLUB', icon: '💳', desc: 'TICKET SHOP 20% OFF', type: 'special', rarity: 'legendary' },

  // --- RISKS (High Risk, High Reward) ---
  { id: 'risk_coin_greed', name: 'GREEDY DEAL', icon: '👺', desc: '-50% CURRENT COINS, BUT +10 MAX SPINS', type: 'risk', rarity: 'rare' },
  { id: 'risk_glass_cannon', name: 'GLASS CANNON', icon: '⚔️', desc: '-5 MAX SPINS, BUT ALL WINS x1.5', type: 'risk', rarity: 'legendary' },
  { id: 'risk_cursed_luck', name: 'DEVIL DEAL', icon: '😈', desc: '666 PROB +1%, BUT 777 PROB +2%', type: 'risk', rarity: 'legendary' },
];

/**
 * Get 3 random phone choices based on round and context
 */
export function generatePhoneChoices(round: number, hasCurseTriggered: boolean): PhoneBonus[] {
  const choices: PhoneBonus[] = [];
  const pool = [...PHONE_BONUSES];

  // Filter logic could be added here (e.g. dont show heavy risks early)

  // Always 3 choices
  for (let i = 0; i < 3; i++) {
    if (pool.length === 0) break;
    const idx = Math.floor(Math.random() * pool.length);
    choices.push(pool[idx]);
    pool.splice(idx, 1); // Avoid duplicates in one call
  }

  return choices;
}
