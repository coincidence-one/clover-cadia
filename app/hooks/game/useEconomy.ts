import { useCallback } from 'react';
import { GameState } from '@/app/types';
import { ITEMS, TICKET_ITEMS } from '@/app/constants';
import { SoundType } from '@/app/utils/audio';

interface UseEconomyProps {
  state: GameState;
  isSpinning: boolean;
  updateState: (updates: Partial<GameState>) => void;
  playSound: (type: SoundType) => void;
  setToast: (msg: string | null) => void;
}

export const useGameEconomy = ({
  state,
  isSpinning,
  updateState,
  playSound,
  setToast,
}: UseEconomyProps) => {

  // ===== ITEM SYSTEM =====
  const useItem = useCallback((itemName: string) => {
    if (isSpinning || state.items[itemName] <= 0) return;

    const newItems = { ...state.items, [itemName]: state.items[itemName] - 1 };
    const newEffects = { ...state.activeEffects };
    const newBonus = state.bonusSpins;

    // Item Effects Logic
    switch (itemName) {
      case 'luckyCharm': newEffects.luckyCharm = 3; break;
      case 'doubleStar': newEffects.doubleStar = true; break;
      case 'hotStreak':
        // Hot Streak adds to SPINS LEFT (Deadline extension)
        updateState({
          items: newItems,
          spinsLeft: state.spinsLeft + 5
        });
        playSound('buy');
        return; // Early return because updateState is called
      case 'shield': newEffects.shield = true; break;
      case 'wildCard': newEffects.wildCard = true; break;
    }

    playSound('buy');
    updateState({ items: newItems, activeEffects: newEffects, bonusSpins: newBonus });
  }, [state, isSpinning, updateState, playSound]);

  const buyItem = useCallback((itemName: string) => {
    const item = ITEMS[itemName];
    if (!item || state.credits < item.price) {
      playSound('error');
      return;
    }
    const newItems = { ...state.items, [itemName]: state.items[itemName] + 1 };
    updateState({ credits: state.credits - item.price, items: newItems });
    playSound('buy');
  }, [state, updateState, playSound]);

  const buyTicketItem = useCallback((itemName: string) => {
    const item = TICKET_ITEMS[itemName];
    if (!item || state.tickets < item.price) {
      playSound('error');
      return;
    }

    const newTickets = state.tickets - item.price;

    if (item.type === 'passive') {
      const newPassive = { ...state.passiveEffects, [itemName]: true };
      updateState({ tickets: newTickets, passiveEffects: newPassive });
      setToast(`${item.icon} ${item.name} ACQUIRED!`);
    } else {
      const newTicketItems = { ...state.ticketItems, [itemName]: (state.ticketItems[itemName] || 0) + 1 };
      updateState({ tickets: newTickets, ticketItems: newTicketItems });
    }

    playSound('buy');
    setTimeout(() => setToast(null), 2000);
  }, [state, updateState, playSound, setToast]);

  const useTicketItem = useCallback((itemName: string) => {
    if (isSpinning) return;
    const item = TICKET_ITEMS[itemName];
    if (!item || item.type === 'passive') return;
    if ((state.ticketItems[itemName] || 0) <= 0) return;

    const newTicketItems = { ...state.ticketItems, [itemName]: state.ticketItems[itemName] - 1 };

    if (item.type === 'active' && item.duration) {
      const newActive = { ...state.activeTicketEffects, [itemName]: item.duration };
      updateState({ ticketItems: newTicketItems, activeTicketEffects: newActive });
      setToast(`${item.icon} ACTIVE FOR ${item.duration} SPINS!`);
    } else if (item.type === 'consumable') {
      switch (itemName) {
        case 'instantJackpot':
          updateState({ ticketItems: newTicketItems, credits: state.credits + 500 });
          setToast('💎 +500 COINS!');
          break;
        case 'curseAbsorb':
          updateState({ ticketItems: newTicketItems });
          setToast('💀 CURSE ABSORB READY!');
          break;
        case 'rerollSpin':
          updateState({ ticketItems: newTicketItems });
          setToast('🔄 REROLL READY!');
          break;
        case 'wildCard':
          updateState({
            ticketItems: newTicketItems,
            activeTicketEffects: { ...state.activeTicketEffects, wildCard: 1 }
          });
          setToast('🃏 NEXT SPIN WILD!');
          break;
        default:
          updateState({ ticketItems: newTicketItems });
      }
    }

    playSound('buy');
    setTimeout(() => setToast(null), 2000);
  }, [state, isSpinning, updateState, playSound, setToast]);


  // ===== DEBT/PAYMENT SYSTEM =====
  const makePayment = useCallback((amount: number) => {
    if (amount <= 0 || amount > state.credits) {
      playSound('error');
      return;
    }

    const remainingDebt = state.currentDebt - state.paidAmount;
    const actualPayment = Math.min(amount, remainingDebt);
    const turnsLeft = state.deadlineTurn - state.currentTurn;

    // Calculate early payment bonus (1 coin per remaining turn per 10 coins paid)
    let bonus = 0;
    if (turnsLeft > 0 && actualPayment > 0) {
      bonus = Math.floor((actualPayment / 10) * turnsLeft);
    }

    const newPaidAmount = state.paidAmount + actualPayment;
    const newCredits = state.credits - actualPayment + bonus;
    const newEarlyPaymentBonus = state.earlyPaymentBonus + bonus;

    updateState({
      credits: newCredits,
      paidAmount: newPaidAmount,
      earlyPaymentBonus: newEarlyPaymentBonus,
    });

    playSound('coin');

    if (bonus > 0) {
      setToast(`💳 ${actualPayment} 납부! 선납 보너스 +${bonus}🍀`);
    } else {
      setToast(`💳 ${actualPayment} 납부 완료!`);
    }

    // Check if debt is fully paid
    if (newPaidAmount >= state.currentDebt) {
      setToast('🎉 납부 완료! 다음 라운드로!');
    }

    setTimeout(() => setToast(null), 2500);
  }, [state, updateState, playSound, setToast]);

  return {
    useItem,
    buyItem,
    buyTicketItem,
    useTicketItem,
    makePayment,
  };
};
