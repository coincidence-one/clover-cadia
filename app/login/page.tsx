'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        if (!nickname.trim()) {
          throw new Error('닉네임을 입력해주세요.');
        }
        const { error } = await signUp(email, password, nickname);
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center retro">
        <p className="text-green-400 text-sm animate-blink">LOADING...</p>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 retro">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-2xl text-center text-green-400 mb-2">
          PIXEL BET
        </h1>
        <p className="text-xs text-center text-gray-500 mb-8">
          ROGUELITE SLOT SURVIVAL
        </p>

        {/* Login Box */}
        <div className="border-4 border-green-500 bg-gray-900 p-6">
          <h2 className="text-lg text-green-400 text-center mb-6">
            {isLoginMode ? '로그인' : '회원가입'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-green-300 mb-1">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border-2 border-green-600 text-green-400 px-3 py-2 text-xs focus:outline-none focus:border-green-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-green-300 mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border-2 border-green-600 text-green-400 px-3 py-2 text-xs focus:outline-none focus:border-green-400"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs text-green-300 mb-1">
                  NICKNAME
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-black border-2 border-green-600 text-green-400 px-3 py-2 text-xs focus:outline-none focus:border-green-400"
                  placeholder="Your nickname"
                  required
                />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-black font-bold py-3 text-sm transition-colors"
            >
              {isSubmitting
                ? 'LOADING...'
                : isLoginMode
                ? 'START GAME'
                : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="text-xs text-gray-400 hover:text-green-400 transition-colors"
            >
              {isLoginMode
                ? '계정이 없으신가요? 회원가입'
                : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-600 text-center mt-4">
          © 2026 PIXEL BET
        </p>
      </div>
    </div>
  );
}
