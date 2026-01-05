import React from 'react';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/8bit/dialog';
import { TICKET_ITEMS, TICKET_ITEM_KEYS } from '@/app/constants';
import type { GameState } from '@/app/types';

interface TicketShopProps {
  state: GameState;
  onBuy: (id: string) => void;
  shopTitle?: string;
}

export function TicketShop({ state, onBuy, shopTitle = "🎟️ TICKET SHOP" }: TicketShopProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 px-3 text-xs bg-yellow-900 border-yellow-500 text-yellow-400">
          🎟️ {state.tickets}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-stone-800 border-4 border-yellow-500 text-white h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-center text-xl">{shopTitle}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center border-2 border-yellow-500 p-2 text-yellow-400 text-lg">
            🎟️ TICKETS: {state.tickets}
          </div>
          
          {/* Passive Items */}
          <div className="text-center text-purple-400 text-xs border-b border-purple-400 pb-1">🟣 PASSIVE (PERMANENT)</div>
          {TICKET_ITEM_KEYS.filter(k => TICKET_ITEMS[k].type === 'passive').map((key) => {
            const item = TICKET_ITEMS[key];
            const owned = state.passiveEffects[key];
            return (
              <div key={key} className={`flex items-center justify-between bg-black p-2 border ${owned ? 'border-purple-400' : 'border-white'}`}>
                <div className="text-2xl mr-3">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-xs text-white">{item.name}</div>
                  <div className="text-[10px] text-purple-400">{item.desc}</div>
                </div>
                {owned ? (
                  <span className="text-green-400 text-xs">✓ OWNED</span>
                ) : (
                  <Button size="sm" onClick={() => onBuy(key)} disabled={state.tickets < item.price}>
                    🎟️{item.price}
                  </Button>
                )}
              </div>
            );
          })}

          {/* Active Items */}
          <div className="text-center text-green-400 text-xs border-b border-green-400 pb-1 mt-2">🟢 ACTIVE ({TICKET_ITEMS.scatterBoost.duration} SPINS)</div>
          {TICKET_ITEM_KEYS.filter(k => TICKET_ITEMS[k].type === 'active').map((key) => {
            const item = TICKET_ITEMS[key];
            const count = state.ticketItems[key] || 0;
            return (
              <div key={key} className="flex items-center justify-between bg-black p-2 border border-white">
                <div className="text-2xl mr-3">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-xs text-white">{item.name} <span className="text-green-400">x{count}</span></div>
                  <div className="text-[10px] text-green-400">{item.desc}</div>
                </div>
                <Button size="sm" onClick={() => onBuy(key)} disabled={state.tickets < item.price}>
                  🎟️{item.price}
                </Button>
              </div>
            );
          })}

          {/* Consumable Items */}
          <div className="text-center text-cyan-400 text-xs border-b border-cyan-400 pb-1 mt-2">🔵 CONSUMABLE (ONE-TIME)</div>
          {TICKET_ITEM_KEYS.filter(k => TICKET_ITEMS[k].type === 'consumable').map((key) => {
            const item = TICKET_ITEMS[key];
            const count = state.ticketItems[key] || 0;
            return (
              <div key={key} className="flex items-center justify-between bg-black p-2 border border-white">
                <div className="text-2xl mr-3">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-xs text-white">{item.name} <span className="text-cyan-400">x{count}</span></div>
                  <div className="text-[10px] text-cyan-400">{item.desc}</div>
                </div>
                <Button size="sm" onClick={() => onBuy(key)} disabled={state.tickets < item.price}>
                  🎟️{item.price}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
