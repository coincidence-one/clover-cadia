import { Translations } from './en';

export const ko: Translations = {
  // Header & Titles
  title: '럭키 클로버',
  subtitle: '★ 픽셀 슬롯 ★',
  jackpot: '◆ 잭팟 ◆',

  // Controls
  shop: '상점',
  spin: '스핀!',
  spinning: '...',
  maxBet: '최대 베팅',

  // Labels
  coins: '코인',
  bet: '베팅',
  win: '당첨',
  xp: '경험치',
  level: '레벨',

  // Shop
  itemShop: '아이템 상점',

  // Achievements
  trophies: '업적',

  // Messages
  pressSpin: '스핀을 눌러주세요!',
  noCoins: '! 코인 부족 !',
  spinningMsg: '>>> 돌리는 중 <<<',
  tryAgain: '다시 도전하세요...',
  winMsg: '당첨! +{amount}!',
  jackpotMsg: '☘ 잭팟! +{amount}! ☘',
  scatterMsg: '⚡ 스캐터! +5 스핀! ⚡',
  selectReel: '고정할 릴을 선택하세요',
  reelLocked: '릴 {num} 고정됨',
  unlocked: '{icon} {name} 달성!',

  // Level Up Modal
  levelUp: '레벨 업!',
  levelLabel: '레벨',
  reward: '보상: +{amount} 코인',
  ok: '확인',

  // Daily Bonus Modal
  dailyBonus: '일일 보너스',
  streak: '연속 출석: {days}일',
  claimReward: '보상 받기',

  // Items
  items: {
    luckyCharm: { name: '럭키 참', desc: '+20% 확률 x3회' },
    doubleStar: { name: '더블 스타', desc: '2배 당첨금' },
    hotStreak: { name: '핫 스트릭', desc: '+5 스핀' },
    freezer: { name: '프리저', desc: '릴 고정' },
    wildCard: { name: '와일드 카드', desc: '와일드 추가' },
  },

  // Achievements
  achievements: {
    firstWin: { name: '첫 당첨', desc: '1회 당첨' },
    lucky7: { name: '럭키 777', desc: '777 달성' },
    jackpotHunter: { name: '잭팟 헌터', desc: '클로버 달성' },
    spin100: { name: '100 스핀', desc: '100회 스핀' },
    spin500: { name: '500 스핀', desc: '500회 스핀' },
    rich: { name: '큰손', desc: '10000 코인 달성' },
    collector: { name: '수집가', desc: '모든 아이템 보유' },
    wildMaster: { name: '와일드 마스터', desc: '와일드로 당첨' },
  },

  // Language
  language: '한',
} as const;
