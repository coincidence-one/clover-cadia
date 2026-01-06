'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/8bit/dialog';
import { Button } from '@/components/ui/8bit/button';
import { TALISMANS, type Talisman, type TalismanRarity } from '@/app/constants/talismans';
import { useLocale } from '@/app/contexts/LocaleContext';

interface TalismanShopProps {
  tickets: number;
  credits: number;
  ownedTalismans: string[];
  shopTalismans: string[]; // List of randomized available talismans
  rerollCost: number;
  maxSlots: number;
  onPurchase: (talismanId: string) => void;
  onReroll: () => void;
}

const RARITY_COLORS: Record<TalismanRarity, string> = {
  common: 'text-stone-400 border-stone-500',
  uncommon: 'text-green-400 border-green-500',
  rare: 'text-blue-400 border-blue-500',
  legendary: 'text-yellow-400 border-yellow-500',
};

const RARITY_BG: Record<TalismanRarity, string> = {
  common: 'bg-stone-800/50',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  legendary: 'bg-yellow-900/30',
};

const RARITY_LABELS: Record<TalismanRarity, string> = {
  common: '일반',
  uncommon: '고급',
  rare: '희귀',
  legendary: '전설',
};

export const TalismanShop = ({ 
  tickets, 
  credits,
  ownedTalismans, 
  shopTalismans,
  rerollCost,
  maxSlots,
  onPurchase,
  onReroll
}: TalismanShopProps) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');

  // Helper to render card
  const TalismanCard = ({ talisman, isInventory = false }: { talisman: Talisman, isInventory?: boolean }) => {
    const isOwned = ownedTalismans.includes(talisman.id);
    // If in inventory, we always "own" it. If in shop, we check ownership (though refresh filters it usually)
    const canAfford = tickets >= talisman.price;

    return (
      <div 
        className={`
          relative p-2 rounded border-2 ${RARITY_COLORS[talisman.rarity]} ${RARITY_BG[talisman.rarity]}
        `}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{talisman.icon}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold truncate ${RARITY_COLORS[talisman.rarity].split(' ')[0]}`}>
              {talisman.name}
            </div>
            <div className="text-[10px] text-stone-500 truncate">
              {RARITY_LABELS[talisman.rarity]}
            </div>
          </div>
          {!isInventory && (
            <div className="text-right shrink-0">
              <div className="text-xs text-yellow-400 font-bold">{talisman.price}🎟️</div>
            </div>
          )}
        </div>
        <div className="text-[10px] text-stone-400 mb-2 h-8 overflow-hidden line-clamp-2 leading-tight">
          {talisman.desc}
        </div>
        
        {!isInventory && (
          <Button
            size="sm"
            className="w-full text-[10px] h-6"
            disabled={isOwned || !canAfford}
            onClick={() => onPurchase(talisman.id)}
          >
            {isOwned ? '보유중' : canAfford ? '구매' : '티켓 부족'}
          </Button>
        )}
      </div>
    );
  };

  // Get Shop Items
  const shopItems = shopTalismans.map(id => TALISMANS[id]).filter(Boolean);
  
  // Get Owned Items
  const inventoryItems = ownedTalismans.map(id => TALISMANS[id]).filter(Boolean);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 text-xs bg-purple-900/50 text-purple-300 border-purple-500 relative">
          🔮 부적
          {/* Notification dot if tickets available? Maybe later */}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-stone-900 border-4 border-purple-500 text-white max-h-[85vh] overflow-hidden flex flex-col">
        <DialogTitle className="text-center text-purple-400 border-b-2 border-purple-600 pb-2 shrink-0">
          🔮 부적 (Talismans)
        </DialogTitle>

        {/* Resources Header */}
        <div className="grid grid-cols-2 gap-2 text-center py-2 shrink-0">
          <div className="bg-stone-800/50 rounded p-1 border border-stone-700">
            <div className="text-[10px] text-stone-500">티켓</div>
            <div className="text-yellow-400 font-bold">{tickets} 🎟️</div>
          </div>
          <div className="bg-stone-800/50 rounded p-1 border border-stone-700">
            <div className="text-[10px] text-stone-500">보유 부적</div>
            <div className={`font-bold ${ownedTalismans.length >= maxSlots ? 'text-red-400' : 'text-green-400'}`}>
              {ownedTalismans.length} / {maxSlots}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-700 shrink-0 mb-2">
          <button
            className={`flex-1 py-2 text-xs font-bold ${activeTab === 'shop' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-stone-500'}`}
            onClick={() => setActiveTab('shop')}
          >
            🏪 상점
          </button>
          <button
            className={`flex-1 py-2 text-xs font-bold ${activeTab === 'inventory' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-stone-500'}`}
            onClick={() => setActiveTab('inventory')}
          >
            🎒 보관함
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-1">
          {activeTab === 'shop' ? (
            <div className="h-full flex flex-col">
              {shopItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 pb-4">
                  {shopItems.map(t => (
                    <TalismanCard key={t.id} talisman={t} />
                  ))}
                  {/* Empty slots placeholders if needed, but not strictly required */}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-stone-500 text-xs">
                  상점이 비었습니다.
                </div>
              )}
              
              <div className="text-[10px] text-center text-stone-500 mt-2 mb-2">
                * 데드라인(Day)이 지날 때마다 상점이 갱신됩니다.
              </div>
            </div>
          ) : (
            <div>
              {inventoryItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 pb-4">
                  {inventoryItems.map(t => (
                    <TalismanCard key={t.id} talisman={t} isInventory={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-stone-500 text-xs py-10">
                  보유한 부적이 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions (Only for Shop) */}
        {activeTab === 'shop' && (
          <div className="pt-2 border-t border-stone-700 shrink-0">
             <Button
                variant="outline"
                size="sm"
                className="w-full border-yellow-600 text-yellow-500 hover:bg-yellow-900/20"
                onClick={onReroll}
                disabled={credits < rerollCost}
              >
                🔄 상점 갱신 ({rerollCost} 🪙)
              </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
