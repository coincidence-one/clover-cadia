import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState } from '@/app/types';
import {
  SYMBOLS,
  PATTERNS,
} from '@/app/constants';
import {
  getWeightedRandomSymbol,
  getInitialGrid,
  addWildToGrid,
  hasCurse,
  checkPatternWin,
} from '@/app/utils/gameHelpers';

interface UseSpinProps {
  state: GameState;
  updateState: (updates: Partial<GameState>) => void;
  playSound: (type: any) => void;
  setToast: (msg: string | null) => void;
  addXP: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  setMessage: (msg: string) => void;
}

export const useSpinLogic = ({
  state,
  updateState,
  playSound,
  setToast,
  addXP,
  unlockAchievement,
  setMessage,
}: UseSpinProps) => {
  // Local Visual State
  const [grid, setGrid] = useState<string[]>(getInitialGrid());
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [reelSpinning, setReelSpinning] = useState<boolean[]>([false, false, false, false, false]);
  const [showCurse, setShowCurse] = useState(false);

  // Ref for safe async state access
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const spin = useCallback(async (isFreeRespin = false) => {
    if (isSpinning) return;

    // Check if can spin (cost or spins left)
    if (!isFreeRespin) {
      if (state.spinsLeft <= 0) {
        setToast('NO SPINS LEFT!');
        return;
      }
    }

    setIsSpinning(true);
    setReelSpinning([true, true, true, true, true]); // Start all reels
    setMessage('>>> SPINNING <<<');
    setWinningCells([]);
    setToast(null);

    playSound('spin');

    // Decrease Spins Left if not free
    const newSpinsLeft = isFreeRespin ? state.spinsLeft : Math.max(0, state.spinsLeft - 1);

    // Generate new grid logic
    const generateSymbol = () => getWeightedRandomSymbol(state.activeBonuses, state.activeTicketEffects);
    let newGrid = Array(15).fill('').map(() => generateSymbol().icon);

    // Apply Wild Card
    if ((state.activeTicketEffects['wildCard'] || 0) > 0) {
      newGrid = addWildToGrid(newGrid);
    }

    // Set Grid (Visual)
    setGrid(newGrid);

    // Animate spinning stops (Staggered)
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 250));
      setReelSpinning(prev => {
        const next = [...prev];
        next[i] = false;
        return next;
      });
      playSound('click');
    }

    // Check for Curse (666)
    if (hasCurse(newGrid)) {
      const hasPermanentProtection = state.talismanEffects.curseProtectionPermanent;
      const hasOnceProtection = state.talismanEffects.curseProtectionOnce;

      if (hasPermanentProtection) {
        playSound('win');
        setMessage('📿 묵주가 666을 방어했습니다!');
        unlockAchievement('survivor');
      } else if (hasOnceProtection) {
        playSound('win');
        setMessage('📖 성경이 666을 1회 방어했습니다!');
        updateState({
          talismanEffects: { ...state.talismanEffects, curseProtectionOnce: false }
        });
        unlockAchievement('survivor');
      } else if ((state.ticketItems['shield'] || 0) > 0) {
        playSound('win');
        setMessage('✝️ SHIELD BLOCKED 666!');
        updateState({ ticketItems: { ...state.ticketItems, shield: state.ticketItems['shield'] - 1 } });
        unlockAchievement('survivor');
      } else {
        const curseBonus = state.talismanEffects.curseBonus;
        if (curseBonus > 0) {
          playSound('win');
          const bonusAmount = curseBonus + (state.curseCount * 10);
          setMessage(`😈 666 발동! +${bonusAmount} 코인!`);
          updateState({
            credits: state.credits + bonusAmount,
            curseCount: state.curseCount + 1,
            spinsLeft: newSpinsLeft // Update spins here too
          });
          // Need to decrement Wild Card if used
          if ((state.activeTicketEffects['wildCard'] || 0) > 0) {
            const newActive = { ...state.activeTicketEffects };
            delete newActive['wildCard'];
            updateState({ activeTicketEffects: newActive });
          }
          setIsSpinning(false);
          return;
        } else {
          playSound('curse');
          setShowCurse(true);
          setMessage('☠️ 666 CURSE! ALL COINS LOST!');
          setTimeout(() => setShowCurse(false), 2000);
          updateState({ credits: 0, curseCount: state.curseCount + 1, spinsLeft: newSpinsLeft });
          unlockAchievement('cursed');
          setIsSpinning(false);
          return;
        }
      }
    }

    // Calculate Wins
    let totalWin = 0;
    const allWinningCells: number[] = [];

    interface MatchedPattern {
      pattern: typeof PATTERNS[0];
      patternIdx: number;
      symbol: string;
      symbolObj: typeof SYMBOLS[0];
    }
    const matchedPatterns: MatchedPattern[] = [];

    PATTERNS.forEach((pattern, patternIdx) => {
      const win = checkPatternWin(newGrid, pattern.cells, patternIdx);
      if (win) {
        const symbol = SYMBOLS.find(s => s.icon === win.symbol);
        if (symbol && symbol.value > 0) {
          matchedPatterns.push({ pattern, patternIdx, symbol: win.symbol, symbolObj: symbol });
        }
      }
    });

    const excludedIds = new Set<string>();
    matchedPatterns.forEach(mp => mp.pattern.excludes.forEach(id => excludedIds.add(id)));

    let jackpotMatch: MatchedPattern | null = null;

    matchedPatterns.forEach(mp => {
      if (excludedIds.has(mp.pattern.id)) return;
      if (mp.pattern.isJackpot) { jackpotMatch = mp; return; }

      const symbolBoost = state.talismanEffects.symbolValueBoosts[mp.symbolObj.id] || 0;
      let patternWin = (mp.symbolObj.value + symbolBoost) * mp.pattern.multiplier * 10;

      if (state.activeBonuses.includes('risk_glass_cannon')) patternWin = Math.floor(patternWin * 1.5);
      totalWin += patternWin;
      allWinningCells.push(...mp.pattern.cells);
    });

    if (jackpotMatch) {
      const jp = jackpotMatch as MatchedPattern;
      const symbolBoost = state.talismanEffects.symbolValueBoosts[jp.symbolObj.id] || 0;
      let jackpotWin = (jp.symbolObj.value + symbolBoost) * jp.pattern.multiplier * 10;
      if (state.activeBonuses.includes('risk_glass_cannon')) jackpotWin = Math.floor(jackpotWin * 1.5);
      totalWin += jackpotWin;
      allWinningCells.push(...jp.pattern.cells);
    }

    // Effects
    if (totalWin > 0) {
      if (state.activeEffects.doubleStar) {
        totalWin *= 2;
        updateState({ activeEffects: { ...state.activeEffects, doubleStar: false } });
      }
      if (state.passiveEffects.coinMagnet) {
        totalWin = Math.floor(totalWin * 1.1);
      }
      if (state.talismanEffects.spinCoinBonus > 0) {
        totalWin += state.talismanEffects.spinCoinBonus;
      }
    }

    setWinningCells([...new Set(allWinningCells)]);

    // Final State Update
    const currentState = stateRef.current;

    // Decrement Wild Card Effect
    const nextActiveEffects = { ...currentState.activeTicketEffects };
    if (nextActiveEffects['wildCard']) {
      delete nextActiveEffects['wildCard'];
    }

    // Decrement Durations
    Object.keys(nextActiveEffects).forEach(key => {
      if (nextActiveEffects[key] > 0) {
        nextActiveEffects[key]--;
        if (nextActiveEffects[key] <= 0) delete nextActiveEffects[key];
      }
    });

    const newCredits = currentState.credits + totalWin;
    const newTotalSpins = currentState.totalSpins + 1;
    const newTotalWins = totalWin > 0 ? currentState.totalWins + 1 : currentState.totalWins;

    updateState({
      credits: newCredits,
      lastWin: totalWin,
      totalSpins: newTotalSpins,
      totalWins: newTotalWins,
      spinsLeft: newSpinsLeft,
      activeTicketEffects: nextActiveEffects
    });

    if (totalWin > 0) {
      playSound(totalWin >= state.bet * 10 ? 'jackpot' : 'win');
      setMessage(`🎉 YOU WON ${totalWin} COINS!`);
      addXP(Math.floor(totalWin / 10));
      if (newTotalWins === 1) unlockAchievement('firstWin');
    } else {
      playSound('lose');
      setMessage('TRY AGAIN...');
      addXP(5);
    }

    if (newTotalSpins >= 100) unlockAchievement('spin100');
    if (newTotalSpins >= 500) unlockAchievement('spin500');
    if (newCredits >= 10000) unlockAchievement('rich');

    setIsSpinning(false);

    // Dynamo Respin Logic
    if (totalWin > 0 && state.ownedTalismans.includes('dynamo')) {
      if (state.talismanEffects.dynamoChance && Math.random() < state.talismanEffects.dynamoChance) {
        setTimeout(() => {
          setToast('⚡ 다이너모 발동! 무료 재굴림! ⚡');
          playSound('levelup');
          spin(true);
        }, 1500);
      }
    }

  }, [isSpinning, state, updateState, playSound, addXP, unlockAchievement, setToast, setMessage]);

  return {
    spin,
    grid,
    winningCells,
    isSpinning,
    reelSpinning,
    showCurse
  };
};
