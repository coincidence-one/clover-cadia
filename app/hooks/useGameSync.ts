'use client';

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/contexts/AuthContext';
import { GameState } from '@/app/types';

interface UserProfile {
  id: string;
  nickname: string;
  meta_currency: number;
  best_round: number;
  total_playtime: number;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  round_reached: number;
  deck_snapshot: Record<string, unknown> | null;
  played_at: string;
}

/**
 * Calculate clover points earned from a game session
 * Formula: floor(score / 100) + (round * 5)
 */
function calculateCloverPoints(score: number, round: number): number {
  return Math.floor(score / 100) + (round * 5);
}

export function useGameSync() {
  const { user } = useAuth();

  /**
   * Fetch user profile from Supabase
   */
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as UserProfile;
  }, [user]);

  /**
   * Sync game over data to Supabase
   * - Add entry to leaderboard
   * - Award clover points to profile
   * - Update best_round if new record
   */
  const syncGameOver = useCallback(async (
    state: GameState
  ): Promise<{ cloverPointsEarned: number; newBestRound: boolean } | null> => {
    if (!user) {
      console.log('Not logged in, skipping sync');
      return null;
    }

    const score = state.credits;
    const round = state.round;
    const deck = {
      ownedTalismans: state.ownedTalismans,
      ticketItems: state.ticketItems,
      activeBonuses: state.activeBonuses,
    };

    const cloverPointsEarned = calculateCloverPoints(score, round);

    try {
      // 1. Add to leaderboard
      const { error: leaderboardError } = await supabase
        .from('leaderboard')
        .insert({
          user_id: user.id,
          score,
          round_reached: round,
          deck_snapshot: deck,
        });

      if (leaderboardError) {
        console.error('Leaderboard insert error:', leaderboardError);
      }

      // 2. Fetch current profile
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('meta_currency, best_round')
        .eq('id', user.id)
        .single();

      if (profileFetchError) {
        console.error('Profile fetch error:', profileFetchError);
        return null;
      }

      const currentCurrency = profile?.meta_currency || 0;
      const currentBestRound = profile?.best_round || 0;
      const newBestRound = round > currentBestRound;

      // 3. Update profile with new currency and possibly best_round
      const updates: Record<string, number> = {
        meta_currency: currentCurrency + cloverPointsEarned,
      };

      if (newBestRound) {
        updates.best_round = round;
      }

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError);
      }

      return { cloverPointsEarned, newBestRound };
    } catch (error) {
      console.error('Sync game over error:', error);
      return null;
    }
  }, [user]);

  /**
   * Purchase an unlock from the Soul Shop
   */
  const purchaseUnlock = useCallback(async (
    itemId: string,
    cost: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    try {
      // 1. Check current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('meta_currency')
        .eq('id', user.id)
        .single();

      if (fetchError || !profile) {
        return { success: false, error: 'Could not fetch profile' };
      }

      if (profile.meta_currency < cost) {
        return { success: false, error: 'Not enough clover points' };
      }

      // 2. Check if already unlocked
      const { data: existing } = await supabase
        .from('user_unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        return { success: false, error: 'Already unlocked' };
      }

      // 3. Deduct cost and add unlock
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ meta_currency: profile.meta_currency - cost })
        .eq('id', user.id);

      if (updateError) {
        return { success: false, error: 'Failed to deduct points' };
      }

      const { error: insertError } = await supabase
        .from('user_unlocks')
        .insert({ user_id: user.id, item_id: itemId });

      if (insertError) {
        // Rollback the deduction
        await supabase
          .from('profiles')
          .update({ meta_currency: profile.meta_currency })
          .eq('id', user.id);
        return { success: false, error: 'Failed to record unlock' };
      }

      return { success: true };
    } catch (error) {
      console.error('Purchase unlock error:', error);
      return { success: false, error: 'Unknown error' };
    }
  }, [user]);

  /**
   * Fetch user's unlocked items
   */
  const fetchUnlocks = useCallback(async (): Promise<string[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_unlocks')
      .select('item_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Fetch unlocks error:', error);
      return [];
    }

    return data.map((row: { item_id: string }) => row.item_id);
  }, [user]);

  /**
   * Fetch top leaderboard entries
   */
  const fetchLeaderboard = useCallback(async (limit = 10): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Fetch leaderboard error:', error);
      return [];
    }

    return data as LeaderboardEntry[];
  }, []);

  return {
    fetchProfile,
    syncGameOver,
    purchaseUnlock,
    fetchUnlocks,
    fetchLeaderboard,
    isLoggedIn: !!user,
  };
}
