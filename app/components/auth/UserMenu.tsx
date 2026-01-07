'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

export function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="text-stone-400 text-xs animate-pulse">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 border-2 border-white text-xs font-pixel transition-colors"
        >
          🔐 LOGIN
        </button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 border-2 border-stone-600 px-3 py-1 text-xs font-pixel transition-colors"
      >
        <span className="text-green-400">👤</span>
        <span className="text-white max-w-[80px] truncate">
          {user.email?.split('@')[0] || 'Player'}
        </span>
        <span className="text-stone-400">▼</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-stone-900 border-2 border-stone-600 w-40 z-50">
          <div className="px-3 py-2 border-b border-stone-700">
            <div className="text-[10px] text-stone-400">Logged in as</div>
            <div className="text-green-400 text-xs truncate">{user.email}</div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              setShowDropdown(false);
            }}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-stone-800 text-xs"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
