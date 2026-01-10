'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!nickname.trim()) {
          setError('닉네임을 입력해주세요');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, nickname);
        if (error) throw error;
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-stone-900 border-4 border-white p-6 w-full max-w-sm font-pixel">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-green-400">
            {mode === 'login' ? '🔐 LOGIN' : '✨ SIGN UP'}
          </h2>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-stone-400 text-xs mb-1">NICKNAME</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-black border-2 border-stone-600 p-2 text-green-400 focus:border-green-400 outline-none"
                placeholder="Player1"
                maxLength={20}
              />
            </div>
          )}

          <div>
            <label className="block text-stone-400 text-xs mb-1">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border-2 border-stone-600 p-2 text-green-400 focus:border-green-400 outline-none"
              placeholder="player@game.com"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 text-xs mb-1">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border-2 border-stone-600 p-2 text-green-400 focus:border-green-400 outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs bg-red-900/30 p-2 border border-red-500">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-stone-600 text-white py-3 border-2 border-white transition-colors"
          >
            {loading ? '...' : mode === 'login' ? '▶ ENTER' : '✨ CREATE'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs">
          <span className="text-stone-400">
            {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-yellow-400 hover:text-yellow-300 underline"
          >
            {mode === 'login' ? 'SIGN UP' : 'LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
}
