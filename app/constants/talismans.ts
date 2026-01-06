import type { TicketItem } from '@/app/types';

/**
 * CloverPit Talisman System (부적)
 * 
 * Talismans are purchased with Clover Tickets.
 * Rarities: Common (일반) < Uncommon (고급) < Rare (희귀) < Legendary (전설)
 * 
 * Types:
 * - passive: Permanent effect while owned
 * - active: Duration-based effect
 * - consumable: One-time use
 * - golden: Permanently increases symbol value
 */

export type TalismanRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Talisman extends TicketItem {
  id: string;
  rarity: TalismanRarity;
  targetSymbol?: string; // For golden series
  valueBoost?: number;   // Amount to increase symbol value
}

export const TALISMANS: Record<string, Talisman> = {
  // ===== 황금 시리즈 (Golden Series) - Symbol Value Boost =====
  golden_cherry: {
    id: 'golden_cherry',
    name: '황금 체리',
    icon: '🍒✨',
    price: 3,
    desc: '체리 가치 +1',
    type: 'passive',
    rarity: 'common',
    targetSymbol: 'cherry',
    valueBoost: 1,
  },
  golden_lemon: {
    id: 'golden_lemon',
    name: '황금 레몬',
    icon: '🍋✨',
    price: 3,
    desc: '레몬 가치 +1',
    type: 'passive',
    rarity: 'common',
    targetSymbol: 'lemon',
    valueBoost: 1,
  },
  golden_clover: {
    id: 'golden_clover',
    name: '황금 클로버',
    icon: '☘️✨',
    price: 5,
    desc: '클로버 가치 +1',
    type: 'passive',
    rarity: 'uncommon',
    targetSymbol: 'clover',
    valueBoost: 1,
  },
  golden_bell: {
    id: 'golden_bell',
    name: '황금 종',
    icon: '🔔✨',
    price: 5,
    desc: '종 가치 +1',
    type: 'passive',
    rarity: 'uncommon',
    targetSymbol: 'bell',
    valueBoost: 1,
  },
  golden_diamond: {
    id: 'golden_diamond',
    name: '황금 다이아',
    icon: '💎✨',
    price: 8,
    desc: '다이아 가치 +1',
    type: 'passive',
    rarity: 'rare',
    targetSymbol: 'diamond',
    valueBoost: 1,
  },
  golden_treasure: {
    id: 'golden_treasure',
    name: '황금 보물',
    icon: '💰✨',
    price: 8,
    desc: '보물 가치 +1',
    type: 'passive',
    rarity: 'rare',
    targetSymbol: 'treasure',
    valueBoost: 1,
  },
  golden_seven: {
    id: 'golden_seven',
    name: '황금 7',
    icon: '7️⃣✨',
    price: 12,
    desc: '세븐 가치 +1',
    type: 'passive',
    rarity: 'legendary',
    targetSymbol: 'seven',
    valueBoost: 1,
  },

  // ===== 방어 아이템 (Protection) =====
  bible: {
    id: 'bible',
    name: '성경',
    icon: '📖',
    price: 4,
    desc: '666 방어 (1회)',
    type: 'consumable',
    rarity: 'common',
  },
  rosary: {
    id: 'rosary',
    name: '묵주',
    icon: '📿',
    price: 10,
    desc: '666 방어 (영구)',
    type: 'passive',
    rarity: 'rare',
  },

  // ===== 코인 보너스 (Coin Bonus) =====
  lucky_cat: {
    id: 'lucky_cat',
    name: '행운의 고양이',
    icon: '🐱',
    price: 4,
    desc: '스핀당 +1 코인',
    type: 'passive',
    rarity: 'common',
  },
  fat_cat: {
    id: 'fat_cat',
    name: '뚱뚱한 고양이',
    icon: '😺',
    price: 15,
    desc: '스핀당 +3 코인',
    type: 'passive',
    rarity: 'legendary',
  },
  fake_coin: {
    id: 'fake_coin',
    name: '가짜 동전',
    icon: '🪙',
    price: 2,
    desc: '라운드 시작 +10 코인',
    type: 'passive',
    rarity: 'common',
  },
  lost_wallet: {
    id: 'lost_wallet',
    name: '잃어버린 지갑',
    icon: '👛',
    price: 4,
    desc: '게임 시작 +50 코인 (1회)',
    type: 'consumable',
    rarity: 'common',
  },
  grandma_wallet: {
    id: 'grandma_wallet',
    name: '할머니의 지갑',
    icon: '👵',
    price: 6,
    desc: '데드라인 클리어 +30 코인',
    type: 'passive',
    rarity: 'uncommon',
  },

  // ===== 확률 조정 (Probability) =====
  clover_pot: {
    id: 'clover_pot',
    name: '클로버 화분',
    icon: '🪴',
    price: 6,
    desc: '클로버 확률 +3%',
    type: 'passive',
    rarity: 'uncommon',
  },
  fortune_cookie: {
    id: 'fortune_cookie',
    name: '행운의 과자',
    icon: '🥠',
    price: 7,
    desc: '라운드당 티켓 +1',
    type: 'passive',
    rarity: 'uncommon',
  },

  // ===== 666 활용 (666 Synergy) =====
  devil_horn: {
    id: 'devil_horn',
    name: '악마의 뿔',
    icon: '😈',
    price: 8,
    desc: '666 발동 시 +50 코인',
    type: 'passive',
    rarity: 'rare',
  },
  crystal_skull: {
    id: 'crystal_skull',
    name: '크리스탈 해골',
    icon: '💀',
    price: 9,
    desc: '666 횟수 × 10 코인',
    type: 'passive',
    rarity: 'rare',
  },

  // ===== 특수 효과 (Special) =====
  crystal_ball: {
    id: 'crystal_ball',
    name: '수정구',
    icon: '🔮',
    price: 6,
    desc: '다음 스핀 미리보기',
    type: 'active',
    duration: 1,
    rarity: 'uncommon',
  },
  dynamo: {
    id: 'dynamo',
    name: '다이나모',
    icon: '⚡',
    price: 10,
    desc: '패턴 당첨 시 50% 재스핀',
    type: 'passive',
    rarity: 'rare',
  },
};

export const TALISMAN_KEYS = Object.keys(TALISMANS);

export type TalismanKey = keyof typeof TALISMANS;

// Helper to get talismans by rarity
export function getTalismansByRarity(rarity: TalismanRarity): Talisman[] {
  return Object.values(TALISMANS).filter(t => t.rarity === rarity);
}

// Helper to get golden talismans
export function getGoldenTalismans(): Talisman[] {
  return Object.values(TALISMANS).filter(t => t.id.startsWith('golden_'));
}
