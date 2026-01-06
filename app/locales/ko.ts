import { Translations } from './en';

export const ko: Translations = {
  // Header & Titles
  title: '픽셀 벳',
  subtitle: '★ 로그라이트 슬롯 ★',
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

  // Paytable
  paytableTitle: '족보',
  symbols: '심볼 정보',
  patterns: '당첨 패턴',
  multiplier: '배수',
  baseValue: '기본 점수',
  rarity: '희귀도',
  common: '흔함',
  uncommon: '보통',
  rare: '희귀',
  legendary: '전설',
  cursed: '저주',
  match3: '3개 일치',
  match4: '4개 일치',
  match5: '5개 일치',
  paytableNote: '* 심볼 희귀도에 따라 등장 확률이 다릅니다.',

  // Guide
  guideTitle: '게임 가이드',
  guidePage1Title: '생존 규칙',
  guidePage1Desc: '스핀이 0이 되기 전에 목표 금액을 달성하세요.\n목표 미달 시 게임 오버!',
  guidePage2Title: '전략 선택',
  guidePage2Desc: '매 라운드 3회(위험, 티켓2장) 또는 7회(안전, 티켓1장) 스핀을 선택하세요.',
  guidePage3Title: '666 저주',
  guidePage3Desc: '666 패턴은 모든 코인을 소멸시킵니다.\n방패(Shield)를 구매하여 방어하세요.',
  guidePage4Title: '아이템 상점',
  guidePage4Desc: '티켓으로 아이템을 구매하세요.\n생존을 위한 필수 요소입니다.',
  next: '다음',
  prev: '이전',
  close: '닫기',

  // Achievements
  trophies: '업적',
  achievementsTitle: '나의 업적',

  // Messages
  pressSpin: '스핀을 눌러주세요!',
  ready: '준비됨',
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

  // Ticket Shop
  shopTitle: '티켓 상점',
  tickets: '티켓',
  passiveLabel: '패시브 (영구)',
  activeLabel: '액티브',
  luckyBell: '행운의 종',
  ticketDoubler: '티켓 두배',
  coinMagnet: '코인 자석',
  shield: '성스러운 방패',
  luckyCharm: '행운 부적',
  wildCard: '와일드 카드',
  scatterBoost: '스캐터 부스트',
  sevenHunter: '세븐 헌터',
  crystalBall: '수정을 구',
  instantJackpot: '미니 잭팟',
  rerollSpin: '리롤',
  curseAbsorb: '저주 흡수',
  consumableLabel: '소모품 (1회성)',

  // Round System
  round: '라운드',
  setup: '설정',
  goal: '목표',
  spinsLeft: '남은 스핀',
  roundCleared: '라운드 클리어!',
  nextRound: '다음 라운드 ➡️',
  gameOver: '게임 오버',
  outOfSpins: '스핀 소진!',
  restart: '게임 재시작',

  // Round Selector
  chooseStrategy: '스핀 전략을 선택하세요',
  safe: '안전',
  risky: '위험',
  spins: '스핀',
  easyGoal: '목표 달성 쉬움',
  hardGoal: '목표 달성 어려움',
  select: '선택',

  // Phone Bonus
  incomingCall: '전화가 왔습니다...',
  pickBonus: '보너스를 선택하세요:',

  // Items
  items: {
    luckyCharm: { name: '럭키 참', desc: '+클로버% x3회' },
    doubleStar: { name: '더블 스타', desc: '2배 당첨금' },
    hotStreak: { name: '핫 스트릭', desc: '+5 스핀' },
    shield: { name: '성스러운 방패', desc: '666 방어' },
    wildCard: { name: '와일드 카드', desc: '와일드 추가' },

    // Ticket Items
    luckyBell: { name: '행운의 종', desc: '종 확률 +2% (영구)' },
    ticketDoubler: { name: '티켓 더블러', desc: '티켓 보상 2배 (영구)' },
    coinMagnet: { name: '코인 자석', desc: '라운드 승리 코인 +10% (영구)' },
    scatterBoost: { name: '스캐터 부스트', desc: '액티브: 스캐터 확률 2배 (5스핀)' },
    sevenHunter: { name: '세븐 헌터', desc: '액티브: 7 확률 +5% (3스핀)' },
    crystalBall: { name: '수정 구슬', desc: '액티브: 다음 결과 미리보기 (1스핀)' },
    curseAbsorb: { name: '저주 흡수', desc: '소모품: 666 등장 시 티켓 3개로 변환' },
    instantJackpot: { name: '미니 잭팟', desc: '소모품: 즉시 500 코인 획득' },
    rerollSpin: { name: '리롤', desc: '소모품: 마지막 스핀 다시 돌리기' },
  },

  // Achievements
  achievements: {
    firstWin: { name: '첫 당첨', desc: '1회 당첨' },
    lucky7: { name: '럭키 세븐', desc: '7 x3 달성' },
    jackpotHunter: { name: '잭팟 헌터', desc: '7 x5 달성' },
    spin100: { name: '100 스핀', desc: '100회 스핀' },
    spin500: { name: '500 스핀', desc: '500회 스핀' },
    rich: { name: '큰손', desc: '10000 코인 달성' },
    survivor: { name: '생존자', desc: '666 생존' },
    cursed: { name: '저주받은 자', desc: '666 발동' },
  },

  // Language
  language: '한',
  spinCostAlias: '스핀 비용'
};
