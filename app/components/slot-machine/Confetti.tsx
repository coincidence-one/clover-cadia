import React, { useState } from 'react';

interface ConfettiProps {
  count?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ count = 50 }) => {
  const [particles] = useState(() => {
    const colors = ['#facc15', '#eab308', '#ffffff', '#fbbf24']; // Yellows and White
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2, // 0-2s delay
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5, // 5-15px
    }));
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px] animate-fall"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            boxShadow: '2px 2px 0rgba(0,0,0,0.2)'
          }}
        />
      ))}
    </div>
  );
};
