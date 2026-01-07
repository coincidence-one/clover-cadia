'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useGameSync } from '@/app/hooks/useGameSync';
import { supabase } from '@/lib/supabase';
import { RARITY_COLORS, BG_COLORS } from '../../utils/styleConstants';

interface GlobalItem {
  id: string;
  item_type: string;
  rarity: string;
  metadata: { name: string; description: string; icon?: string } | null;
}

export default function CollectionPage() {
  const { user } = useAuth();
  const { fetchUnlocks } = useGameSync();
  const [items, setItems] = useState<GlobalItem[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    
    // Fetch all items
    const { data: itemsData } = await supabase
      .from('global_items')
      .select('*')
      .order('id', { ascending: true }); // Order by ID or some index

    if (itemsData) setItems(itemsData as GlobalItem[]);

    // Fetch unlocked
    if (user) {
      const unlocks = await fetchUnlocks();
      setUnlocked(unlocks);
    }
    
    setLoading(false);
  }, [user, fetchUnlocks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center font-pixel">
        <div className="text-green-400 animate-pulse text-xl">LOADING DATE...</div>
      </div>
    );
  }

  // Group by rarity for better display? Or just grid?
  // Let's do a simple grid first.
  
  return (
    <div className="min-h-screen bg-stone-900 text-green-400 font-pixel p-4 flex flex-col items-center">
      {/* CRT Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/lobby">
            <button className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 border-2 border-white transition-colors">
              ← LOBBY
            </button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl text-yellow-400 mb-2">📖 COLLECTION</h1>
            <div className="text-stone-400 text-sm">
              DISCOVERED: {unlocked.length} / {items.length}
            </div>
          </div>
          <div className="w-24"></div> {/* Spacer */}
        </div>

        {/* Collection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const isUnlocked = unlocked.includes(item.id);
            const styleColor = RARITY_COLORS[item.rarity] || 'text-white border-white';
            const bgColor = BG_COLORS[item.rarity] || 'bg-stone-800';

            return (
              <div 
                key={item.id}
                className={`relative border-4 p-4 aspect-square flex flex-col items-center justify-center text-center transition-all 
                  ${isUnlocked ? `${styleColor} ${bgColor}` : 'border-stone-700 bg-stone-900 text-stone-700'}
                `}
              >
                {isUnlocked ? (
                  <>
                    <div className="text-4xl mb-4 animate-bounce-slow">
                      {/* Placeholder Icon if metadata doesn't have one, use generic based on type/rarity */}
                      {item.metadata?.icon || '📜'}
                    </div>
                    <div className="font-bold mb-1">{item.metadata?.name}</div>
                    <div className="text-[10px] opacity-70 px-2 leading-tight">
                      {item.metadata?.description}
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] uppercase opacity-50">
                      {item.rarity}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Silhouette / Locked View */}
                    <div className="text-4xl mb-4 text-stone-800 grayscale blur-sm">
                      ?
                    </div>
                    <div className="font-bold mb-1">???</div>
                    <div className="text-[10px] text-stone-600">
                      Undiscovered
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] text-stone-700">
                      LOCKED
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
