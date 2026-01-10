'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useGameSync } from '@/app/hooks/useGameSync';
import { supabase } from '@/lib/supabase';

interface GlobalItem {
  id: string;
  item_type: string;
  rarity: string;
  unlock_cost: number;
  unlock_condition: { min_round?: number } | null;
  metadata: { name: string; description: string } | null;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-stone-400 border-stone-600',
  uncommon: 'text-green-400 border-green-600',
  rare: 'text-blue-400 border-blue-600',
  legendary: 'text-yellow-400 border-yellow-600',
};

const RARITY_BG: Record<string, string> = {
  common: 'bg-stone-900/50',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  legendary: 'bg-yellow-900/30',
};

export default function SoulShopPage() {
  const { user } = useAuth();
  const { fetchProfile, fetchUnlocks, purchaseUnlock } = useGameSync();
  const [items, setItems] = useState<GlobalItem[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userBestRound, setUserBestRound] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);

    // Fetch global items
    const { data: itemsData } = await supabase
      .from('global_items')
      .select('*')
      .order('unlock_cost', { ascending: true });

    if (itemsData) {
      setItems(itemsData as GlobalItem[]);
    }

    // Fetch user data
    if (user) {
      const profile = await fetchProfile();
      if (profile) {
        setUserPoints(profile.meta_currency);
        setUserBestRound(profile.best_round);
      }

      const userUnlocks = await fetchUnlocks();
      setUnlocked(userUnlocks);
    }

    setLoading(false);
  }, [user, fetchProfile, fetchUnlocks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handlePurchase = async (item: GlobalItem) => {
    if (purchasing) return;
    
    setPurchasing(item.id);
    const result = await purchaseUnlock(item.id, item.unlock_cost);
    
    if (result.success) {
      // Refresh data
      await loadData();
    } else {
      alert(result.error || 'Purchase failed');
    }
    
    setPurchasing(null);
  };

  const canUnlock = (item: GlobalItem): boolean => {
    if (unlocked.includes(item.id)) return false;
    if (userPoints < item.unlock_cost) return false;
    if (item.unlock_condition?.min_round && userBestRound < item.unlock_condition.min_round) {
      return false;
    }
    return true;
  };

  const getUnlockStatus = (item: GlobalItem): string => {
    if (unlocked.includes(item.id)) return 'UNLOCKED';
    if (item.unlock_condition?.min_round && userBestRound < item.unlock_condition.min_round) {
      return `LOCKED (Reach Round ${item.unlock_condition.min_round})`;
    }
    if (userPoints < item.unlock_cost) return 'NEED MORE 🍀';
    return 'AVAILABLE';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center font-pixel p-4">
        <div className="text-green-400 text-xl mb-4">🔒 LOGIN REQUIRED</div>
        <Link href="/lobby">
          <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 border-2 border-white">
            ← BACK TO LOBBY
          </button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center font-pixel">
        <div className="text-green-400 animate-pulse text-xl">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-green-400 font-pixel p-4">
      {/* CRT Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/lobby">
            <button className="text-stone-400 hover:text-white text-sm">
              ← BACK
            </button>
          </Link>
          <h1 className="text-xl text-purple-400">🛒 SOUL SHOP</h1>
          <div className="bg-black border-2 border-green-600 px-3 py-1 flex items-center gap-2">
            <span className="text-xs">🍀</span>
            <span className="text-green-400">{userPoints}</span>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid gap-3">
          {items.map((item) => {
            const isUnlocked = unlocked.includes(item.id);
            const canBuy = canUnlock(item);
            const status = getUnlockStatus(item);
            
            return (
              <div
                key={item.id}
                className={`border-2 p-3 ${RARITY_COLORS[item.rarity]} ${RARITY_BG[item.rarity]} ${isUnlocked ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs uppercase ${RARITY_COLORS[item.rarity].split(' ')[0]}`}>
                        [{item.rarity}]
                      </span>
                      <span className="text-white text-sm">
                        {item.metadata?.name || item.id}
                      </span>
                    </div>
                    <div className="text-stone-400 text-xs">
                      {item.metadata?.description || 'No description'}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-xs text-stone-500 mb-1">
                      {status}
                    </div>
                    {!isUnlocked && (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={!canBuy || purchasing === item.id}
                        className={`px-3 py-1 text-xs border-2 ${
                          canBuy
                            ? 'bg-green-600 hover:bg-green-500 text-white border-white'
                            : 'bg-stone-700 text-stone-500 border-stone-600 cursor-not-allowed'
                        }`}
                      >
                        {purchasing === item.id ? '...' : `🍀 ${item.unlock_cost}`}
                      </button>
                    )}
                    {isUnlocked && (
                      <span className="text-green-400 text-xs">✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center text-stone-500 py-8">
            No items available yet...
          </div>
        )}
      </div>
    </div>
  );
}
