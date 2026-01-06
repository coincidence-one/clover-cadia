import { useCallback } from 'react';
import { GameState } from '@/app/types';
import { ITEMS, TICKET_ITEMS } from '@/app/constants';

interface UseEconomyProps {
  state: GameState;
  isSpinning: boolean;
  updateState: (updates: Partial<GameState>) => void;
  playSound: (type: any) => void;
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
    let newBonus = state.bonusSpins;

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


  // ===== ATM SYSTEM =====
  const depositToBank = useCallback((amount: number) => {
    if (amount <= 0 || amount > state.credits) {
      playSound('error');
      return;
    }

    updateState({
      credits: state.credits - amount,
      bankDeposit: state.bankDeposit + amount,
    });

    playSound('coin');
    setToast(`🏧 ${amount} 코인 입금 완료!`);
    setTimeout(() => setToast(null), 2000);
  }, [state, updateState, playSound, setToast]);

  const withdrawFromBank = useCallback((amount: number) => {
    if (amount <= 0 || amount > state.bankDeposit) {
      playSound('error');
      return;
    }

    updateState({
      credits: state.credits + amount,
      bankDeposit: state.bankDeposit - amount,
    });

    playSound('buy');
    setToast(`🏧 ${amount} 코인 출금 완료!`);
    setTimeout(() => setToast(null), 2000);
  }, [state, updateState, playSound, setToast]);

  return {
    useItem,
    buyItem,
    buyTicketItem,
    useTicketItem,
    depositToBank,
    withdrawFromBank
  };
};
