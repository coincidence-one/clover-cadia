'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
import type { GameState } from '@/app/types';

// Constants
import {
  SYMBOLS,
  PAYLINES,
  PATTERNS,
  ITEMS,
  TICKET_ITEMS,
  ACHIEVEMENTS,
  LEVELS,
  DAILY_REWARDS,
  INITIAL_GAME_STATE,
  STORAGE_KEY,
  SPIN_COST,
  ITEM_KEYS,
  TICKET_ITEM_KEYS,
  getRoundConfig,
  generatePhoneChoices,
  PHONE_BONUSES,
} from '@/app/constants';
import { TALISMANS as TALISMANS_CONST } from '@/app/constants/talismans';

// Utils
import { audioEngine } from '@/app/utils/audio';
import {
  getWeightedRandomSymbol,
  getInitialGrid,
  addWildToGrid,
  hasCurse,
  checkPatternWin,
  refreshTalismanShop,
  generateRandomGrid,
} from '@/app/utils/gameHelpers';

// Re-export constants for component usage
export { SYMBOLS, PAYLINES, ITEMS, TICKET_ITEMS, ACHIEVEMENTS, LEVELS, ITEM_KEYS, TICKET_ITEM_KEYS, SPIN_COST };

// ===== HOOK =====
export function useSlotMachine() {
  // State
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('PRESS SPIN!');
  const [grid, setGrid] = useState<string[]>(getInitialGrid());
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showCurse, setShowCurse] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reelSpinning, setReelSpinning] = useState<boolean[]>([false, false, false, false, false]);

  const stateRef = useRef(state);

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Hydration
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // setIsHydrated(true); // Removed as unused
  }, []);

  // Helper: Update state
  const updateState = useCallback((updates: Partial<GameState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Helper: Play sound
  const playSound = useCallback((type: Parameters<typeof audioEngine.play>[0]) => {
    audioEngine.play(type);
  }, []);

  // Load saved game
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // Hydrate state
      try {
        const parsed = JSON.parse(saved);

        // Safety check for null shopTalismans if old save
        if (!parsed.shopTalismans || parsed.shopTalismans.length === 0) {
          parsed.shopTalismans = refreshTalismanShop(3, parsed.ownedTalismans || []);
          parsed.talismanSlots = parsed.talismanSlots || 7;
          parsed.shopRerollCost = parsed.shopRerollCost || 10;
        }

        // Ensure nextGrid exists for legacy saves
        if (!parsed.nextGrid) {
          parsed.nextGrid = generateRandomGrid(parsed.activeBonuses, parsed.activeTicketEffects);
        }

        // Merge with initial state to ensure new structure exists
        setState(prev => ({
          ...INITIAL_GAME_STATE,
          ...parsed,
          activeBonuses: prev.activeBonuses // ensure array
        }));
      } catch (e) {
        console.error("Failed to parse game state", e);
        // If fail, init shop
        const initialShop = refreshTalismanShop(3, []);
        setState({ ...INITIAL_GAME_STATE, shopTalismans: initialShop });
      }
    } else {
      // First time load
      const initialShop = refreshTalismanShop(3, []);
      const initialNextGrid = generateRandomGrid([], {});
      setState({
        ...INITIAL_GAME_STATE,
        shopTalismans: initialShop,
        nextGrid: initialNextGrid
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Daily bonus check
  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (state.lastDailyBonus !== today) {
      const newStreak = state.lastDailyBonus === yesterday ? state.dailyStreak : 0;
      updateState({ dailyStreak: newStreak });
      setShowDailyBonus(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== ACTIONS =====

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
  }, [state.xp, state.level, state.credits, updateState, playSound]);

  const unlockAchievement = useCallback((id: string) => {
    if (state.achievements[id]) return;
    const a = ACHIEVEMENTS.find(ac => ac.id === id);
    if (!a) return;

    const newAch = { ...state.achievements, [id]: true };
    updateState({ achievements: newAch, credits: state.credits + a.reward });
    playSound('levelup');
    setToast(`${a.icon} ${a.name}!`);
    setTimeout(() => setToast(null), 3000);
  }, [state.achievements, state.credits, updateState, playSound]);

  const spin = useCallback(async (isFreeRespin = false) => {
    if (isSpinning) return;

    // Check if can spin (cost or spins left)
    // If free respin, ignore cost/spins check
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

    // Play spin sound effect
    playSound('spin');

    // Apply Cost (No per-spin cost in Entry Fee model)
    let newCredits = state.credits;
    const newBonusSpins = state.bonusSpins;

    // Decrease Spins Left (Deadline) - ONLY IF NOT FREE
    // Logic: Free spins (like Dynamo) don't consume "Day Spins"
    const newSpinsLeft = isFreeRespin ? state.spinsLeft : Math.max(0, state.spinsLeft - 1);

    // We update state later to include nextGrid, but we need spinsLeft local var.

    // updateState({
    //   credits: newCredits,
    //   bonusSpins: newBonusSpins,
    //   spinsLeft: newSpinsLeft,
    // });

    // Check Game Over (if 0 spins left and not enough credits)
    // We check this AFTER win calculation usually, but spinsLeft hits 0 now.
    // Real check happens at end of spin.

    // Generate new grid
    // Generate new grid using centralized probability logic
    const generateSymbol = () => getWeightedRandomSymbol(state.activeBonuses, state.activeTicketEffects);

    let newGrid = Array(15).fill('').map(() => generateSymbol().icon);

    // Apply wild card effect (Consumable trigger)
    if ((state.activeTicketEffects['wildCard'] || 0) > 0) {
      newGrid = addWildToGrid(newGrid);
      const newActive = { ...state.activeTicketEffects };
      delete newActive['wildCard'];
      // Also consume in next updateState
    }

    // Animate spinning
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 50));
      // Animation override: use simpler random or same weights
      setGrid(Array(15).fill('').map(() => generateSymbol().icon));
    }

    setGrid(newGrid);

    // Check for 666 curse
    if (hasCurse(newGrid)) {
      // Check for Talisman protection first (Rosary = permanent, Bible = one-time)
      const hasPermanentProtection = state.talismanEffects.curseProtectionPermanent;
      const hasOnceProtection = state.talismanEffects.curseProtectionOnce;

      if (hasPermanentProtection) {
        // Rosary blocks curse (permanent)
        playSound('win');
        setMessage('📿 묵주가 666을 방어했습니다!');
        unlockAchievement('survivor');
      } else if (hasOnceProtection) {
        // Bible blocks curse (consume once)
        playSound('win');
        setMessage('📖 성경이 666을 1회 방어했습니다!');
        updateState({
          talismanEffects: {
            ...state.talismanEffects,
            curseProtectionOnce: false
          }
        });
        unlockAchievement('survivor');
      } else if ((state.ticketItems['shield'] || 0) > 0) {
        // Shield blocks curse (Consume 1 shield)
        playSound('win');
        setMessage('✝️ SHIELD BLOCKED 666!');
        updateState({ ticketItems: { ...state.ticketItems, shield: state.ticketItems['shield'] - 1 } });
        unlockAchievement('survivor');
      } else {
        // Check for curse bonus (악마의 뿔)
        const curseBonus = state.talismanEffects.curseBonus;
        if (curseBonus > 0) {
          // Get bonus coins instead of losing
          playSound('win');
          const bonusAmount = curseBonus + (state.curseCount * 10); // crystal skull adds curseCount * 10
          setMessage(`😈 666 발동! +${bonusAmount} 코인!`);
          updateState({
            credits: state.credits + bonusAmount,
            curseCount: state.curseCount + 1
          });
        } else {
          // Curse triggers - lose all
          playSound('curse');
          setShowCurse(true);
          setMessage('☠️ 666 CURSE! ALL COINS LOST!');
          setTimeout(() => setShowCurse(false), 2000);
          updateState({ credits: 0, curseCount: state.curseCount + 1 });
          unlockAchievement('cursed');
          setIsSpinning(false);
          return;
        }
      }
    }

    // Calculate wins - CloverPit Pattern Style with Priority/Exclusion
    let totalWin = 0;
    const allWinningCells: number[] = [];

    // Step 1: Collect ALL matched patterns
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
          matchedPatterns.push({
            pattern,
            patternIdx,
            symbol: win.symbol,
            symbolObj: symbol,
          });
        }
      }
    });

    // Step 2: Build exclusion set from matched patterns
    const excludedIds = new Set<string>();
    matchedPatterns.forEach(mp => {
      mp.pattern.excludes.forEach(excludeId => excludedIds.add(excludeId));
    });

    // Step 3: Calculate wins for non-excluded patterns
    // Separate jackpot for special handling
    let jackpotMatch: MatchedPattern | null = null;

    matchedPatterns.forEach(mp => {
      // If this pattern is excluded by a higher one, skip it
      if (excludedIds.has(mp.pattern.id)) {
        return;
      }

      // Handle jackpot separately (it adds on top of everything)
      if (mp.pattern.isJackpot) {
        jackpotMatch = mp;
        return;
      }

      // Win = symbol value × pattern multiplier × base (10)
      // Apply golden talisman symbol value boost
      const symbolBoost = state.talismanEffects.symbolValueBoosts[mp.symbolObj.id] || 0;
      const boostedValue = mp.symbolObj.value + symbolBoost;
      let patternWin = boostedValue * mp.pattern.multiplier * 10;

      // Apply Glass Cannon Risk (All wins x1.5)
      if (state.activeBonuses.includes('risk_glass_cannon')) {
        patternWin = Math.floor(patternWin * 1.5);
      }

      totalWin += patternWin;
      allWinningCells.push(...mp.pattern.cells);
    });

    // Step 4: Add jackpot bonus AFTER all other patterns
    if (jackpotMatch !== null) {
      const jp = jackpotMatch as MatchedPattern;
      // Apply golden talisman boost to jackpot symbol too
      const jpSymbolBoost = state.talismanEffects.symbolValueBoosts[jp.symbolObj.id] || 0;
      const jpBoostedValue = jp.symbolObj.value + jpSymbolBoost;
      let jackpotWin = jpBoostedValue * jp.pattern.multiplier * 10;
      if (state.activeBonuses.includes('risk_glass_cannon')) {
        jackpotWin = Math.floor(jackpotWin * 1.5);
      }
      totalWin += jackpotWin;
      allWinningCells.push(...jp.pattern.cells);
    }

    // Apply double star effect
    if (totalWin > 0 && state.activeEffects.doubleStar) {
      totalWin *= 2;
      updateState({ activeEffects: { ...state.activeEffects, doubleStar: false } });
    }

    // Apply coin magnet passive
    if (totalWin > 0 && state.passiveEffects.coinMagnet) {
      totalWin = Math.floor(totalWin * 1.1);
    }

    // Apply talisman spin coin bonus (행운의 고양이, 떡떡한 고양이)
    const spinCoinBonus = state.talismanEffects.spinCoinBonus;
    if (spinCoinBonus > 0) {
      totalWin += spinCoinBonus;
    }

    setWinningCells([...new Set(allWinningCells)]);

    // Update state with results
    const currentState = stateRef.current; // Ref to get latest state during async
    newCredits = currentState.credits + totalWin; // Use updated newCredits
    const newTotalSpins = currentState.totalSpins + 1;
    const newTotalWins = totalWin > 0 ? currentState.totalWins + 1 : currentState.totalWins;

    // Check Deadline Condition
    if (newSpinsLeft <= 0 && newCredits < state.currentGoal) {
      if (state.currentDay < state.maxDays) {
        // Next Day available
        if (state.ownedTalismans.includes('grandma_wallet')) {
          newCredits += 30; // +30 from Grandma
        }
        if (state.ownedTalismans.includes('fake_coin')) {
          newCredits += 10; // +10 from Fake Coin logic (implied per day?)
          // Note: fake_coin usually start of round, but here it's "next day of round"
          // Let's assume it triggers on any fresh start
        }

        updateState({
          credits: newCredits,
          lastWin: totalWin,
          totalSpins: newTotalSpins,
          totalWins: newTotalWins,
          bonusSpins: newBonusSpins,
          // Prepare next day
          currentDay: state.currentDay + 1,
          showRoundSelector: true,
          spinsLeft: 0,
          tickets: state.tickets + (state.ownedTalismans.includes('fortune_cookie') ? 1 : 0),
        });
        setMessage(`DAY ${state.currentDay} END! PREPARE FOR DAY ${state.currentDay + 1}`);
        playSound('levelup'); // Alarm sound
        setIsSpinning(false);
        return;
      } else {
        // Final Day Failed -> GAME OVER
        updateState({
          credits: newCredits,
          lastWin: totalWin,
          totalSpins: newTotalSpins,
          totalWins: newTotalWins,
          gameOver: true
        });
        playSound('lose');
        setMessage('☠️ GAME OVER - OUT OF TIME! ☠️');
        setIsSpinning(false);
        return;
      }
    }


    updateState({
      credits: newCredits,
      lastWin: totalWin,
      totalSpins: newTotalSpins,
      totalWins: newTotalWins,
      spinsLeft: newSpinsLeft, // Update spinsLeft here
    });

    // Decrease active ticket item durations (counters)
    const nextActiveEffects = { ...state.activeTicketEffects };
    let effectsChanged = false;

    Object.keys(nextActiveEffects).forEach(key => {
      if (nextActiveEffects[key] > 0) {
        nextActiveEffects[key]--;
        effectsChanged = true;
        if (nextActiveEffects[key] <= 0) delete nextActiveEffects[key];
      }
    });

    if (effectsChanged) {
      // We need to merge this update with previous updateState or call it again.
      // Since stateRef is used constraints, we can chain or include in next render.
      // But `updateState` merges.
      updateState({ activeTicketEffects: nextActiveEffects });
    }

    // Set message and play sound
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

    // Check achievements
    if (newTotalSpins >= 100) unlockAchievement('spin100');
    if (newTotalSpins >= 500) unlockAchievement('spin500');
    if (newCredits >= 10000) unlockAchievement('rich');

    // Reset Mercy if we profited (simple check: if credits now >= cost)
    // Removed legacy mercy logic
    // if (state.mercyUsed && newCredits >= SPIN_COST) {
    //   updateState({ mercyUsed: false });
    // }

    setIsSpinning(false); // Allow next spin

    // DYNAMO: Check for Respin
    // Trigger if: Win occurred AND Dynamo owned AND 50% chance
    if (totalWin > 0 && state.ownedTalismans.includes('dynamo')) {
      if (Math.random() < 0.5) {
        // Trigger Respin
        setTimeout(() => {
          setToast('⚡ 다이너모 발동! 무료 재굴림! ⚡');
          playSound('levelup'); // Fixed sound
          spin(true); // Recursive call with free flag
        }, 1500);
      }
    }
  }, [isSpinning, state, updateState, playSound, addXP, unlockAchievement]);



  const useItem = (itemName: string) => {
    if (isSpinning || state.items[itemName] <= 0) return;

    const newItems = { ...state.items, [itemName]: state.items[itemName] - 1 };
    const newEffects = { ...state.activeEffects };
    const newBonus = state.bonusSpins;

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
  };

  const buyItem = (itemName: string) => {
    const item = ITEMS[itemName];
    if (!item || state.credits < item.price) {
      playSound('error');
      return;
    }
    const newItems = { ...state.items, [itemName]: state.items[itemName] + 1 };
    updateState({ credits: state.credits - item.price, items: newItems });
    playSound('buy');
  };

  const buyTicketItem = (itemName: string) => {
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
  };

  // ===== TALISMAN SYSTEM =====
  const purchaseTalisman = (talismanId: string) => {
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

    // Note: Economy items (fake_coin, grandma_wallet) are handled via 'includes' check in hooks
    // Probability items (clover_pot) handled via helper

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
  };

  const rerollTalismanShop = () => {
    const cost = state.shopRerollCost;
    if (state.credits < cost) {
      setToast(`코인이 부족합니다! (리롤 비용: ${cost})`);
      playSound('error');
      setTimeout(() => setToast(null), 2000);
      return;
    }

    const newShop = refreshTalismanShop(3, state.ownedTalismans);
    updateState({
      credits: state.credits - cost,
      shopTalismans: newShop
    });

    playSound('coin');
    setToast('🔄 상점 목록 갱신!');
    setTimeout(() => setToast(null), 2000);
  };

  const useTicketItem = (itemName: string) => {
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
          // Wild Card: Activates for Next Spin (Duration 1)
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
  };



  const claimDaily = () => {
    const today = new Date().toDateString();
    const reward = DAILY_REWARDS[Math.min(state.dailyStreak, DAILY_REWARDS.length - 1)] || 100;

    updateState({
      credits: state.credits + reward,
      lastDailyBonus: today,
      dailyStreak: state.dailyStreak + 1
    });
    setShowDailyBonus(false);
    playSound('jackpot');
  };

  const changeBet = (delta: number) => {
    const newBet = Math.max(10, Math.min(100, state.bet + delta));
    updateState({ bet: newBet });
    playSound('click');
  };

  // ===== ATM SYSTEM =====
  const depositToBank = (amount: number) => {
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
  };

  const withdrawFromBank = (amount: number) => {
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
  };

  // Apply interest when starting a new day/round
  // Logic moved to startRound directly to handle UI/Toasts better

  const nextRound = () => {
    if (state.credits < state.currentGoal) return;

    // Award reward tickets for completing the round!
    const ticketsEarned = state.roundRewardTickets;
    const newTickets = state.tickets + ticketsEarned;

    // Show toast for ticket reward
    if (ticketsEarned > 0) {
      setToast(`🎟️ +${ticketsEarned} 티켓 획득!`);
    }

    // Trigger Phone Call for next round selection
    const choices = generatePhoneChoices(state.round, false);

    updateState({
      tickets: newTickets,
      showPhoneModal: true,
      currentPhoneChoices: choices
    });

    playSound('jackpot');
  };

  const selectPhoneBonus = (bonusId: string) => {
    const bonus = PHONE_BONUSES.find(b => b.id === bonusId);
    if (!bonus) return;

    // Apply immediate credit bonuses if any (rare special)
    // Then queue next round selection

    updateState({
      activeBonuses: [...state.activeBonuses, bonus.id],
      showPhoneModal: false,
      showRoundSelector: true, // Trigger Round Difficulty Selection
    });
    setToast(`${bonus.icon} ${bonus.name} SELECTED!`);
  };

  const startRound = (isRisky: boolean) => {
    // Determine if we are starting a NEW ROUND (Goal Met) or NEXT DAY (Goal Pending)
    // Also handle initial game start (Round 0)
    const isNewRound = state.credits >= state.currentGoal || state.round === 0;

    const nextRoundNum = isNewRound ? state.round + 1 : state.round;
    const nextDay = isNewRound ? 1 : state.currentDay;

    // Get Config for the ROUND (Safe/Risky values depend on Round, not Day)
    const config = getRoundConfig(nextRoundNum);

    // Determine Mode
    const mode = isRisky ? config.risky : config.safe;

    // Check Affordability
    if (state.credits < mode.cost) {
      playSound('error');
      setToast('NOT ENOUGH COINS!');
      return;
    }

    updateState({
      round: nextRoundNum,
      currentDay: nextDay,
      credits: state.credits - mode.cost, // Deduct Entry Fee
      currentGoal: config.goal,
      spinsLeft: mode.spins,
      maxSpins: mode.spins,
      roundRewardTickets: mode.rewardTickets, // Set rewards based on risk
      gameOver: false,
      showRoundSelector: false,
    });

    // Auto-refresh Talisman Shop on New Day/Round
    // This gives new strategic options before spending tickets
    const newShop = refreshTalismanShop(3, state.ownedTalismans);
    updateState({ shopTalismans: newShop });

    // Apply bank interest at the start of each new day/round
    if (state.bankDeposit > 0) {
      const interest = Math.floor(state.bankDeposit * state.interestRate);
      if (interest > 0) {
        // Use setTimeout to show interest
        setTimeout(() => {
          updateState({
            bankDeposit: stateRef.current.bankDeposit + interest,
            totalInterestEarned: stateRef.current.totalInterestEarned + interest,
          });
          setToast(`📈 이자 +${interest} 코인!`);
          setTimeout(() => setToast(null), 2000);
        }, 500);
      }
    }

    playSound('start');
    setMessage(`ROUND ${nextRoundNum} - DAY ${nextDay} START!`);
  };

  const restartGame = () => {
    // Reset to initial state but maybe keep achievements?
    // For now, full reset
    // We need to reload initial state
    setState(INITIAL_GAME_STATE);
    // Clear local storage logic handled by updateState but careful with partials
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload(); // Simple reload to ensure clean state
  };

  return {
    state,
    isSpinning,
    reelSpinning, // Exported state
    message,
    grid,
    winningCells,
    showLevelUp,
    setShowLevelUp,
    showDailyBonus,
    setShowDailyBonus,
    showCurse,
    toast,
    actions: {
      spin: () => spin(false),
      changeBet,
      useItem,
      buyItem,
      buyTicketItem,
      useTicketItem,
      purchaseTalisman,
      rerollTalismanShop,
      depositToBank,
      withdrawFromBank,
      claimDaily,
      playSound,
      nextRound,
      selectPhoneBonus,
      startRound,
      restartGame,
    },
  };
}
