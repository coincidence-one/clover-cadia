import React from 'react';
import { SYMBOLS, PAYLINES } from '@/app/constants';
import { useLocale } from '@/app/contexts/LocaleContext';
import { Badge } from '@/components/ui/8bit/badge';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/8bit/dialog';
import { getDisplayProbabilities } from '@/app/utils/gameHelpers';
import type { GameState } from '@/app/types';

// Rarity Helper
const getRarity = (id: string, t: any) => {
  switch (id) {
    case 'cherry':
    case 'lemon': return { label: t.common, color: 'text-stone-400' };
    case 'clover':
    case 'bell': return { label: t.uncommon, color: 'text-green-400' };
    case 'diamond':
    case 'treasure': return { label: t.rare, color: 'text-blue-400' };
    case 'seven': return { label: t.legendary, color: 'text-yellow-400' };
    case 'six': return { label: t.cursed, color: 'text-red-600' };
    default: return { label: '', color: 'text-white' };
  }
};

const SymbolRow = ({ symbol, t, probability }: { symbol: any, t: any, probability?: any }) => {
  const rarity = getRarity(symbol.id, t);
  const basePayout = symbol.value > 0 ? symbol.value * 10 : 0;
  
  // Probability Display
  const probDisplay = probability ? (
    <div className={`text-[10px] ${probability.changed === 'up' ? 'text-green-400' : probability.changed === 'down' ? 'text-red-400' : 'text-stone-500'}`}>
      {probability.changed === 'up' && '▲'}
      {probability.changed === 'down' && '▼'} 
      {probability.current}%
    </div>
  ) : null;

  return (
    <div className="flex items-center justify-between border-b border-stone-700 py-1 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-xl">{symbol.icon}</span>
        <div className="flex flex-col">
          <span className={rarity.color + " uppercase font-bold text-[10px]"}>{rarity.label}</span>
          {probDisplay}
        </div>
      </div>
      <div className="text-right">
        <div className="text-yellow-400">{basePayout > 0 ? basePayout : '???'}</div>
      </div>
    </div>
  );
};

export const SymbolsPanel = ({ state }: { state?: GameState }) => {
  const { t } = useLocale();
  const probs = state ? getDisplayProbabilities(state.activeBonuses, state.activeTicketEffects) : null;

  return (
    <div className="bg-stone-900/90 border-2 border-stone-600 p-2 w-48 text-stone-200">
      <h3 className="text-center text-yellow-400 border-b-2 border-yellow-600 pb-1 mb-2">{t.symbols}</h3>
      <div className="flex justify-between text-[10px] text-stone-500 mb-1 px-1">
        <span>TYPE / PROB</span>
        <span>{t.baseValue}</span>
      </div>
      <div className="space-y-1">
        {SYMBOLS.filter(s => s.id !== 'wild').map(s => (
          <SymbolRow key={s.id} symbol={s} t={t} probability={probs ? probs[s.id] : undefined} />
        ))}
        {/* Wild Card Manual Entry */}
        <div className="flex items-center justify-between border-b border-stone-700 py-1 text-xs">
           <div className="flex items-center gap-2">
             <span className="text-xl">🃏</span>
             <span className="text-[10px] text-purple-400 font-bold">WILD</span>
           </div>
           <div className="text-[10px] text-stone-500">Substitutes</div>
        </div>
      </div>
      <div className="mt-2 text-[8px] text-stone-500 text-center leading-tight">
        {t.paytableNote}
      </div>
    </div>
  );
};

export const PatternsPanel = () => {
  const { t } = useLocale();
  
  // Create mini grid visualizer
  const renderMiniGrid = (pattern: number[]) => (
    <div className="grid grid-cols-5 gap-[1px] bg-stone-800 p-[1px] w-20">
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={i} 
          className={`h-3 w-3 ${pattern.includes(i) ? 'bg-yellow-500' : 'bg-stone-900'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-stone-900/90 border-2 border-stone-600 p-2 w-48 text-stone-200">
      <h3 className="text-center text-green-400 border-b-2 border-green-600 pb-1 mb-2">{t.patterns}</h3>
      
      {/* Match Multipliers */}
      <div className="mb-4 bg-black/50 p-2 rounded border border-stone-700">
        <div className="text-[10px] text-center mb-1 text-stone-400">{t.multiplier}</div>
        <div className="flex justify-between text-xs">
          <div className="flex flex-col items-center">
            <span className="text-stone-300">{t.match3}</span>
            <span className="text-yellow-400 font-bold">1x</span>
          </div>
          <div className="flex flex-col items-center border-l border-stone-700 pl-2">
            <span className="text-stone-300">{t.match4}</span>
            <span className="text-yellow-400 font-bold">2x</span>
          </div>
          <div className="flex flex-col items-center border-l border-stone-700 pl-2">
            <span className="text-stone-300">{t.match5}</span>
            <span className="text-yellow-400 font-bold">3x</span>
          </div>
        </div>
        <div className="text-[8px] text-stone-500 text-center mt-1">
          (Base Value × Multiplier)
        </div>
      </div>
      
      {/* Clarification Note */}
      <div className="text-[9px] text-yellow-400 text-center mb-2 bg-yellow-900/30 p-1 rounded border border-yellow-600/50">
        ⚠️ 왼쪽부터 3개 이상 연속 일치 시 당첨!<br/>
        (WIN if 3+ match from LEFT)
      </div>

      <div className="space-y-3 h-[300px] overflow-y-auto pr-1 customize-scrollbar">
        {PAYLINES.map((pattern, idx) => (
          <div key={idx} className="flex items-center justify-between border-b border-stone-800 pb-1">
            <span className="text-[10px] text-stone-500">LINE {idx + 1}</span>
            {renderMiniGrid(pattern)}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PaytableModal = ({ state }: { state?: GameState }) => {
  const { t } = useLocale();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 text-xs bg-stone-800 text-stone-300 border-stone-600">
          ℹ️ {t.paytableTitle}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-stone-900 border-4 border-stone-500 text-white max-h-[80vh] overflow-y-auto">
        <DialogTitle className="sr-only">{t.paytableTitle}</DialogTitle>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-start pt-4">
          <SymbolsPanel state={state} />
          <PatternsPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};
