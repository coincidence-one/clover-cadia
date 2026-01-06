'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/8bit/dialog';
import { Button } from '@/components/ui/8bit/button';
import { TALISMANS, type Talisman, type TalismanRarity } from '@/app/constants/talismans';
import { useLocale } from '@/app/contexts/LocaleContext';

interface TalismanShopProps {
  tickets: number;
  ownedTalismans: string[];
  onPurchase: (talismanId: string) => void;
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

type TabType = 'all' | 'golden' | 'protection' | 'bonus' | 'special';

export const TalismanShop = ({ tickets, ownedTalismans, onPurchase }: TalismanShopProps) => {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const talismans = Object.values(TALISMANS);

  const filteredTalismans = talismans.filter(talisman => {
    if (activeTab === 'all') return true;
    if (activeTab === 'golden') return talisman.id.startsWith('golden_');
    if (activeTab === 'protection') return ['bible', 'rosary'].includes(talisman.id);
    if (activeTab === 'bonus') return ['lucky_cat', 'fat_cat', 'fake_coin', 'lost_wallet', 'grandma_wallet', 'fortune_cookie'].includes(talisman.id);
    if (activeTab === 'special') return ['clover_pot', 'devil_horn', 'crystal_skull', 'crystal_ball', 'dynamo'].includes(talisman.id);
    return true;
  });

  const TalismanCard = ({ talisman }: { talisman: Talisman }) => {
    const isOwned = ownedTalismans.includes(talisman.id);
    const canAfford = tickets >= talisman.price;

    return (
      <div 
        className={`
          p-2 rounded border-2 ${RARITY_COLORS[talisman.rarity]} ${RARITY_BG[talisman.rarity]}
          ${isOwned ? 'opacity-50' : ''}
        `}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{talisman.icon}</span>
          <div className="flex-1">
            <div className={`text-xs font-bold ${RARITY_COLORS[talisman.rarity].split(' ')[0]}`}>
              {talisman.name}
            </div>
            <div className="text-[10px] text-stone-500">
              {RARITY_LABELS[talisman.rarity]}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-yellow-400 font-bold">{talisman.price}🎟️</div>
          </div>
        </div>
        <div className="text-[10px] text-stone-400 mb-2">{talisman.desc}</div>
        <Button
          size="sm"
          className="w-full text-[10px] h-6"
          disabled={isOwned || !canAfford}
          onClick={() => onPurchase(talisman.id)}
        >
          {isOwned ? '보유중' : canAfford ? '구매' : '티켓 부족'}
        </Button>
      </div>
    );
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'all', label: '전체', icon: '📦' },
    { key: 'golden', label: '황금', icon: '✨' },
    { key: 'protection', label: '방어', icon: '🛡️' },
    { key: 'bonus', label: '보너스', icon: '💰' },
    { key: 'special', label: '특수', icon: '⚡' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 text-xs bg-purple-900/50 text-purple-300 border-purple-500">
          🔮 부적 상점
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-stone-900 border-4 border-purple-500 text-white max-h-[80vh] overflow-hidden">
        <DialogTitle className="text-center text-purple-400 border-b-2 border-purple-600 pb-2 mb-2">
          🔮 부적 상점 (Talismans)
        </DialogTitle>

        {/* Ticket Balance */}
        <div className="text-center mb-3">
          <span className="text-stone-400">보유 티켓: </span>
          <span className="text-yellow-400 font-bold text-lg">{tickets}🎟️</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-2 py-1 text-[10px] rounded whitespace-nowrap
                ${activeTab === tab.key 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Talismans Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredTalismans.map(talisman => (
            <TalismanCard key={talisman.id} talisman={talisman} />
          ))}
        </div>

        {/* Owned Count */}
        <div className="text-center text-[10px] text-stone-500 mt-2">
          보유 부적: {ownedTalismans.length} / {talismans.length}
        </div>
      </DialogContent>
    </Dialog>
  );
};
