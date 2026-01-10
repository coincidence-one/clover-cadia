'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import SlotMachine from "./components/SlotMachine";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center retro">
        <p className="text-green-400 text-sm animate-blink">LOADING...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main>
      <SlotMachine />
    </main>
  );
}

