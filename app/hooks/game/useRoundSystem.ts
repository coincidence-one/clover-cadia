import { useCallback } from 'react';
import { GameState } from '@/app/types';
import { LEVELS, ACHIEVEMENTS, DAILY_REWARDS } from '@/app/constants';
import { generatePhoneChoices } from '@/app/constants';
import { SoundType } from '@/app/utils/audio';

interface UseRoundProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  playSound: (type: SoundType) => void;
  setToast: (msg: string | null) => void;
  setMessage: (msg: string) => void;
  setIsSpinning: (v: boolean) => void;
  setShowLevelUp: (v: boolean) => void;
  setShowDailyBonus: (v: boolean) => void;
}

export const useRoundSystem = ({
  state,
  updateState,
  playSound,
  setToast,
  setMessage,
  setShowLevelUp,
  setShowDailyBonus,
}: UseRoundProps) => {

  // ===== PROGRESSION (XP/Achievements) =====
  const addXP = useCallback((amount: number) => {
    const newXP = state.xp + amount;
    const nextLevel = LEVELS.find(l => l.level === state.level + 1);

    if (nextLevel && newXP >= nextLevel.xp) {
      const newLevel = state.level + 1;
      const reward = newLevel * 100;
      updateState({ credits: state.credits + reward, level: newLevel, xp: newXP });
      playSound('levelup');
      setShowLevelUp(true);
    } else {
      updateState({ xp: newXP });
    }
  }, [state, updateState, playSound, setShowLevelUp]);

  const unlockAchievement = useCallback((id: string) => {
    if (state.achievements[id]) return;
    const a = ACHIEVEMENTS.find(ac => ac.id === id);
    if (!a) return;

    const newAch = { ...state.achievements, [id]: true };
    updateState({ achievements: newAch, credits: state.credits + a.reward });
    playSound('levelup');
    setToast(`${a.icon} ${a.name}!`);
    setTimeout(() => setToast(null), 3000);
  }, [state, updateState, playSound, setToast]);

  // ===== DAILY / ROUND =====
  const claimDaily = useCallback(() => {
    const today = new Date().toDateString();
    const reward = DAILY_REWARDS[Math.min(state.dailyStreak, DAILY_REWARDS.length - 1)] || 100;

    updateState({
      credits: state.credits + reward,
      lastDailyBonus: today,
      dailyStreak: state.dailyStreak + 1
    });
    setShowDailyBonus(false);
    playSound('jackpot');
  }, [state, updateState, playSound, setShowDailyBonus]);

  const changeBet = useCallback((delta: number) => {
    const newBet = Math.max(10, Math.min(100, state.bet + delta));
    updateState({ bet: newBet });
    playSound('click');
  }, [state, updateState, playSound]);

  const nextRound = useCallback(() => {
    if (state.credits < state.currentGoal) {
      // Fallback check
      // But logic is usually handled by endDay
    }

    // Award reward tickets for completing the round!
    const ticketsEarned = state.roundRewardTickets;
    const newTickets = state.tickets + ticketsEarned;

    // Show toast for ticket reward
    if (ticketsEarned > 0) {
      setToast(`🎟️ +${ticketsEarned} 티켓 획득!`);
    }

    // Trigger Phone Call for next round selection
    const choices = generatePhoneChoices();

    updateState({
      tickets: newTickets,
      showPhoneModal: true,
      currentPhoneChoices: choices
    });

    playSound('jackpot');
  }, [state, updateState, playSound, setToast]);


  // ===== END DAY (ATM LOGIC) =====
  const endDay = useCallback(() => {
    // 1. Check if spins are used (Optional, usually enforced)
    if (state.spinsLeft > 0) {
      setToast('남은 스핀을 모두 사용하세요!');
      playSound('error');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    // 2. Check if Final Day
    if (state.currentDay >= state.maxDays) {
      // LAST DAY: Check Debt Payment vs Goal
      if (state.paidAmount >= state.currentDebt) {
        // SUCCESS: Next Round logic (Trigger nextRound setup via modal?)
        // actually useSlotMachine handles phone call setup

        // Use logic from nextRound but integrated
        const ticketsEarned = state.roundRewardTickets;
        const newTickets = state.tickets + ticketsEarned;

        if (ticketsEarned > 0) {
          setToast(`🎟️ +${ticketsEarned} 티켓 획득!`);
        }

        const choices = generatePhoneChoices();
        updateState({
          tickets: newTickets,
          showPhoneModal: true,
          currentPhoneChoices: choices
        });
        playSound('jackpot');

      } else {
        // FAIL: Game Over
        updateState({ gameOver: true });
        playSound('lose');
        setMessage('☠️ 부채 미상환! 파산했습니다 ☠️'); // Floor opens
      }
    } else {
      // NOT LAST DAY: Proceed to Next Day
      // Economy bonuses
      let bonusCredits = 0;
      if (state.ownedTalismans.includes('grandma_wallet')) bonusCredits += 30;
      if (state.ownedTalismans.includes('fake_coin')) bonusCredits += 10;

      updateState({
        credits: state.credits + bonusCredits,
        currentDay: state.currentDay + 1,
        showRoundSelector: true, // Let them pick Difficulty for NEXT Day
        spinsLeft: 0,
        tickets: state.tickets + (state.ownedTalismans.includes('fortune_cookie') ? 1 : 0),
      });
      playSound('levelup');
      setMessage(`DAY ${state.currentDay} COMPLETE!`);
      if (bonusCredits > 0) setToast(`💰 데일리 보너스 +${bonusCredits}`);
      setTimeout(() => setToast(null), 3000);
    }
  }, [state, updateState, playSound, setMessage, setToast]);

  return {
    addXP,
    unlockAchievement,
    claimDaily,
    changeBet,
    nextRound,
    endDay
  };
};
