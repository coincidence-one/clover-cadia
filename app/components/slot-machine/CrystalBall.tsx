import React from 'react';

interface CrystalBallProps {
  grid?: string[];
}

export const CrystalBall = ({ grid }: CrystalBallProps) => {
  if (!grid || grid.length === 0) return null;

  return (
    <div className="relative group">
      {/* Ball Container */}
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-purple-500 bg-black/80 shadow-[0_0_20px_purple] overflow-hidden relative flex items-center justify-center">
        
        {/* Shine Effect */}
        <div className="absolute top-2 left-4 w-6 h-6 rounded-full bg-white/20 blur-md pointer-events-none z-20"></div>

        {/* Mist/Cloud (optional animation) */}
        
        {/* Mini Grid */}
        <div className="grid grid-cols-5 gap-[1px] md:gap-1 p-2 scale-75 opacity-80 group-hover:opacity-100 group-hover:scale-90 transition-all duration-500 cursor-help">
          {grid.map((symbol, i) => (
            <div key={i} className="text-[8px] md:text-[10px] leading-none flex items-center justify-center filter grayscale group-hover:grayscale-0">
              {symbol}
            </div>
          ))}
        </div>
      </div>

      {/* Base/Stand */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-stone-800 rounded-lg border-2 border-stone-600"></div>
      
      {/* Label Tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded border border-purple-500 pointer-events-none z-50">
        Future Sight
      </div>
    </div>
  );
};
