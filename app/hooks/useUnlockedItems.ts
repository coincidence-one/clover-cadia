'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useGameSync } from '@/app/hooks/useGameSync';

/**
 * Hook to manage unlocked items for the current user.
 * 
 * In the game, talismans are filtered based on what the user has unlocked
 * in the Soul Shop. If a user is not logged in, all base talismans are available.
 */

// Base talismans available to all players (free tier)
const BASE_TALISMANS = [
  'golden_cherry',
  'golden_lemon',
  'bible',
  'lucky_cat',
  'fake_coin',
];

export function useUnlockedItems() {
  const { user } = useAuth();
  const { fetchUnlocks } = useGameSync();
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUnlocks = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);

    if (user) {
      const unlocks = await fetchUnlocks();
      // Combine base talismans with user unlocks
      const allAvailable = [...new Set([...BASE_TALISMANS, ...unlocks])];
      setUnlockedItems(allAvailable);
    } else {
      // Guest users get only base talismans
      setUnlockedItems(BASE_TALISMANS);
    }

    setLoading(false);
  }, [user, fetchUnlocks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUnlocks(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadUnlocks]);

  /**
   * Check if a specific item is unlocked
   */
  const isUnlocked = useCallback((itemId: string): boolean => {
    return unlockedItems.includes(itemId) || BASE_TALISMANS.includes(itemId);
  }, [unlockedItems]);

  /**
   * Filter a list of item IDs to only include unlocked ones
   */
  const filterUnlocked = useCallback((itemIds: string[]): string[] => {
    return itemIds.filter(id => isUnlocked(id));
  }, [isUnlocked]);

  return {
    unlockedItems,
    isUnlocked,
    filterUnlocked,
    loading,
    refresh: loadUnlocks,
  };
}
