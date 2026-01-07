
import React, { useState } from 'react';
import { SYMBOLS, PATTERNS } from '@/app/constants';
import { useLocale } from '@/app/contexts/LocaleContext';
import { Button } from '@/components/ui/8bit/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/8bit/dialog';
import { getDisplayProbabilities } from '@/app/utils/gameHelpers';
import type { GameState, GameSymbol } from '@/app/types';
import type { Translations } from '@/app/locales';

interface ProbabilityData {
  current: number;
  base: number;
  changed: 'up' | 'down' | 'same';
}

// Rarity Helper
const getRarity = (id: string, t: Translations) => {
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

const SymbolRow = ({ symbol, t, probability }: { symbol: GameSymbol, t: Translations, probability?: ProbabilityData }) => {
  const rarity = getRarity(symbol.id, t);
  
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
        <div className="w-8 h-8 flex items-center justify-center">
          <img src={symbol.icon} alt={symbol.id} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className={rarity.color + " uppercase font-bold text-[10px]"}>{rarity.label}</span>
          {probDisplay}
        </div>
      </div>
        <div className="text-yellow-400 font-bold text-right">
          {symbol.value > 0 ? (
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-stone-400 font-normal">Base: {symbol.value}</span>
               <span>×{symbol.value}</span>
            </div>
          ) : (symbol.id === 'six' ? <span className="text-red-500">저주/CURSE</span> : '???')}
        </div>
    </div>
  );
};

export const SymbolsPanel = ({ state }: { state?: GameState }) => {
  const { t } = useLocale();
  const probs = state ? getDisplayProbabilities(state.activeBonuses, state.activeTicketEffects) : null;

  return (
    <div className="bg-stone-900/90 border-2 border-stone-600 p-2 w-full max-w-[280px] text-stone-200">
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
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(PATTERNS.length / ITEMS_PER_PAGE);
  
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

  const currentPatterns = PATTERNS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const startIdx = page * ITEMS_PER_PAGE;

  return (
    <div className="bg-stone-900/90 border-2 border-stone-600 p-2 w-full max-w-[280px] text-stone-200">
      <h3 className="text-center text-green-400 border-b-2 border-green-600 pb-1 mb-2">{t.patterns}</h3>
      
      {/* Clarification Note - CloverPit Style */}
      <div className="text-[9px] text-yellow-400 text-center mb-2 bg-yellow-900/30 p-1 rounded border border-yellow-600/50">
        ⚠️ 패턴 전체가 동일 무늬로 일치 시 당첨!<br/>
        (All cells must match same symbol)
      </div>

      {/* Paginated Patterns with Multipliers */}
      <div className="space-y-2">
        {currentPatterns.map((pattern, idx) => {
          const globalIdx = startIdx + idx;
          return (
            <div key={globalIdx} className="flex items-center justify-between border-b border-stone-800 pb-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-green-400 font-bold">{pattern.nameKo}</span>
                <span className="text-[8px] text-stone-500">{pattern.name}</span>
              </div>
              {renderMiniGrid(pattern.cells)}
              <span className="text-yellow-400 font-bold text-xs">×{pattern.multiplier}</span>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-3 text-[10px]">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className={`px-2 py-1 rounded ${page === 0 ? 'text-stone-600' : 'text-green-400 hover:bg-stone-700'}`}
        >
          ◀ Prev
        </button>
        <span className="text-stone-400">{page + 1} / {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className={`px-2 py-1 rounded ${page >= totalPages - 1 ? 'text-stone-600' : 'text-green-400 hover:bg-stone-700'}`}
        >
          Next ▶
        </button>
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
      <DialogContent className="w-[95vw] max-w-3xl bg-stone-900 border-4 border-stone-500 text-white max-h-[85vh] overflow-y-auto p-4 md:p-6">
        <DialogTitle className="sr-only">{t.paytableTitle}</DialogTitle>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-start pt-2">
          <SymbolsPanel state={state} />
          <PatternsPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};
