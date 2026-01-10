'use client';

import React from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Badge } from '@/components/ui/8bit/badge';

import { TicketShop } from './TicketShop';
import { TalismanShop } from './TalismanShop';
import { PaymentCenter } from './PaymentCenter';
import { PaytableModal } from './Paytable';
import { AchievementsModal } from './AchievementsModal';
import { UserMenu } from '../auth/UserMenu';

import type { GameState } from '@/app/types';
import type { Translations } from '@/app/locales/en';

interface TopActionBarProps {
  level: number;
  levelRank: string;
  onShowGuide: () => void;
  state: GameState;
  actions: {
    buyTicketItem: (itemKey: string) => void;
    purchaseTalisman: (id: string) => void;
    rerollTalismanShop: () => void;
    makePayment: (amount: number) => void;
  };
  t: Translations;
  toggleLocale: () => void;
}

export function TopActionBar({
  level,
  levelRank,
  onShowGuide,
  state,
  actions,
  t,
  toggleLocale,
}: TopActionBarProps) {
  return (
    <div className="w-full max-w-2xl flex justify-between items-center mb-2 gap-1 md:gap-2">
      {/* Level Badge */}
      <Badge 
        variant="default" 
        className="bg-purple-600 text-yellow-400 text-[10px] md:text-xs px-2 md:px-4 py-1 md:py-2 shrink-0 truncate max-w-[100px] md:max-w-none"
      >
        <span className="md:hidden">LV.{level}</span>
        <span className="hidden md:inline">{levelRank} {t.level}{level}</span>
      </Badge>
      
      {/* Buttons Group */}
      <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar pb-1 max-w-[200px] md:max-w-none items-center">
        {/* User Menu */}
        <UserMenu />

        {/* Guide Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onShowGuide}
          className="h-8 w-8 p-0 border-yellow-500/50 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/40"
          title="Guide"
        >
          ?
        </Button>

        {/* Paytable Modal (Mobile/Tablet) */}
        <div className="xl:hidden">
          <PaytableModal state={state} />
        </div>

        {/* Language Toggle */}
        <Button 
          variant="outline" 
          className="h-8 md:h-10 w-8 md:w-14 text-xs p-0 md:px-2" 
          onClick={toggleLocale}
        >
          <span className="md:hidden">{t.language === '한' ? 'KR' : 'EN'}</span>
          <span className="hidden md:inline">{t.language === '한' ? 'KR' : 'EN'}</span>
        </Button>

        {/* TicketShop */}
        <TicketShop 
          state={state} 
          onBuy={actions.buyTicketItem}
          shopTitle={t.shopTitle} 
        />

        {/* TalismanShop */}
        <TalismanShop
          tickets={state.tickets}
          credits={state.credits}
          ownedTalismans={state.ownedTalismans}
          shopTalismans={state.shopTalismans || []}
          rerollCost={state.shopRerollCost}
          maxSlots={state.talismanSlots}
          onPurchase={actions.purchaseTalisman}
          onReroll={actions.rerollTalismanShop}
        />

        {/* Payment Center */}
        <PaymentCenter
          credits={state.credits}
          currentDebt={state.currentDebt}
          paidAmount={state.paidAmount}
          deadlineTurn={state.deadlineTurn}
          currentTurn={state.currentTurn}
          earlyPaymentBonus={state.earlyPaymentBonus}
          onPayment={actions.makePayment}
        />

        {/* Achievements Dialog */}
        <AchievementsModal achievements={state.achievements} t={t} />
      </div>
    </div>
  );
}
