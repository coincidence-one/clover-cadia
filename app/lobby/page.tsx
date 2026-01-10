'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useGameSync } from '@/app/hooks/useGameSync';
import { AuthModal } from '@/app/components/auth/AuthModal';

interface UserProfile {
  nickname: string;
  meta_currency: number;
  best_round: number;
  total_playtime: number;
}

interface LeaderboardEntry {
  id: string;
  score: number;
  round_reached: number;
  played_at: string;
}

export default function LobbyPage() {
  const { user, loading: authLoading } = useAuth();
  const { fetchProfile, fetchLeaderboard } = useGameSync();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      if (user) {
        const profileData = await fetchProfile();
        if (profileData) {
          setProfile(profileData);
        }
      }
      
      const leaderboardData = await fetchLeaderboard(5);
      setLeaderboard(leaderboardData);
      
      setLoading(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, fetchProfile, fetchLeaderboard]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center font-pixel">
        <div className="text-green-400 animate-pulse text-xl">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-green-400 font-pixel p-4 flex flex-col items-center">
      {/* CRT Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Title */}
        <h1 className="text-2xl text-center text-yellow-400 mb-8 mt-8">
          🍀 CLOVER CADIA
        </h1>

        {/* User Profile Card */}
        {user && profile ? (
          <div className="bg-stone-800 border-4 border-white p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-stone-400">PLAYER</div>
                <div className="text-lg text-white">{profile.nickname}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-stone-400">BEST ROUND</div>
                <div className="text-xl text-purple-400">#{profile.best_round}</div>
              </div>
            </div>
            
            {/* Clover Points */}
            <div className="bg-black border-2 border-green-600 p-3 flex items-center justify-between">
              <span className="text-stone-400 text-xs">🍀 CLOVER POINTS</span>
              <span className="text-2xl text-green-400">{profile.meta_currency}</span>
            </div>
          </div>
        ) : (
          <div className="bg-stone-800 border-4 border-white p-6 mb-6 text-center">
            <div className="text-stone-400 mb-4">로그인하여 진행 상황을 저장하세요!</div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 border-2 border-white"
            >
              🔐 LOGIN / SIGN UP
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Link href="/" className="block">
            <button className="w-full bg-green-600 hover:bg-green-500 text-white py-4 border-4 border-white text-lg transition-colors">
              ▶ START GAME
            </button>
          </Link>
          
          {user && (
            <>
              <Link href="/lobby/shop" className="block">
                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 border-4 border-white transition-colors">
                  🛒 SOUL SHOP
                </button>
              </Link>
              <Link href="/lobby/collection" className="block">
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 border-4 border-white transition-colors mt-3">
                  📖 COLLECTION
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-stone-800 border-4 border-white p-4">
          <h2 className="text-center text-yellow-400 mb-4">🏆 TOP PLAYERS</h2>
          
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between bg-black p-2 border border-stone-700"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-stone-300' : 
                      index === 2 ? 'text-orange-400' : 'text-stone-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="text-white text-xs">RD.{entry.round_reached}</span>
                  </div>
                  <span className="text-green-400">{entry.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-stone-500 py-4">
              No records yet...
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
