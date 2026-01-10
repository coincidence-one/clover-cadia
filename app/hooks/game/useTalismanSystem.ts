import { useCallback } from 'react';
import { GameState } from '@/app/types';
import { TALISMANS as TALISMANS_CONST } from '@/app/constants/talismans';
import { refreshTalismanShop } from '@/app/utils/gameHelpers';
import { SoundType } from '@/app/utils/audio';

interface UseTalismanProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  playSound: (type: SoundType) => void;
  setToast: (msg: string | null) => void;
  unlockedIds?: string[];
}

export const useTalismanSystem = ({
  state,
  updateState,
  playSound,
  setToast,
  unlockedIds = [],
}: UseTalismanProps) => {

  const purchaseTalisman = useCallback((talismanId: string) => {
    const talisman = TALISMANS_CONST[talismanId];
    if (!talisman) {
      playSound('error');
      return;
    }

    // Check if already owned
    if (state.ownedTalismans.includes(talismanId)) {
      setToast('이미 보유중인 부적입니다!');
      playSound('error');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // Check if can afford
    if (state.tickets < talisman.price) {
      setToast('티켓이 부족합니다!');
      playSound('error');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // Check Slot Limit (Default 7)
    if (state.ownedTalismans.length >= state.talismanSlots) {
      setToast(`부적 슬롯이 가득 찼습니다! (최대 ${state.talismanSlots}개)`);
      playSound('error');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // Deduct tickets and add to owned
    // Implement One-Time Consumables (Lost Wallet)
    if (talisman.id === 'lost_wallet') {
      updateState({
        credits: state.credits - talisman.price + 50, // Cost + 50 Reward
        shopTalismans: state.shopTalismans.filter(id => id !== talismanId)
      });
      playSound('coin');
      setToast(`${talisman.icon} ${talisman.name} 획득! +50 코인!`);
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // Normal Purchase
    const newTickets = state.tickets - talisman.price;
    const newOwned = [...state.ownedTalismans, talismanId];
    const newShopList = state.shopTalismans.filter(id => id !== talismanId);

    // Calculate new active effects (Stackable ones)
    const effects = { ...state.talismanEffects };

    // Golden Series - Symbol Value Boost
    if (talisman.targetSymbol && talisman.valueBoost) {
      effects.symbolValueBoosts = {
        ...effects.symbolValueBoosts,
        [talisman.targetSymbol]: (effects.symbolValueBoosts[talisman.targetSymbol] || 0) + talisman.valueBoost,
      };
    }

    // Protection items
    if (talismanId === 'rosary') effects.curseProtectionPermanent = true;
    if (talismanId === 'bible') effects.curseProtectionOnce = true;

    // Spin Coin bonuses (Stackable)
    if (talismanId === 'lucky_cat') effects.spinCoinBonus += 1;
    if (talismanId === 'fat_cat') effects.spinCoinBonus += 3;

    // 666 synergy
    if (talismanId === 'devil_horn') effects.curseBonus += 50;
    if (talismanId === 'crystal_skull') effects.curseBonus += 10;

    // Special
    if (talismanId === 'dynamo') effects.dynamoChance = 0.5;

    updateState({
      tickets: newTickets,
      ownedTalismans: newOwned,
      shopTalismans: newShopList,
      talismanEffects: effects
    });

    playSound('buy');
    setToast(`${talisman.icon} ${talisman.name} 획득!`);
    setTimeout(() => setToast(null), 2000);
  }, [state, updateState, playSound, setToast]);

  const rerollTalismanShop = useCallback(() => {
    const cost = state.shopRerollCost;
    if (state.credits < cost) {
      setToast(`코인이 부족합니다! (리롤 비용: ${cost})`);
      playSound('error');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    const newShop = refreshTalismanShop(3, state.ownedTalismans, unlockedIds);
    updateState({
      credits: state.credits - cost,
      shopTalismans: newShop
    });

    playSound('coin');
    setToast('🔄 상점 목록 갱신!');
    setTimeout(() => setToast(null), 2000);
  }, [state, updateState, playSound, setToast, unlockedIds]);

  return {
    purchaseTalisman,
    rerollTalismanShop
  };
};
